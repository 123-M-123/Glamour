import { getProductsFromSheets } from '@/lib/googleSheets'
import { Metadata } from 'next'
import CatalogoClient from './CatalogoClient'

type Props = { searchParams: { p?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const domain = 'https://glamour-urquiza.vercel.app'
  const pParam = searchParams.p || ''
  // 🛡️ Apuntamos al nuevo motor de ruta /og
  const imageUrl = `${domain}/catalogo-premium/og?p=${pParam}`
  
  return {
    title: `Catálogo Glamour Urquiza`,
    description: `Selección exclusiva de productos preparados para vos.`,
    openGraph: {
      title: 'CATÁLOGO PERSONALIZADO 🛍️',
      description: `Mirá las piezas que elegí para vos en Glamour Urquiza.`,
      url: `${domain}/catalogo-premium?p=${pParam}`,
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