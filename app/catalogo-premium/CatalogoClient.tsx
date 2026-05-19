'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import ProductModal from '../components/ProductModal'
import styles from '../wishlist/wishlist.module.css'

export default function CatalogoClient({ productos }: { productos: any[] }) {
  const [selected, setSelected] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)
  const { items } = useCartStore()
  
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0)

  return (
    <div style={{ background: '#FF0000', minHeight: '100vh', paddingBottom: '160px' }}>
      <div className={styles.container} style={{ paddingTop: '40px', background: 'transparent' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/icons/logo-no.png" alt="Logo" style={{ height: '85px', marginBottom: '20px' }} />
          <h1 style={{ fontWeight: 950, color: 'white', fontSize: '1.8rem', margin: 0, letterSpacing: '1px' }}>CATÁLOGO PERSONALIZADO</h1>
          <div style={{ background: 'white', color: '#FF0000', padding: '8px 25px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 900, marginTop: '20px' }}>
            SELECCIÓN EXCLUSIVA PARA VOS
          </div>
        </header>

        <div className={styles.grid}>
          {productos.map((item) => (
            <div key={item.id} className={styles.card} onClick={() => setSelected(item)} 
                 style={{ 
                   cursor: 'pointer', background: 'white', border: 'none', 
                   boxShadow: '0 15px 40px rgba(255,255,255,0.3)' 
                 }}>
              <div className={styles.imageWrapper}>
                <img src={item.imagen} alt={item.nombre} className={styles.image} />
              </div>
              <div className={styles.info} style={{ background: 'white', padding: '10px' }}>
                <h3 className={styles.name} style={{ color: '#000', fontSize: '12px' }}>{item.nombre.toLowerCase()}</h3>
                <p className={styles.price} style={{ color: '#FF0000', fontSize: '16px' }}>$ {new Intl.NumberFormat('es-AR').format(item.precioTransfer)}</p>
                <button className={styles.addCartBtn} style={{ background: '#FF0000', color: 'white', border: 'none', width: '100%', height: '35px' }}>
                  <ShoppingBag size={14} /> VER DETALLES
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: '60px', textAlign: 'center' }}>
          <Link href="/" style={{ 
            background: 'white', color: '#FF0000', padding: '15px 35px', borderRadius: '50px', 
            fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', 
            gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
          }}>
            <ArrowLeft size={20} /> IR A LA TIENDA COMPLETA
          </Link>
        </footer>
      </div>

      {/* 🛒 BOTÓN FINALIZAR COMPRA (Subido para no tapar footer ni botones flotantes) */}
      {totalItems > 0 && (
        <Link href="/checkout" style={{ textDecoration: 'none' }}>
          <div style={{
            position: 'fixed', bottom: '120px', left: '50%', transform: 'translateX(-50%)',
            background: 'white', color: '#FF0000', padding: '20px 40px', borderRadius: '50px',
            display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            zIndex: 5000, fontWeight: 950, width: '85%', maxWidth: '380px', justifyContent: 'center',
            border: '4px solid #FF0000', fontSize: '1.2rem'
          }}>
            <ShoppingBag size={28} />
            FINALIZAR COMPRA ({totalItems})
          </div>
        </Link>
      )}

      <ProductModal open={!!selected} producto={selected} onClose={() => setSelected(null)} />
    </div>
  )
}