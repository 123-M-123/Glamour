import { getProductsFromSheets, getBannersFromSheets } from '@/lib/googleSheets'
import CategoryClient from './CategoryClient'
import { Metadata } from 'next'

type Props = {
  params: { category: string }
  searchParams: { p?: string }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const categoryName = params.category.charAt(0).toUpperCase() + params.category.slice(1)
  const productos = await getProductsFromSheets()
  const productoId = searchParams.p
  const producto = productos.find(p => p.id.toString() === productoId)

  if (producto) {
    return {
      title: `${producto.nombre} | Glamour`,
      description: producto.descripcion || `Vestite con estilo.`,
      openGraph: {
        title: producto.nombre,
        description: `$${producto.precioTransfer} - ${producto.descripcion || 'Glamour'}`,
        siteName: 'Glamour', // 👈 CLAVE: Esto ayuda a limpiar el link en WhatsApp
        images: [{ url: producto.imagen, width: 800, height: 800 }],
        type: 'website',
      },
    }
  }

  return {
    title: `${categoryName} | Glamour`,
    description: `Explorá nuestra colección exclusiva.`,
    openGraph: {
      siteName: 'Glamour',
      images: ['/og/image-2.jpg'],
    }
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [productos, banners] = await Promise.all([
    getProductsFromSheets(),
    getBannersFromSheets()
  ])

  return (
    <CategoryClient 
      category={params.category} 
      productos={productos} 
      banners={banners}
      searchParams={searchParams} // 👈 Pasamos los parámetros al cliente
    />
  )
}