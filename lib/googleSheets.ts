// lib/googleSheets.ts - REEMPLAZAR COMPLETO
import { google } from 'googleapis';
import { slugify } from './utils';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const MASTER_ID = process.env.MASTER_PAYMENTS_SHEET_ID; 
const CLIENT_ID = process.env.CLIENT_CONTENT_SHEET_ID; 

const SOCIOS_AUTORIZADOS = ["gla_142@hotmail.com", "elcampito@gmail.com"];
const ACCESORIOS_EXISTENTES = ['cinturones', 'carteras', 'gorras', 'billeteras', 'sobres-de-fiesta', 'perfuminas', 'chokers', 'porta-celulares', 'panuelos', 'pashminas'];

function getDriveDirectLink(url: string, version: string = "1") {
  if (!url || !url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)(?:\/|$)|\/file\/d\/(.+?)\/|id=(.+?)(?:&|$)/);
  const fileId = match ? (match[1] || match[2] || match[3]) : null;
  if (!fileId) return url;
  return `https://lh3.googleusercontent.com/d/${fileId}=s1000?v=${version}`;
}

export async function getProductsFromSheets() {
  try {
    const range = "'Carga de productos'!A2:O"; 
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: CLIENT_ID, range });
    const rows = response.data.values;
    if (!rows) return [];

    return rows
      .filter((row: any) => row[0] && SOCIOS_AUTORIZADOS.includes(row[0].trim().toLowerCase()))
      .map((row: any) => {
        const precioTransfer = Number(row[3]) || 0;
        const catRaw = row[6]?.toString().trim() || "sin categoría";
        const catSlug = slugify(catRaw.replace('*', ''));
        const esAccesorio = catRaw.startsWith('*') || ACCESORIOS_EXISTENTES.includes(catSlug);
        const principal = getDriveDirectLink(row[5] || "", "1");
        const extras = [row[10], row[11], row[12], row[13], row[14]]
          .filter(url => url && url.includes("drive.google.com"))
          .map(url => getDriveDirectLink(url, "1"));

        return {
          id: row[1]?.toString() || "",
          nombre: row[2]?.toString() || "",
          precio: Math.round(precioTransfer / 0.8),
          precioTransfer: precioTransfer,
          descripcion: row[4] || "",
          imagen: principal,
          galeria: [principal, ...extras],
          categoria: catRaw.replace('*', '').trim(),
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

export async function getBannersFromSheets() {
  try {
    const range = "'Baners Publicidad'!A2:E"; 
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: MASTER_ID, range });
    const rows = response.data.values;
    if (!rows) return [];
    return rows
      .filter((row: any) => row[0] && SOCIOS_AUTORIZADOS.includes(row[0].trim().toLowerCase()))
      .map((row: any) => {
        const urlOriginal = row[1] || "";
        const version = row[4] || "1";
        return {
          imagen: getDriveDirectLink(urlOriginal, version),
          ubicacion: row[2]?.toString().toLowerCase().trim() || "",
          linkDestino: row[3] || null
        };
      });
  } catch (error: any) { 
    console.error("❌ Error en getBannersFromSheets:", error.message);
    return []; 
  }
}

export async function getCategoriesFromSheets() {
  const products = await getProductsFromSheets();
  const uniqueMap = new Map();
  products.forEach(p => {
    if (!uniqueMap.has(p.categoriaSlug)) {
      uniqueMap.set(p.categoriaSlug, { label: p.categoria, slug: p.categoriaSlug, tipo: p.tipo });
    }
  });
  return Array.from(uniqueMap.values());
}

/**
 * ✅ SISTEMA MAESTRO DE 10 COLUMNAS (A-J)
 * Mapeo: Vendedor (A), Fecha (B), Productos (C), Precio (D), Estado (E), ID (F), Notas (G), Nombre (H), WA (I), Entrega (J)
 */
export async function savePaymentToMaster(paymentData: any[]) {
  try {
    // Apuntamos a la pestaña "Pedidos" o "webhoock MP" según definas. 
    // Usaremos 'Pedidos' como estándar, si tu pestaña se llama distinto, cambiar 'Pedidos!A:J'
    const targetRange = 'Pedidos!A:J'; 
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: MASTER_ID,
      range: targetRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [paymentData] },
    });
    return { success: true };
  } catch (error: any) { 
    console.error("❌ Error escribiendo en Google Sheets:", error.message);
    throw error; 
  }
}