'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Share2 } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import ProductModal from '../components/ProductModal'
import styles from '../wishlist/wishlist.module.css'

export default function CatalogoClient({ productos }: { productos: any[] }) {
  const [selected, setSelected] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)
  const { items } = useCartStore()
  
  useEffect(() => { setMounted(true) }, [])

  // ... (mantené tus imports y lógica inicial igual)

  const handleShareSelection = async () => {
    const url = window.location.href;
    const title = 'Glamour';
    const text = 'Ahora Tienda On line\nSeleccion personalizada para vos..';

    try {
      if (navigator.share) {
        // 💡 Usamos campos separados en navigator.share para que el sistema operativo limpie el link
        await navigator.share({
            title: title,
            text: text,
            url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("¡Link copiado!");
      }
    } catch (err) { console.log(err) }
  }

// ... (resto del archivo igual)

  if (!mounted) return null
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0)

  return (
    <div style={{ background: '#FF0000', minHeight: '100vh', paddingBottom: '180px' }}>
      <div className={styles.container} style={{ paddingTop: '40px', background: 'transparent' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/icons/logo-no.png" alt="Logo" style={{ height: '75px', width: 'auto', objectFit: 'contain', marginBottom: '20px' }} />
          <h1 style={{ fontWeight: 950, color: 'white', fontSize: '1.6rem', margin: 0, letterSpacing: '1px' }}>AHORA TIENDA ON LINE</h1>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <div style={{ background: 'white', color: '#FF0000', padding: '6px 20px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900 }}>
             SELECCION PERSONALIZADA PARA VOS..
            </div>
            
            <button 
              onClick={handleShareSelection}
              style={{ background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Share2 size={18} color="#FF0000" />
            </button>
          </div>
        </header>

        <div className={styles.grid}>
          {productos.map((item) => (
            <div 
              key={item.id} 
              className={styles.card} 
              onClick={() => setSelected(item)} 
              style={{ cursor: 'pointer', background: 'white', border: '2px solid #FFC9CB', boxShadow: '0 12px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', background: '#f9f9f9' }}>
                <img src={item.imagen} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div className={styles.info} style={{ background: 'white', padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h3 className={styles.name} style={{ color: '#000', fontSize: '11px', marginBottom: '4px' }}>{item.nombre.toLowerCase()}</h3>
                    <p className={styles.price} style={{ color: '#FF0000', fontSize: '15px', fontWeight: 900, margin: 0 }}>$ {new Intl.NumberFormat('es-AR').format(item.precioTransfer)}</p>
                </div>
                <button className={styles.addCartBtn} style={{ background: '#FF0000', color: 'white', border: 'none', width: '100%', height: '32px', fontSize: '9px', marginTop: '10px' }}>
                  <ShoppingBag size={12} /> VER DETALLES
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: '60px', textAlign: 'center' }}>
          <Link href="/" style={{ background: 'white', color: '#FF0000', padding: '12px 25px', borderRadius: '50px', fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}>
            <ArrowLeft size={18} /> IR A LA TIENDA COMPLETA
          </Link>
        </footer>
      </div>

      {totalItems > 0 && (
        <Link href="/checkout" style={{ textDecoration: 'none' }}>
          <div style={{ position: 'fixed', bottom: '170px', left: '50%', transform: 'translateX(-50%)', background: 'white', color: '#FF0000', padding: '14px 30px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 15px 45px rgba(0,0,0,0.5)', zIndex: 5000, fontWeight: 950, width: '80%', maxWidth: '320px', justifyContent: 'center', border: '3px solid #FF0000', fontSize: '1rem' }}>
            <ShoppingBag size={22} />
            FINALIZAR COMPRA ({totalItems})
          </div>
        </Link>
      )}

      <ProductModal open={!!selected} producto={selected} onClose={() => setSelected(null)} />
    </div>
  )
}