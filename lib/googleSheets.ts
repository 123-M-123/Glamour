export async function getProductsFromSheets() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const vendedorEmail = "elianamarti90@gmail.com";
  const range = 'Carga de productos!A2:G'; // Vendedor en A, ID en B

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache de 1 hora
    const data = await res.json();
    
    // FILTRAMOS: Solo los productos que pertenecen a El Campito
    return (data.values || [])
      .filter((row: any) => row[0]?.trim().toLowerCase() === vendedorEmail.toLowerCase())
      .map((row: any) => ({
        id_producto: row[1],
        titulo:      row[2],
        precio:      Number(row[3]),
        descripcion: row[4],
        imagen:      row[5],
        categoria:   row[6],
      }));
  } catch (error) {
    console.error("Error Sheets:", error);
    return [];
  }
}