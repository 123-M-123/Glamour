'use client'
import { C } from '@/styles/colores'
// import { CarritoProvider, useCarrito } from './context/CarritoContext'
import Header from './components/Header'
import HeroSection from '@/app/components/HeroSection'
import Footer from './components/Footer'



function AppContent() {
  return (
    <div className="app-content">
      
<HeroSection />

       <Footer />

      
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