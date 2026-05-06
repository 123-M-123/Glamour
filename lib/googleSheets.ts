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
    vendedor:    row[0], // A
    id_producto: row[1], // B
    titulo:      row[2], // C
    precio:      Number(row[3]), // D
    descripcion: row[4], // E
    imagen:      row[5], // F
    categoria:   row[6], // G
    stock:       Number(row[7] || 0), // H (¡NUEVO!)
  }));
  } catch (error) {
    console.error("Error Sheets:", error);
    return [];
  }
}