import { Metadata } from 'next'
import { getProductsFromSheets, getBannersFromSheets } from '@/lib/googleSheets'
import AccesoriosClient from './AccesoriosClient'
export const revalidate = 1; // Para que sea instantáneo el cambio
export const metadata: Metadata = {
  title: 'Accesorios | Glamour',
  description: 'Completá tu look con nuestra selección de carteras, cinturones y detalles únicos.',
  openGraph: {
    title: 'Accesorios Glamour',
    description: 'Detalles que marcan la diferencia en tu outfit diario.',
    url: 'https://glamour-urquiza.vercel.app/accesorios',
    siteName: 'Glamour',
    images: [
      {
        url: '/og/image-accesorios.jpg',
        width: 1200,
        height: 630,
        alt: 'Glamour - Complementos y Accesorios',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
}

export default async function AccesoriosPage() {
  const [productos, banners] = await Promise.all([
    getProductsFromSheets(),
    getBannersFromSheets()
  ])

  return <AccesoriosClient productos={productos} banners={banners} />
}