import { getProductsFromSheets } from '@/lib/googleSheets'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import CatalogoClient from './CatalogoClient'

type Props = { searchParams: { p?: string, precios?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get('host') || 'glamour-urquiza.vercel.app';
  const domain = `https://${host}`;
  
  const pParam = searchParams.p || '';
  const preParam = searchParams.precios || 'si';
  const imageUrl = `${domain}/catalogo-premium/og?p=${pParam}&precios=${preParam}`;
  
  return {
    title: `Catálogo Glamour`,
    description: `Exclusivo para vos...`,
    openGraph: {
      title: 'SELECCIÓN PERSONALIZADA 🛍️',
      description: `Exclusivo para vos...`,
      url: `${domain}/catalogo-premium?p=${pParam}&precios=${preParam}`,
      siteName: 'Glamour Urquiza', // 👈 Forzamos el nombre de la marca
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1000,
        },
      ],
      type: 'website',
    },
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