'use client'

import Link from 'next/link'
import { Trash2, ShoppingBag, ArrowLeft, Share2 } from 'lucide-react'
import { useWishlistStore } from '../store/useWishlistStore'
import { useCartStore } from '../store/useCartStore'
import styles from './wishlist.module.css'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlistStore()
  const { addToCart } = useCartStore()

  const formatPrice = (n: number) => 
    new Intl.NumberFormat('es-AR').format(Math.round(n))

  const handleCompartir = () => {
    const ids = wishlist.map(item => item.id).join(',')
    const base = window.location.origin
    const shareUrl = `${base}/seleccion?p=${ids}`
    const text = encodeURIComponent(`¡Hola! Mirá esta selección de productos que elegí en Glamour Urquiza 🌸:\n\n${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (wishlist.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <img src="/icons/corazon-rojo-deseotexto.png" alt="Lista de Deseos" className={styles.mainHeartIcon} />
          <p className={styles.emptyText}>Tu lista está vacía. ¡Agregá lo que te enamore!</p>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={20} /> VOLVER A LA TIENDA
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src="/icons/corazon-rojo-deseotexto.png" alt="Lista de Deseos" className={styles.mainHeartIcon} />
        <p className={styles.countBadge}>{wishlist.length} productos en favoritos</p>
        
        {/* 🚀 BOTÓN COMPARTIR SELECCIÓN */}
        <button className={styles.shareGlobalBtn} onClick={handleCompartir}>
          <Share2 size={20} /> COMPARTIR MI SELECCIÓN
        </button>
      </header>

      <div className={styles.grid}>
        {wishlist.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={item.imagen} alt={item.nombre} className={styles.image} />
              <button 
                className={styles.removeBtn}
                onClick={() => removeFromWishlist(item.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className={styles.info}>
              <h3 className={styles.name}>{item.nombre}</h3>
              <p className={styles.price}>$ {formatPrice(item.precio)}</p>
              
              <button 
                className={styles.addCartBtn}
                onClick={() => {
                  addToCart({
                    ...item,
                    precioTransfer: item.precio * 0.8
                  }, 0)
                }}
              >
                <ShoppingBag size={14} /> LO QUIERO
              </button>
            </div>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <Link href="/" className={styles.continueLink}>
           SEGUIR MIRANDO PRODUCTOS
        </Link>
      </footer>
    </div>
  )
}