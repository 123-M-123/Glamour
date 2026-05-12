'use client'

import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import styles from './ProductModal.module.css'
import { useCartStore } from '../store/useCartStore'

const formatPrice = (n: number) => new Intl.NumberFormat('es-AR').format(n)

export default function ProductModal({ open, producto, onClose }: any) {
  const { addToCart } = useCartStore()

  if (!open || !producto) return null

  const handleAdd = () => {
    addToCart(producto, 0) // El envío siempre entra en 0 al producto
    onClose()
  }

  const whatsappUrl = `https://wa.me/5491167914366?text=Hola! Quiero consultar por ${producto.nombre}. Talles: ${producto.talles}, Colores: ${producto.colores}.`

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}><X size={24} /></button>

        <div className={styles.mainLayout}>
          <div className={styles.imageContainer}>
            <img src={producto.imagen} alt={producto.nombre} className={styles.image} />
          </div>

          <div className={styles.infoContainer}>
            <h2 className={styles.title}>{producto.nombre}</h2>
            
            <div className={styles.priceBox}>
              <span className={styles.precioOriginal}>${formatPrice(producto.precio)}</span>
              <span className={styles.precioTransfer}>${formatPrice(producto.precioTransfer)}</span>
            </div>
            <p className={styles.descuentoInfo}>20% OFF Efectivo / Transferencia</p>

            {/* 👗 CAMPOS DINÁMICOS */}
            <div className={styles.extraInfo}>
              {producto.talles && <p><strong>Talles:</strong> {producto.talles}</p>}
              {producto.colores && <p><strong>Colores:</strong> {producto.colores}</p>}
            </div>

            <div className={styles.actions}>
              <button className={styles.pagar} onClick={handleAdd}>AGREGAR A LA BOLSA</button>
              <a href={whatsappUrl} target="_blank" className={styles.consultar}>
                <MessageCircle size={22} /> CONSULTAR STOCK
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}