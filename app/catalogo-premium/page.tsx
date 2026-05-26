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
  
  // 📸 Generamos la URL de la imagen (Aseguramos que sea absoluta y limpia)
  const imageUrl = `${domain}/catalogo-premium/og?p=${pParam}&precios=${preParam}`;
  const pageUrl = `${domain}/catalogo-premium?p=${pParam}&precios=${preParam}`;

  const cleanTitle = "Glamour Urquiza"; // 🎯 EL NOMBRE DE TU MARCA
  const shareTitle = "Selección Personalizada 🛍️";

  return {
    // 🛡️ 1. BASE DE METADATOS (Sin barra al final)
    metadataBase: new URL(domain),
    title: cleanTitle,
    description: "Catálogo exclusivo para vos...",
    
    // 🛡️ 2. ESTO ES LO QUE WHATSAPP MIRA PARA EL LINK CORTO
    openGraph: {
      siteName: cleanTitle, // Debe ser idéntico al que funciona
      title: shareTitle,
      description: "Hacé clic para ver los productos seleccionados.",
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1000,
          type: 'image/png', // 👈 Forzamos el tipo
        },
      ],
      locale: 'es_AR',
      type: 'article', // 👈 Cambiamos website por article (a veces fuerza el link limpio)
    },

    // 🛡️ 3. SOPORTE PARA IPHONE/WHATSAPP IOS
    appleWebApp: {
      title: cleanTitle,
      statusBarStyle: 'default',
    },

    // 🛡️ 4. TWITTER CARD (WhatsApp lo usa como respaldo)
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: "Catálogo exclusivo",
      images: [imageUrl],
    },

    // 🛡️ 5. CANONICAL (Para que no intente leer los parámetros largos como parte del dominio)
    alternates: {
      canonical: domain, 
    }
  }
}

export default async function CatalogoPremiumPage({ searchParams }: Props) {
  const allProducts = await getProductsFromSheets()
  const ids = (searchParams.p || '').split(',').map(id => id.trim())
  const selectedProducts = allProducts.filter(p => ids.includes(p.id.toString()))

  return <CatalogoClient productos={selectedProducts} />
}