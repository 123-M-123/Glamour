import { Metadata } from 'next'
import { getProductsFromSheets, getBannersFromSheets } from '@/lib/googleSheets'
import AccesoriosClient from './AccesoriosClient'
export const revalidate = 10; // Para que sea instantáneo el cambio
export const metadata: Metadata = {
  title: 'Accesorios | Glamour Urquiza',
  description: 'Completá tu look con nuestra selección de carteras, cinturones y detalles únicos.',
  openGraph: {
    title: 'Accesorios Glamour Urquiza',
    description: 'Detalles que marcan la diferencia en tu outfit diario.',
    url: 'https://glamour-urquiza.vercel.app/accesorios',
    siteName: 'Glamour Urquiza',
    images: [
      {
        url: '/og/image-accesorios.jpg',
        width: 1200,
        height: 630,
        alt: 'Glamour Urquiza - Complementos y Accesorios',
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