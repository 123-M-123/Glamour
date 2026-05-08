// lib/googleSheets.ts

// Función auxiliar para convertir links de Drive en links directos de imagen
function getDriveDirectLink(url: string) {
  if (!url || !url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
  const fileId = match ? match[1] : null;
  return fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : url;
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
          id:          row[1]?.toString() || "", // Columna B
          nombre:      row[2]?.toString() || "", // Columna C
          precio:      Math.round(precioExcel * 1.1), // Precio con +10%
          precioTransfer: precioExcel, 
          descripcion: row[4] || "", // Columna E
          imagen:      getDriveDirectLink(row[5] || ""), // Columna F (PROCESADA)
          categoria:   row[6] || "", // Columna G
          stock:       Number(row[7]) || 0, // Columna H
        };
      });
  } catch (error) {
    console.error("Error Sheets El Campito:", error);
    return [];
  }
}