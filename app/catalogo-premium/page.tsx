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

  // 🎯 TEXTOS SIMÉTRICOS SOLICITADOS
  const brandName = "Glamour"; 
  const mainTitle = "Ahora Tienda On line";
  const subTitle = "Seleccion personalizada para vos..";

  return {
    metadataBase: new URL(domain),
    title: mainTitle,
    description: subTitle,
    
    openGraph: {
      siteName: brandName, 
      title: mainTitle, // 👈 Ahora Tienda On line
      description: subTitle, // 👈 Seleccion personalizada para vos..
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1000,
          type: 'image/jpeg', 
        },
      ],
      locale: 'es_AR',
      type: 'article',
    },

    alternates: {
      canonical: domain, 
    },

    twitter: {
      card: 'summary_large_image',
      title: mainTitle,
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