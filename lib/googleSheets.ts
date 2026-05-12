// C:\Users\Marcos\proyectos ordenados 1y2\glamour-urquiza\lib\googleSheets.ts

function getDriveDirectLink(url: string) {
  if (!url || !url.includes("drive.google.com")) return url;
  // Extrae el ID del archivo sin importar el formato del link
  const match = url.match(/\/d\/(.+?)(?:\/|$)|\/file\/d\/(.+?)\/|id=(.+?)(?:&|$)/);
  const fileId = match ? (match[1] || match[2] || match[3]) : null;
  if (!fileId) return url;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}
// 📧 Lista de emails autorizados (incluimos todos los que vimos en tus fotos)
const SOCIOS_AUTORIZADOS = [
  "gla_142@hotmail.com", 
  "marielabasualdo1985@gmail.com",
  "marcosrenemarti@gmail.com",
  
];

export async function getProductsFromSheets() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = 'Carga de productos!A2:H'; 
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1 } }); 
    const data = await res.json();
    if (!data.values) return [];

    return data.values
      .filter((row: any) => SOCIOS_AUTORIZADOS.includes(row[0]?.trim().toLowerCase()))
      .map((row: any) => ({
        id: row[1]?.toString() || "",
        nombre: row[2]?.toString() || "",
        precio: Math.round((Number(row[3]) || 0) * 1.1),
        precioTransfer: Number(row[3]) || 0,
        descripcion: row[4] || "",
        imagen: getDriveDirectLink(row[5] || ""),
        categoria: row[6] || "",
        stock: Number(row[7]) || 0,
      }));
  } catch (error) { 
    console.error("Error cargando productos:", error);
    return []; 
  }
}

export async function getBannersFromSheets() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  
  // 🔥 FIX CRÍTICO: El nombre de la solapa en tu Excel es 'Baners Publicidad' (con una sola N)
  const range = 'Baners Publicidad!A2:D'; 
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1 } });
    const data = await res.json();
    
    if (!data.values) {
      console.warn("No se encontraron datos en la solapa Baners Publicidad");
      return [];
    }

    return data.values
      .filter((row: any) => SOCIOS_AUTORIZADOS.includes(row[0]?.trim().toLowerCase()))
      .map((row: any) => ({
        imagen: getDriveDirectLink(row[1] || ""),
        ubicacion: row[2]?.toString().toLowerCase().trim() || "",
        linkDestino: row[3] || null
      }));
  } catch (error) { 
    console.error("Error cargando banners:", error);
    return []; 
  }
}