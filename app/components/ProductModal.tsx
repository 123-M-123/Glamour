'use client'

import { X, Share2, ChevronRight } from 'lucide-react'
import styles from './ProductModal.module.css'
import { useCartStore } from '../store/useCartStore'
import { useWishlistStore } from '../store/useWishlistStore'

const formatPrice = (n: number) => new Intl.NumberFormat('es-AR').format(n)

export default function ProductModal({ open, producto, onClose }: any) {
  const { addToCart } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

  if (!open || !producto) return null

  const handleAdd = () => {
    addToCart(producto, 0)
    onClose()
  }

  const isFav = isInWishlist(producto.id)
  const imagenes = producto.galeria || [producto.imagen]

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?p=${producto.id}`
    if (navigator.share) {
      await navigator.share({ title: producto.nombre, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert("Copiado!")
    }
  }

  const whatsappUrl = `https://wa.me/5491167914366?text=Hola! Consulto por ${producto.nombre}. Talles: ${producto.talles}.`

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}><X size={24} /></button>

        <div className={styles.mainLayout}>
          {/* 🎡 GALERÍA CON SCROLL SNAP */}
          <div className={styles.imageContainer}>
            <div className={styles.carousel}>
              {imagenes.map((img: string, idx: number) => (
                <div key={idx} className={styles.slide}>
                  <img src={img} alt={`${producto.nombre} ${idx + 1}`} className={styles.image} />
                </div>
              ))}
            </div>
            
            {/* Indicador de más fotos */}
            {imagenes.length > 1 && (
              <div className={styles.scrollHint}>
                Deslizá para ver más <ChevronRight size={14} />
              </div>
            )}

            <button className={styles.shareBtn} onClick={handleShare}>
              <Share2 size={20} />
            </button>
          </div>

          <div className={styles.infoContainer}>
            <h2 className={styles.title}>{producto.nombre}</h2>
            
            <div className={styles.priceAndWishlist}>
              <div>
                <div className={styles.priceBox}>
                  <span className={styles.precioOriginal}>${formatPrice(producto.precio)}</span>
                  <span className={styles.precioTransfer}>${formatPrice(producto.precioTransfer)}</span>
                </div>
                <div className={styles.descuentoInfo}>
                  <span className={styles.offPercent}>20% OFF</span>
                  <span className={styles.offMethod}>Efectivo / Transferencia</span>
                </div>
              </div>

              <button className={styles.wishlistBtn} onClick={() => isFav ? removeFromWishlist(producto.id) : addToWishlist(producto)}>
                <img src="/icons/corazon-rojo.png" className={styles.wishlistIcon} style={{ filter: isFav ? 'none' : 'grayscale(1) opacity(0.5)' }} alt="Fav" />
              </button>
            </div>

            <div className={styles.extraInfo}>
              {producto.descripcion && <p className={styles.description}>{producto.descripcion}</p>}
              <div className={styles.specsGrid}>
                {producto.talles && <p><strong>Talles:</strong> {producto.talles}</p>}
                {producto.colores && <p><strong>Colores:</strong> {producto.colores}</p>}
                <p><strong>Stock:</strong> {producto.stock > 0 ? `${producto.stock} unidades` : 'Consultar'}</p>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.pagar} onClick={handleAdd}>AGREGAR A LA BOLSA</button>
              <a href={whatsappUrl} target="_blank" className={styles.consultar}>
                <img src="/icons/whats.png" alt="WA" className={styles.whatsIcon} />
                CONSULTAR STOCK
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}