// lib/googleSheets.ts

// Función mejorada y más estable para links de Drive
function getDriveDirectLink(url: string) {
  if (!url || !url.includes("drive.google.com")) return url;
  
  // Extraemos el ID del archivo sin importar el formato del link de Drive
  const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
  const fileId = match ? match[1] : null;
  
  if (!fileId) return url;

  // Usamos el endpoint de thumbnail que es mucho más fiable para etiquetas <img>
  // sz=w1000 pide la imagen en buena calidad (hasta 1000px)
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

export async function getProductsFromSheets() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sociosElCampito = ["elianamarti90@gmail.com", "exequiel.devita@gmail.com"];
  const range = 'Carga de productos!A2:H'; 

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { 
      next: { revalidate: 1 } 
    }); 
    const data = await res.json();
    
    if (!data.values) return [];

    return data.values
      .filter((row: any) => {
        const mailEnFila = row[0]?.trim().toLowerCase();
        return sociosElCampito.includes(mailEnFila);
      })
      .map((row: any) => {
        const precioExcel = Number(row[3]) || 0;
        return {
          id:          row[1]?.toString() || "",
          nombre:      row[2]?.toString() || "",
          precio:      Math.round(precioExcel * 1.1),
          precioTransfer: precioExcel, 
          descripcion: row[4] || "",
          imagen:      getDriveDirectLink(row[5] || ""), // Aquí aplicamos la nueva lógica
          categoria:   row[6] || "",
          stock:       Number(row[7]) || 0,
        };
      });
  } catch (error) {
    console.error("Error Sheets El Campito:", error);
    return [];
  }
}