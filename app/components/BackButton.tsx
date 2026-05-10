'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Heart, ChevronLeft } from 'lucide-react' // Iconos modernos
import { C } from '@/styles/colores' // Usamos tu paleta centralizada

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  // 🚫 NO mostrar en HOME
  if (pathname === '/') return null

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '30px', // Un poco más abajo para no tapar contenido
        left: '20px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onClick={handleBack}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Corazón Rojo de fondo */}
        <Heart 
          size={70} 
          fill={C.primary} 
          color={C.primary} 
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}
        />
        
        {/* Contenido encima del corazón */}
        <div style={{ 
          position: 'absolute', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          marginTop: '-5px' // Ajuste fino visual
        }}>
          <ChevronLeft size={24} color="white" strokeWidth={3} />
          <span style={{ 
            color: 'white', 
            fontSize: '10px', 
            fontWeight: 'bold', 
            fontFamily: 'var(--font-geist-sans)' 
          }}>
            VOLVER
          </span>
        </div>
      </div>
    </div>
  )
}