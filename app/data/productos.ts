// app/data/productos.ts

export type Producto = {
  id: string
  nombre: string
  precio: number          // Precio con +10% (calculado en lib/googleSheets.ts)
  precioTransfer: number  // Precio real del Excel
  imagen: string
  stock: number
  descripcion?: string
  categoria?: string
}

// Ya no hay lista 'const productos = [...]' aquí. 
// Ahora los datos viajan desde Google Sheets.