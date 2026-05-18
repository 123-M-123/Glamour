import { google } from 'googleapis';

/**
 * 🔐 CONFIGURACIÓN DEL ROBOT (SERVICE ACCOUNT)
 */
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// IDENTIFICADORES DE PLANILLAS
const MASTER_ID = process.env.MASTER_PAYMENTS_SHEET_ID; 
const CLIENT_ID = process.env.CLIENT_CONTENT_SHEET_ID; 

// Whitelisting: Esto debería venir de lib/clientes.ts en el futuro
const SOCIOS_AUTORIZADOS = [
  "gla_142@hotmail.com",
  "elcampito@gmail.com", // Aseguramos que El Campito esté autorizado
];

/**
 * 🖼️ HELPER: Transformación de links de Drive a Thumbnails de alta calidad
 */
function getDriveDirectLink(url: string) {
  if (!url || !url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)(?:\/|$)|\/file\/d\/(.+?)\/|id=(.+?)(?:&|$)/);
  const fileId = match ? (match[1] || match[2] || match[3]) : null;
  if (!fileId) return url;
  // Usamos el endpoint de thumbnail con sz=w1000 para calidad retina
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/**
 * 📦 PRODUCTOS: Lectura con mapeo estricto A-J
 */
export async function getProductsFromSheets() {
  try {
    const range = "'Carga de productos'!A2:J"; 
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CLIENT_ID, 
      range,
    });

    const rows = response.data.values;
    if (!rows) return [];

    return rows
      .filter((row: any) => row[0] && SOCIOS_AUTORIZADOS.includes(row[0].trim().toLowerCase()))
      .map((row: any) => {
        const precioTransfer = Number(row[3]) || 0;
        // Lógica de precio: En Glamour es /0.8 (20% off). 
        // Si en el futuro cambia por tienda, lo parametrizamos.
        return {
          id: row[1]?.toString() || "",
          nombre: row[2]?.toString() || "",
          precio: Math.round(precioTransfer / 0.8),
          precioTransfer: precioTransfer,
          descripcion: row[4] || "",
          imagen: getDriveDirectLink(row[5] || ""),
          categoria: row[6]?.toString().toLowerCase().trim() || "sin categoría", // Columna G
          stock: Number(row[7]) || 0,        // Columna H
          talles: row[8] || "",             // Columna I
          colores: row[9] || "",            // Columna J
        };
      });
  } catch (error: any) {
    console.error("❌ Error en getProductsFromSheets:", error.message);
    return [];
  }
}

/**
 * 📂 CATEGORÍAS DINÁMICAS: Extrae categorías únicas de la planilla
 */
export async function getCategoriesFromSheets() {
  const products = await getProductsFromSheets();
  const categories = products.map(p => p.categoria);
  // Retornamos solo valores únicos y capitalizados para la UI
  return [...new Set(categories)].filter(Boolean);
}

/**
 * 🚩 BANNERS: Desde la Planilla Maestra
 */
export async function getBannersFromSheets() {
  try {
    const range = "'Baners Publicidad'!A2:D"; 
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: MASTER_ID, 
      range,
    });

    const rows = response.data.values;
    if (!rows) return [];

    return rows
      .filter((row: any) => row[0] && SOCIOS_AUTORIZADOS.includes(row[0].trim().toLowerCase()))
      .map((row: any) => ({
        imagen: getDriveDirectLink(row[1] || ""),
        ubicacion: row[2]?.toString().toLowerCase().trim() || "",
        linkDestino: row[3] || null
      }));
  } catch (error: any) {
    console.error("❌ Error en getBannersFromSheets:", error.message);
    return [];
  }
}

/**
 * 💰 REGISTRO DE PAGOS: En Planilla Maestra (Pestaña Pagos)
 */
export async function savePaymentToMaster(paymentData: any[]) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: MASTER_ID,
      range: 'Pagos!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [paymentData],
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error("❌ Error guardando pago en Maestra:", error.message);
    throw error;
  }
}