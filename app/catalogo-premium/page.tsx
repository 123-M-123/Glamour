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
  const pageUrl = `${domain}/catalogo-premium?p=${pParam}&precios=${preParam}`;

  const brandName = "Glamour"; 
  const mainTitle = "Ahora Tienda On line";
  const subTitle = "Seleccion personalizada para vos..";

  return {
    metadataBase: new URL(domain),
    title: brandName,
    
    openGraph: {
      siteName: brandName, 
      title: mainTitle, 
      description: subTitle, 
      url: domain, // 👈 TRUCO: Apuntamos al dominio base en el OG para limpiar la vista
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1000,
          type: 'image/jpeg', 
        },
      ],
      locale: 'es_AR',
      type: 'website',
    },

    // 🛡️ Esto fuerza a los navegadores a confiar en el contenido
    alternates: {
      canonical: pageUrl,
    },

    twitter: {
      card: 'summary_large_image',
      title: mainTitle,
      description: subTitle,
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