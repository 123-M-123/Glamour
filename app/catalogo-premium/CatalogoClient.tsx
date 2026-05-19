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
    <div style={{ background: '#FFF8F8', minHeight: '100vh', paddingBottom: '100px' }}>
      <div className={styles.container} style={{ paddingTop: '40px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="/icons/logo-no.png" alt="Logo" style={{ height: '60px', marginBottom: '15px' }} />
          <h1 style={{ fontWeight: 950, color: '#FF0000', fontSize: '1.6rem', margin: 0 }}>CATÁLOGO PERSONALIZADO</h1>
          <p style={{ color: '#9A9690', fontSize: '0.9rem', marginTop: '5px' }}>Elegí el talle y color de tus prendas favoritas</p>
        </header>

        <div className={styles.grid}>
          {productos.map((item) => (
            <div key={item.id} className={styles.card} onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
              <div className={styles.imageWrapper}>
                <img src={item.imagen} alt={item.nombre} className={styles.image} />
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{item.nombre.toLowerCase()}</h3>
                <p className={styles.price}>$ {new Intl.NumberFormat('es-AR').format(item.precioTransfer)}</p>
                <button className={styles.addCartBtn}>
                  <ShoppingBag size={14} /> VER DETALLES
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: '50px', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#FF0000', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={18} /> IR A LA TIENDA COMPLETA
          </Link>
        </footer>
      </div>

      {/* 🛒 BOTÓN FLOTANTE DE CIERRE DE VENTA */}
      {totalItems > 0 && (
        <Link href="/checkout" style={{ textDecoration: 'none' }}>
          <div style={{
            position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
            background: '#FF0000', color: 'white', padding: '15px 30px', borderRadius: '50px',
            display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 15px 30px rgba(255,0,0,0.3)',
            zIndex: 1000, fontWeight: 900, width: '90%', maxWidth: '400px', justifyContent: 'center'
          }}>
            <ShoppingBag size={22} />
            FINALIZAR COMPRA ({totalItems})
          </div>
        </Link>
      )}

      {/* TU MODAL ORIGINAL CON Talles, Colores y Stock */}
      <ProductModal 
        open={!!selected} 
        producto={selected} 
        onClose={() => setSelected(null)} 
      />
    </div>
  )
}