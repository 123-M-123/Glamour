import { getProductsFromSheets } from '@/lib/googleSheets'
import { Metadata } from 'next'
import CatalogoClient from './CatalogoClient'

type Props = { searchParams: { p?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const domain = 'https://glamour-urquiza.vercel.app'
  const ids = searchParams.p?.split(',') || []
  const imageUrl = `${domain}/catalogo-premium/opengraph-image?p=${searchParams.p}`
  
  return {
    title: `Catálogo Glamour Urquiza`,
    description: `Mirá esta selección de ${ids.length} artículos exclusivos.`,
    openGraph: {
      title: 'SELECCIÓN ESPECIAL GLAMOUR 🛍️',
      description: `Piezas elegidas especialmente para vos en Glamour.`,
      url: `${domain}/catalogo-premium?p=${searchParams.p}`,
      siteName: 'Glamour Urquiza',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
  }
}

export default async function CatalogoPremiumPage({ searchParams }: Props) {
  const allProducts = await getProductsFromSheets()
  const ids = searchParams.p?.split(',') || []
  const selectedProducts = allProducts.filter(p => ids.includes(p.id.toString()))

  return <CatalogoClient productos={selectedProducts} />
}