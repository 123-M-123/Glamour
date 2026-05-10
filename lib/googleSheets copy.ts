// C:\Users\Marcos\proyectos ordenados 1y2\el-campito\lib\googleSheets.ts

function getDriveDirectLink(url: string) {
  if (!url || !url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
  const fileId = match ? match[1] : null;
  if (!fileId) return url;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

export async function getProductsFromSheets() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sociosElCampito = ["elianamarti90@gmail.com", "exequiel.devita@gmail.com"];
  const range = 'Carga de productos!A2:H'; 
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1 } }); 
    const data = await res.json();
    if (!data.values) return [];
    return data.values
      .filter((row: any) => sociosElCampito.includes(row[0]?.trim().toLowerCase()))
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
  } catch (error) { return []; }
}

export async function getBannersFromSheets() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sociosElCampito = ["elianamarti90@gmail.com", "exequiel.devita@gmail.com"];
  const range = 'Banners Publicidad!A2:D'; 
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1 } });
    const data = await res.json();
    if (!data.values) return [];
    return data.values
      .filter((row: any) => sociosElCampito.includes(row[0]?.trim().toLowerCase()))
      .map((row: any) => ({
        imagen: getDriveDirectLink(row[1] || ""),
        ubicacion: row[2]?.toString().toLowerCase() || "",
        linkDestino: row[3] || null
      }));
  } catch (error) { return []; }
}