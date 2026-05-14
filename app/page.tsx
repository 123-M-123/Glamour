import { getBannersFromSheets } from '@/lib/googleSheets'
import HeroSection from '@/app/components/HeroSection'

export default async function Home() {
  // Pedimos los datos directamente en el servidor
  // Esto es mucho mejor para el SEO y la velocidad inicial
  const banners = await getBannersFromSheets()

  return (
    <div className="app-content">
      {/* 
          Le pasamos los banners al Hero. 
          Recordá que Header y Footer ya deberían estar en layout.tsx 
          para que sean globales.
      */}
      <HeroSection banners={banners} />
    </div>
  )
}