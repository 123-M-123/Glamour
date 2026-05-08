export async function getProductsFromSheets() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sociosElCampito = ["elianamarti90@gmail.com", "exequiel.devita@gmail.com"];
  const range = 'Carga de productos!A2:H'; 

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { 
      next: { revalidate: 1 } // ACTUALIZACIÓN INSTANTÁNEA (1 segundo)
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
          precioTransfer: precioExcel, // Precio real del Excel
          descripcion: row[4] || "", // Columna E
          imagen:      row[5] || "", // Columna F
          categoria:   row[6] || "", // Columna G
          stock:       Number(row[7]) || 0, // Columna H
        };
      });
  } catch (error) {
    console.error("Error Sheets El Campito:", error);
    return [];
  }
}