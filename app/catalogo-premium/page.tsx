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
    // 🛡️ CONFIGURACIÓN DE BASE PARA RUTAS ABSOLUTAS
    metadataBase: new URL(domain),
    title: `Catálogo Glamour Urquiza`,
    description: `Catálogo Premium`,
    
    openGraph: {
      // 🎯 IGUALAMOS EL SITE NAME AL QUE SÍ FUNCIONA
      siteName: 'Glamour Urquiza', 
      title: 'Selección Personalizada', // Quitamos emojis para evitar que parezca spam
      description: 'Exclusivo para vos...',
      url: `/catalogo-premium?p=${pParam}&precios=${preParam}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1000,
          alt: 'Selección Glamour'
        },
      ],
      locale: 'es_AR',
      type: 'website',
    },
    
    // 🔥 CONFIGURACIÓN EXTRA PARA WHATSAPP/IOS
    twitter: {
      card: 'summary_large_image',
      title: 'Selección Personalizada',
      description: 'Exclusivo para vos...',
      images: [imageUrl],
    },
    
    // Esto ayuda a que el robot no se pierda en los parámetros
    alternates: {
      canonical: `/catalogo-premium?p=${pParam}`,
    }
  }
}

export default async function CatalogoPremiumPage({ searchParams }: Props) {
  const allProducts = await getProductsFromSheets()
  const ids = (searchParams.p || '').split(',').map(id => id.trim())
  const selectedProducts = allProducts.filter(p => ids.includes(p.id.toString()))

  return <CatalogoClient productos={selectedProducts} />
}