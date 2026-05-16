import { google } from 'googleapis';

// 1. CONFIGURACIÓN DEL ROBOT (JSON)
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 2. IDENTIFICADORES DE PLANILLAS
const MASTER_ID = process.env.MASTER_PAYMENTS_SHEET_ID; // 👈 TU planilla (Maestra)
const CLIENT_ID = process.env.CLIENT_CONTENT_SHEET_ID; // 👈 Planilla de Glamour

const SOCIOS_AUTORIZADOS = [
  "gla_142@hotmail.com", 
];

// Helper para links de Drive
function getDriveDirectLink(url: string) {
  if (!url || !url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)(?:\/|$)|\/file\/d\/(.+?)\/|id=(.+?)(?:&|$)/);
  const fileId = match ? (match[1] || match[2] || match[3]) : null;
  if (!fileId) return url;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/**
 * PRODUCTOS: Siguen en la planilla del CLIENTE
 */
export async function getProductsFromSheets() {
  try {
    const range = "'Carga Productos'!A2:J"; 
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CLIENT_ID, // 👈 CLIENTE
      range,
    });

    const rows = response.data.values;
    if (!rows) return [];

    return rows
      .filter((row: any) => SOCIOS_AUTORIZADOS.includes(row[0]?.trim().toLowerCase()))
      .map((row: any) => {
        const precioTransfer = Number(row[3]) || 0;
        return {
          id: row[1]?.toString() || "",
          nombre: row[2]?.toString() || "",
          precio: Math.round(precioTransfer / 0.8),
          precioTransfer: precioTransfer,
          descripcion: row[4] || "",
          imagen: getDriveDirectLink(row[5] || ""),
          categoria: row[6]?.toString().toLowerCase().trim() || "",
          stock: Number(row[7]) || 0,
          talles: row[8] || "",
          colores: row[9] || "",
        };
      });
  } catch (error: any) {
    console.error("Error en getProductsFromSheets:", error.message);
    return [];
  }
}

/**
 * BANNERS: Vuelven a tu planilla MAESTRA
 */
export async function getBannersFromSheets() {
  try {
    // 🔥 IMPORTANTE: Ahora usamos MASTER_ID
    const range = "'Baners Publicidad'!A2:D"; 
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: MASTER_ID, // 👈 CAMBIADO A MASTER_ID
      range,
    });

    const rows = response.data.values;
    if (!rows) return [];

    return rows
      .filter((row: any) => SOCIOS_AUTORIZADOS.includes(row[0]?.trim().toLowerCase()))
      .map((row: any) => ({
        imagen: getDriveDirectLink(row[1] || ""),
        ubicacion: row[2]?.toString().toLowerCase().trim() || "",
        linkDestino: row[3] || null
      }));
  } catch (error: any) {
    console.error("Error en getBannersFromSheets:", error.message);
    return [];
  }
}

/**
 * ESCRITURA DE PAGOS: En tu planilla MAESTRA
 */
export async function savePaymentToMaster(paymentData: any[]) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: MASTER_ID, // 👈 MASTER
      range: 'Pagos!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [paymentData],
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error guardando pago en Maestra:", error.message);
    throw error;
  }
}