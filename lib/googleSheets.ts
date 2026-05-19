import { google } from 'googleapis';
import { slugify } from './utils';

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

// Whitelisting
const SOCIOS_AUTORIZADOS = [
  "gla_142@hotmail.com",
  "elcampito@gmail.com",
];

// 🛡️ DICCIONARIO DE PROTECCIÓN: Para que no tengas que poner "*" a lo que ya existe
const ACCESORIOS_EXISTENTES = [
  'cinturones', 'carteras', 'gorras', 'billeteras', 'sobres-de-fiesta', 
  'perfuminas', 'chokers', 'porta-celulares', 'panuelos', 'pashminas'
];

/**
 * 🖼️ HELPER: Transformación de links de Drive a Thumbnails de alta calidad
 */
function getDriveDirectLink(url: string) {
  if (!url || !url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)(?:\/|$)|\/file\/d\/(.+?)\/|id=(.+?)(?:&|$)/);
  const fileId = match ? (match[1] || match[2] || match[3]) : null;
  if (!fileId) return url;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/**
 * 📦 PRODUCTOS: Lectura con mapeo estricto e identificación Híbrida
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
        const catRaw = row[6]?.toString().trim() || "sin categoría";
        const catSlug = slugify(catRaw.replace('*', ''));

        // 🛡️ LÓGICA HÍBRIDA:
        // Es accesorio si: empieza con "*" O ya está en nuestra lista histórica
        const esAccesorio = catRaw.startsWith('*') || ACCESORIOS_EXISTENTES.includes(catSlug);
        const categoriaLimpia = catRaw.replace('*', '').trim();

        return {
          id: row[1]?.toString() || "",
          nombre: row[2]?.toString() || "",
          precio: Math.round(precioTransfer / 0.8),
          precioTransfer: precioTransfer,
          descripcion: row[4] || "",
          imagen: getDriveDirectLink(row[5] || ""),
          categoria: categoriaLimpia,
          categoriaSlug: catSlug,
          tipo: esAccesorio ? 'accesorios' : 'indumentaria',
          stock: Number(row[7]) || 0,
          talles: row[8] || "",
          colores: row[9] || "",
        };
      });
  } catch (error: any) {
    console.error("❌ Error en getProductsFromSheets:", error.message);
    return [];
  }
}

/**
 * 📂 CATEGORÍAS DINÁMICAS
 */
export async function getCategoriesFromSheets() {
  const products = await getProductsFromSheets();
  const uniqueMap = new Map();
  
  products.forEach(p => {
    if (!uniqueMap.has(p.categoriaSlug)) {
      uniqueMap.set(p.categoriaSlug, {
        label: p.categoria,
        slug: p.categoriaSlug,
        tipo: p.tipo
      });
    }
  });
  
  return Array.from(uniqueMap.values());
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
 * 💰 REGISTRO DE PAGOS: En Planilla Maestra
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