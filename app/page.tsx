'use client'
import { C } from '@/styles/colores'
// import { CarritoProvider, useCarrito } from './context/CarritoContext'
import Header from './components/Header'
import HeroSection from '@/app/components/HeroSection'




function AppContent() {
  return (
    <div className="app-content">
      
<HeroSection />

      

      
    </div>
  )
}

export default function Home() {
  return (
    <>
      {/* <CarritoProvider> */}
      <AppContent />
      {/* </CarritoProvider> */}
    </>
  )
}