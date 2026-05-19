import { getProductsFromSheets } from '@/lib/googleSheets'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import CatalogoClient from './CatalogoClient'

type Props = { searchParams: { p?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // 🛡️ DETECCIÓN DINÁMICA DEL HOST (Para que funcione en ramas de prueba y en producción)
  const headersList = headers();
  const host = headersList.get('host') || 'glamour-urquiza.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const domain = `${protocol}://${host}`;
  
  const pParam = searchParams.p || '';
  // 🔗 El link de la imagen ahora siempre apuntará a la URL de la rama actual
  const imageUrl = `${domain}/catalogo-premium/og?p=${pParam}`;
  
  return {
    title: `Catálogo Glamour Urquiza`,
    description: `Selección exclusiva de productos.`,
    openGraph: {
      title: 'CATÁLOGO PERSONALIZADO 🛍️',
      description: `Exclusivo para vos...`,
      url: `${domain}/catalogo-premium?p=${pParam}`,
      siteName: 'Glamour Urquiza',
      images: [
        {
          url: imageUrl, // 👈experimento -- Link dinámico corregido
          width: 1200,
          height: 1000,// 👈experimento --
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