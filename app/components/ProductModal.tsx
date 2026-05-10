'use client'

import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react' // Usamos Lucide para el WhatsApp
import styles from './ProductModal.module.css'
import { Producto } from '../data/productos'
import { useCartStore } from '../store/useCartStore'

type Props = {
  open: boolean
  producto: Producto | null
  onClose: () => void
}

const formatPrice = (n: number) => new Intl.NumberFormat('es-AR').format(n)

export default function ProductModal({ open, producto, onClose }: Props) {
  const [envio, setEnvio] = useState(0)
  const { addToCart } = useCartStore()

  if (!open || !producto) return null

  const total = producto.precioTransfer + envio
  const handleAdd = () => { addToCart(producto, envio); onClose(); }

  // 📱 NÚMERO Y MENSAJE ACTUALIZADO
  const telefono = '5491167914366' 
  const mensaje = `Hola! Estoy en la web de Glamour, quiero consultar por: ${producto.nombre}. Total: $${formatPrice(total)}. ¿Tienen disponibilidad?`
  const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <button className={styles.close} onClick={onClose}><X size={24} /></button>

        <div className={styles.mainLayout}>
          {/* LADO IZQUIERDO: IMAGEN RECTANGULAR */}
          <div className={styles.imageContainer}>
            <img src={producto.imagen} alt={producto.nombre} className={styles.image} />
          </div>

          {/* LADO DERECHO: INFO */}
          <div className={styles.infoContainer}>
            <h2 className={styles.title}>{producto.nombre}</h2>
            
            <div className={styles.priceBox}>
              <span className={styles.precioOriginal}>${formatPrice(producto.precio)}</span>
              <span className={styles.precioTransfer}>${formatPrice(producto.precioTransfer)}</span>
            </div>
            <p className={styles.descuentoInfo}>10% OFF con Transferencia</p>

            <div className={styles.shippingSection}>
              <label>Opciones de entrega:</label>
              <select className={styles.select} onChange={(e) => setEnvio(Number(e.target.value))}>
                <option value={0}>Retiro Gratis</option>
                <option value={3000}>Envío Zona 1 ($3.000)</option>
                <option value={5000}>Envío Zona 2 ($5.000)</option>
                <option value={7000}>Envío Zona 3 ($7.000)</option>
                <option value={9000}>Envío Zona 4 ($9.000)</option>
              </select>
            </div>

            <p className={styles.total}>Total: ${formatPrice(total)}</p>

            <div className={styles.actions}>
              <button className={styles.pagar} onClick={handleAdd}>
                AGREGAR AL CARRITO
              </button>

              <a href={whatsappUrl} target="_blank" className={styles.consultar}>
                <MessageCircle size={22} fill="white" />
                CONSULTAR POR WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}