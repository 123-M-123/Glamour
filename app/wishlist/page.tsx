'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, ShoppingBag, Share2, Eraser, Facebook, Download, Send, Sparkles, Heart } from 'lucide-react'
import { useWishlistStore } from '../store/useWishlistStore'
import { useCartStore } from '../store/useCartStore'
import styles from './wishlist.module.css'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlistStore()
  const { addToCart } = useCartStore()
  
  const [showModal, setShowModal] = useState(false)
  const [conPrecios, setConPrecios] = useState(true)

  const ids = wishlist.map(item => item.id).join(',')
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  
  const shareUrl = `${base}/c-p?p=${ids}&$=${conPrecios ? '1' : '0'}`
  const imageUrl = `${base}/c-p/og?p=${ids}&$=${conPrecios ? '1' : '0'}`

  const handleWA = () => {
    const text = encodeURIComponent(shareUrl)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleFB = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const handleDL = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `Flyer-Glamour-${Date.now()}.jpg`
    link.click()
  }

  const handleUniversal = async () => {
    if (navigator.share) {
      await navigator.share({ 
        title: 'Glamour Urquiza - Mis Favoritos', 
        url: shareUrl 
      })
    }
  }

  // ✨ ESTADO VACÍO: DISEÑO BOUTIQUE EXPLICATIVO
  if (wishlist.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <div className={styles.iconPulse}>
            <img src="/icons/corazon-rojo-deseotexto.png" alt="Favoritos" className={styles.mainHeartIcon} />
          </div>

          <h1 className={styles.emptyTitle}>Empezá tu lista de favoritos</h1>
          
          <p className={styles.emptyText}>
            Guardá las prendas y accesorios que más te gustan tocando el corazón en cada producto.
          </p>

          <div className={styles.featureBox}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📸</span>
              <p><strong>Catálogo Premium:</strong> Al sumar prendas podés generar un flyer en alta calidad para compartir en WhatsApp o redes.</p>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🏷️</span>
              <p><strong>Con o sin precios:</strong> Elegí si querés exportar tu selección mostrando los valores o solo las fotos.</p>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🛍️</span>
              <p><strong>Compra directa:</strong> Pasá tus favoritos a la bolsa de compras en un solo clic.</p>
            </div>
          </div>

          <Link href="/indumentaria" className={styles.exploreBtn}>
            <Sparkles size={18} />
            EXPLORAR COLECCIÓN
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.wishHeader}>
        <img src="/icons/corazon-rojo-deseotexto.png" alt="Wishlist" className={styles.mainHeartIcon} />
        <div className={styles.actionGrid}>
          <div className={`${styles.wishBtn} ${styles.btnRed}`}>{wishlist.length} PRODUCTOS</div>
          <button className={`${styles.wishBtn} ${styles.btnGreen}`} onClick={() => setShowModal(true)}>
            <Share2 size={20} /> COMPARTIR
          </button>
          <Link href="/indumentaria" className={`${styles.wishBtn} ${styles.btnWhite}`}>MIRAR MÁS</Link>
          <button className={`${styles.wishBtn} ${styles.btnGrey}`} onClick={() => confirm('¿Vaciar?') && clearWishlist()}>
            <Eraser size={20} /> VACIAR
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {wishlist.map((item) => (
          <div key={item.id} className={styles.card}>
            <button className={styles.removeBtn} onClick={() => removeFromWishlist(item.id)}><X size={20} strokeWidth={3} /></button>
            <div className={styles.imageWrapper}><img src={item.imagen} alt={item.nombre} className={styles.image} /></div>
            <div className={styles.info}>
              <h3 className={styles.name}>{item.nombre}</h3>
              <p className={styles.price}>$ {new Intl.NumberFormat('es-AR').format(item.precio)}</p>
              <button className={styles.addCartBtn} onClick={() => addToCart({...item, precioTransfer: item.precio * 0.8}, 0)}><ShoppingBag size={14} /> LO QUIERO</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.socialOverlay}>
          <div className={styles.socialModal}>
            <button style={{position:'absolute', top:20, right:20, border:'none', background:'none', cursor:'pointer'}} onClick={()=>setShowModal(false)}><X/></button>
            <h2 className={styles.modalTitle}>CONFIGURAR FLYER</h2>
            
            <div className={styles.configSection}>
              <span className={styles.toggleLabel}>¿MOSTRAR PRECIOS EN LA IMAGEN?</span>
              <div className={styles.toggleGroup}>
                <button className={`${styles.toggleBtn} ${conPrecios ? styles.toggleBtnActive : ''}`} onClick={()=>setConPrecios(true)}>SÍ, CON PRECIOS</button>
                <button className={`${styles.toggleBtn} ${!conPrecios ? styles.toggleBtnActive : ''}`} onClick={()=>setConPrecios(false)}>NO, SIN PRECIOS</button>
              </div>
            </div>

            <div className={styles.socialGrid}>
              <button className={`${styles.socialAction} ${styles.wa}`} onClick={handleWA}><Send size={20}/> WHATSAPP</button>
              <button className={`${styles.socialAction} ${styles.fb}`} onClick={handleFB}><Facebook size={20}/> FACEBOOK</button>
              <button className={`${styles.socialAction} ${styles.dl}`} onClick={handleDL}><Download size={20}/> BAJAR JPG</button>
              <button className={`${styles.socialAction} ${styles.sh}`} onClick={handleUniversal}><Share2 size={20}/> OTROS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}