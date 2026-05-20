'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './ProductModal.module.css'
import { useCartStore } from '../store/useCartStore'
import { useWishlistStore } from '../store/useWishlistStore'

const formatPrice = (n: number) => new Intl.NumberFormat('es-AR').format(n)

export default function ProductModal({ open, producto, onClose }: any) {
  const { addToCart } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const carouselRef = useRef<HTMLDivElement>(null); // Referencia para el scroll

  if (!open || !producto) return null

  const handleAdd = () => {
    addToCart(producto, 0)
    onClose()
  }

  const isFav = isInWishlist(producto.id)
  const imagenes = producto.galeria || [producto.imagen]

  // 🚀 FUNCIÓN PARA DESLIZAR EN DESKTOP
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?p=${producto.id}`
    if (navigator.share) {
      await navigator.share({ title: producto.nombre, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert("Enlace copiado")
    }
  }

  const whatsappUrl = `https://wa.me/5491167914366?text=Hola! Consulto por ${producto.nombre}.`

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Cerrar"><X size={24} /></button>

        <div className={styles.mainLayout}>
          
          {/* 🎡 CONTENEDOR DE IMÁGENES */}
          <div className={styles.imageContainer}>
            
            {/* Flechas de navegación (Solo visibles en Desktop vía CSS) */}
            {imagenes.length > 1 && (
              <>
                <button className={`${styles.arrowBtn} ${styles.prev}`} onClick={() => scroll('left')}>
                  <ChevronLeft size={30} />
                </button>
                <button className={`${styles.arrowBtn} ${styles.next}`} onClick={() => scroll('right')}>
                  <ChevronRight size={30} />
                </button>
              </>
            )}

            <div className={styles.carousel} ref={carouselRef}>
              {imagenes.map((img: string, idx: number) => (
                <div key={idx} className={styles.slide}>
                  <img src={img} alt={`${producto.nombre} ${idx + 1}`} className={styles.image} />
                </div>
              ))}
            </div>
            
            {/* Indicador visual para móvil */}
            {imagenes.length > 1 && (
              <div className={styles.scrollHint}>
                Deslizá para ver más <ChevronRight size={14} />
              </div>
            )}

            <button className={styles.shareBtn} onClick={handleShare} title="Compartir">
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

              {/* ❤️ BOTÓN FAVORITOS (CORREGIDO) */}
              <button 
                className={styles.wishlistBtn} 
                onClick={() => isFav ? removeFromWishlist(producto.id) : addToWishlist(producto)}
              >
                <img 
                  src="/icons/corazon-rojo.png" 
                  className={styles.wishlistIcon} 
                  style={{ filter: isFav ? 'none' : 'grayscale(1) opacity(0.3)' }} 
                  alt="Favoritos" 
                />
              </button>
            </div>

            <div className={styles.extraInfo}>
              {producto.description && <p className={styles.description}>{producto.description}</p>}
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