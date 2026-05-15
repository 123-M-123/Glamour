'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  if (pathname === '/') return null

  const handleBack = () => {
    if (window.history.length > 1) { router.back() } 
    else { router.push('/') }
  }

  return (
    <button 
      onClick={handleBack}
      style={{
        position: 'fixed',
        bottom: '100px',
        left: '20px',
        zIndex: 200,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0
      }}
    >
      <img 
        src="/icons/atras.png" 
        alt="Volver" 
        style={{ width: '70px', height: 'auto' }} 
      />
    </button>
  )
}