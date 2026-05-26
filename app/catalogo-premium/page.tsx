import { getProductsFromSheets } from '@/lib/googleSheets'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import CatalogoClient from './CatalogoClient'

type Props = { searchParams: { p?: string, precios?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // 🛡️ DETECCIÓN DINÁMICA DEL HOST
  const headersList = headers();
  const host = headersList.get('host') || 'glamour-urquiza.vercel.app';
  const domain = `https://${host}`;
  
  const pParam = searchParams.p || '';
  const preParam = searchParams.precios || 'si';
  const imageUrl = `${domain}/catalogo-premium/og?p=${pParam}&precios=${preParam}`;
  
  return {
    title: `Catálogo Glamour`,
    description: `Exclusivo para vos...`, // 👈 CAMBIO: Texto corto para la previsualización
    openGraph: {
      title: 'SELECCIÓN PERSONALIZADA 🛍️',
      description: `Exclusivo para vos...`, // 👈 CAMBIO: Forzamos el texto corto en Meta/WhatsApp
      url: `${domain}/catalogo-premium?p=${pParam}&precios=${preParam}`,
      siteName: 'Glamour',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1000,
        },
      ],
      type: 'website',
    },
    // 🛡️ Evitamos que herede textos largos de otros layouts
    twitter: {
      card: 'summary_large_image',
      title: 'SELECCIÓN PERSONALIZADA 🛍️',
      description: 'Exclusivo para vos...',
      images: [imageUrl],
    }
  }
}

export default async function CatalogoPremiumPage({ searchParams }: Props) {
  const allProducts = await getProductsFromSheets()
  const ids = (searchParams.p || '').split(',').map(id => id.trim())
  const selectedProducts = allProducts.filter(p => ids.includes(p.id.toString()))

  return <CatalogoClient productos={selectedProducts} />
}