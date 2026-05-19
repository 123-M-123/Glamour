import { getProductsFromSheets } from '@/lib/googleSheets'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import CatalogoClient from './CatalogoClient'

type Props = { searchParams: { p?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // 🛡️ MAGIA SENIOR: Detectamos el host real de la rama donde estamos parados
  const headersList = headers();
  const host = headersList.get('host') || 'glamour-urquiza.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const domain = `${protocol}://${host}`;
  
  const pParam = searchParams.p || '';
  const imageUrl = `${domain}/catalogo-premium/og?p=${pParam}`;
  
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
  const ids = (searchParams.p || '').split(',').map(id => id.trim())
  const selectedProducts = allProducts.filter(p => ids.includes(p.id.toString()))

  return <CatalogoClient productos={selectedProducts} />
}