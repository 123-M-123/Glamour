import { getProductsFromSheets, getBannersFromSheets } from '@/lib/googleSheets'
import CategoryClient from './CategoryClient'
import { Metadata } from 'next'

type Props = {
  params: { category: string }
  searchParams: { p?: string } // 👈 Capturamos el ID del producto que viene en el link
}

// 🪄 ESTA ES LA FUNCIÓN QUE LEE WHATSAPP/INSTAGRAM
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const categoryName = params.category.charAt(0).toUpperCase() + params.category.slice(1)
  
  // 1. Buscamos los productos para ver si se está compartiendo uno específico
  const productos = await getProductsFromSheets()
  const productoId = searchParams.p
  const producto = productos.find(p => p.id.toString() === productoId)

  // 2. Si el link tiene un producto (?p=...), mostramos SU foto y SU nombre
  if (producto) {
    return {
      title: `${producto.nombre} | Glamour Urquiza`,
      description: producto.descripcion || `Vistite con estilo. Mirá este artículo de ${categoryName}.`,
      openGraph: {
        title: producto.nombre,
        description: `$${producto.precioTransfer} - ${producto.descripcion || 'Glamour Urquiza'}`,
        images: [
          {
            url: producto.imagen, // 👈 LA FOTO DEL PRODUCTO REAL
            width: 800,
            height: 800,
          },
        ],
        type: 'website',
      },
    }
  }

  // 3. Si es el link de la categoría normal, mostramos tu card genérica
  return {
    title: `${categoryName} | Glamour Urquiza`,
    description: `Explorá nuestra colección exclusiva de ${categoryName} en Glamour Urquiza.`,
    openGraph: {
      images: ['/og/image-2.jpg'], // 👈 TU CARD GENÉRICA
    }
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = params
  
  const [productos, banners] = await Promise.all([
    getProductsFromSheets(),
    getBannersFromSheets()
  ])

  return (
    <CategoryClient 
      category={category} 
      productos={productos} 
      banners={banners} 
    />
  )
}