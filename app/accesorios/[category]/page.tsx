import { getProductsFromSheets, getBannersFromSheets } from '@/lib/googleSheets'
import CategoryClient from './CategoryClient'
import { Metadata } from 'next'

type Props = {
  params: { category: string }
}

// SEO Dinámico para cada categoría
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryName = params.category.charAt(0).toUpperCase() + params.category.slice(1)
  return {
    title: `${categoryName} | Glamour Urquiza`,
    description: `Explorá nuestra colección exclusiva de ${categoryName} en Glamour Urquiza.`
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = params
  
  // Pedimos los datos (con el revalidate: 1 que ya configuramos)
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