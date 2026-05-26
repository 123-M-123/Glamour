import { Metadata } from 'next'
import { getProductsFromSheets, getBannersFromSheets } from '@/lib/googleSheets'
import IndumentariaClient from './IndumentariaClient'
export const revalidate = 1; // Para que sea instantáneo el cambio
export const metadata: Metadata = {
  title: 'Indumentaria | Glamour',
  description: 'Explorá nuestras categorías de moda femenina con estilo y actitud. Encontrá lo último en tendencia.',
  openGraph: {
    title: 'Indumentaria Glamour',
    description: 'Colecciones exclusivas pensadas para resaltar tu esencia.',
    url: 'https://glamour-urquiza.vercel.app/indumentaria',
    siteName: 'Glamour',
    images: [
      {
        url: '/og/image-indumentaria.jpg',
        width: 1200,
        height: 630,
        alt: 'Glamour - Colección Indumentaria',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
}

export default async function IndumentariaPage() {
  const [productos, banners] = await Promise.all([
    getProductsFromSheets(),
    getBannersFromSheets()
  ])

  return <IndumentariaClient productos={productos} banners={banners} />
}