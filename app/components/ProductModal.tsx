'use client'

import { X, Share2 } from 'lucide-react' // Importamos Share2 para compartir
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
  const handleWishlist = () => {
    if (isFav) {
      removeFromWishlist(producto.id)
    } else {
      addToWishlist({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen
      })
    }
  }

  // 🔗 LÓGICA DE COMPARTIR (Catálogo & Redes)
  const handleShare = async () => {
    const shareData = {
      title: producto.nombre,
      text: `¡Mirá este producto en Glamour Urquiza: ${producto.nombre}!`,
      // Genera el link que luego usará el Catálogo de Meta
      url: `${window.location.origin}${window.location.pathname}?p=${producto.id}`,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        alert("Enlace copiado al portapapeles")
      }
    } catch (err) {
      console.log('Error compartiendo:', err)
    }
  }

  const whatsappUrl = `https://wa.me/5491167914366?text=Hola! Quiero consultar por ${producto.nombre}. Talles: ${producto.talles}, Colores: ${producto.colores}.`

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}><X size={24} /></button>

        <div className={styles.mainLayout}>
          <div className={styles.imageContainer}>
            <img src={producto.imagen} alt={producto.nombre} className={styles.image} />
            
            {/* BOTÓN COMPARTIR FLOTANTE EN LA IMAGEN */}
            <button className={styles.shareBtn} onClick={handleShare} title="Compartir producto">
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

              <button 
                className={styles.wishlistBtn} 
                onClick={handleWishlist}
              >
                <img 
                  src="/icons/corazon-rojo.png" 
                  className={styles.wishlistIcon} 
                  alt="Lista de Deseos"
                  style={{ filter: isFav ? 'none' : 'grayscale(1) opacity(0.5)' }} 
                />
              </button>
            </div>

            {/* 📝 CAMPOS DINÁMICOS: DESCRIPCIÓN, STOCK, TALLES Y COLORES */}
            <div className={styles.extraInfo}>
              {producto.descripcion && <p className={styles.description}>{producto.descripcion}</p>}
              
              <div className={styles.specsGrid}>
                {producto.talles && <p><strong>Talles:</strong> {producto.talles}</p>}
                {producto.colores && <p><strong>Colores:</strong> {producto.colores}</p>}
                <p><strong>Stock:</strong> {producto.stock > 0 ? `${producto.stock} unidades` : 'Consultar disponibilidad'}</p>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.pagar} onClick={handleAdd}>AGREGAR A LA BOLSA</button>
              <a href={whatsappUrl} target="_blank" className={styles.consultar}>
                <img src="/icons/whats.png" alt="WhatsApp" className={styles.whatsIcon} />
                CONSULTAR STOCK
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}