'use client'

import Link from 'next/link'
import { Trash2, ShoppingBag, ArrowLeft, Share2, Eraser } from 'lucide-react'
import { useWishlistStore } from '../store/useWishlistStore'
import { useCartStore } from '../store/useCartStore'
import styles from './wishlist.module.css'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlistStore()
  const { addToCart } = useCartStore()

  const handleCompartir = () => {
    const ids = wishlist.map(item => item.id).join(',')
    const base = window.location.origin
    const shareUrl = `${base}/catalogo-premium?p=${ids}`
    // 🛡️ Mensaje minimalista sin flores ni textos largos
    const text = encodeURIComponent(`🛍️TIENDA ON LINE\n${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (wishlist.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <img src="/icons/corazon-rojo-deseotexto.png" alt="Favoritos" className={styles.mainHeartIcon} />
          <p className={styles.emptyText}>Tu lista está vacía.</p>
          <Link href="/" className={styles.wishBtn} style={{background:'white', color:'#ff0000', border:'2px solid #ff0000', textDecoration:'none', width:'100%'}}>
            VOLVER A LA TIENDA
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.wishHeader}>
        <img src="/icons/corazon-rojo-deseotexto.png" alt="Wishlist" className={styles.headerHeart} />
        
        {/* GRILLA DE BOTONES UNIFICADOS */}
        <div className={styles.actionGrid}>
          <div className={`${styles.wishBtn} ${styles.btnRed}`}>
            {wishlist.length} ELEGIDOS
          </div>
          <button className={`${styles.wishBtn} ${styles.btnGreen}`} onClick={handleCompartir}>
            <Share2 size={16} /> COMPARTIR
          </button>
          <Link href="/" className={`${styles.wishBtn} ${styles.btnWhite}`}>
            MIRAR MÁS
          </Link>
          <button className={`${styles.wishBtn} ${styles.btnGrey}`} onClick={() => { if(confirm('¿Vaciar lista?')) clearWishlist() }}>
            <Eraser size={16} /> VACIAR
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {wishlist.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={item.imagen} alt={item.nombre} className={styles.image} />
              <button className={styles.removeBtn} onClick={() => removeFromWishlist(item.id)}><Trash2 size={16} /></button>
            </div>
            <div className={styles.info}>
              <h3 className={styles.name}>{item.nombre}</h3>
              <p className={styles.price}>$ {new Intl.NumberFormat('es-AR').format(item.precio)}</p>
              <button className={styles.addCartBtn} onClick={() => addToCart({...item, precioTransfer: item.precio * 0.8}, 0)}>
                <ShoppingBag size={12} /> LO QUIERO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}