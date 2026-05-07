export async function getProductsFromSheets() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sociosElCampito = ["elianamarti90@gmail.com", "exequiel.devita@gmail.com"];
  // Rango ampliado a H para incluir el Stock
  const range = 'Carga de productos!A2:H'; 

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } }); 
    const data = await res.json();
    
    if (!data.values) return [];

    return data.values
  .filter((row: any) => {
    const mailEnFila = row[0]?.trim().toLowerCase();
    // Verificamos si el mail de la fila es de cualquiera de los dos socios
    return sociosElCampito.includes(mailEnFila);
  })
  .map((row: any) => ({
        vendedor:    row[0], // A
        id_producto: row[1], // B
        titulo:      row[2], // C
        precio:      Number(row[3]) || 0, // D
        descripcion: row[4] || "", // E
        imagen:      row[5] || "", // F
        categoria:   row[6] || "", // G
        stock:       Number(row[7]) || 0, // H
      }));
  } catch (error) {
    console.error("Error Sheets El Campito:", error);
    return [];
  }
}