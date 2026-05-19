import { getProductsFromSheets } from '@/lib/googleSheets'
import { Metadata } from 'next'
import CatalogoClient from './CatalogoClient'

type Props = { searchParams: { p?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const ids = searchParams.p?.split(',') || []
  const baseUrl = 'https://glamour-urquiza.vercel.app';
  
  return {
    title: `Catálogo Glamour - Selección Especial`,
    description: `Mirá estos ${ids.length} productos exclusivos elegidos para vos.`,
    openGraph: {
      title: 'TU SELECCIÓN GLAMOUR 🛍️',
      description: `Elegí tus favoritos de esta lista personalizada.`,
      url: `${baseUrl}/catalogo-premium?p=${searchParams.p}`,
      images: [
        {
          url: `${baseUrl}/catalogo-premium/opengraph-image?p=${searchParams.p}`,
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
  const selectedProducts = allProducts.filter(p => ids.includes(p.id))

  return (
    <CatalogoClient productos={selectedProducts} />
  )
}