'use client'

import { useState } from 'react'
import styles from './CartModal.module.css'
import { useCartStore } from '../store/useCartStore'
import { useRouter } from 'next/navigation'
import { X, Trash2 } from 'lucide-react'

export default function CartModal({ open, onClose }: any) {
  const router = useRouter()
  const { items, clearCart, removeFromCart } = useCartStore()
  const [envioGlobal, setEnvioGlobal] = useState(0)

  if (!open) return null

  const totalTransfer = items.reduce((acc, item) => acc + (item.producto.precioTransfer * item.cantidad), 0)
  const totalLista = items.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0)
  const ahorro = totalLista - totalTransfer
  const totalFinal = totalTransfer + envioGlobal

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Mi Bolsa</h2>
          <button className={styles.close} onClick={onClose}><X size={24} /></button>
        </div>

        <div className={styles.shippingSection}>
          <label className={styles.label}>¿Cómo quieres recibir tu pedido?</label>
          <select 
            className={styles.select} 
            value={envioGlobal} 
            onChange={(e) => setEnvioGlobal(Number(e.target.value))}
          >
            <option value={0}>Retiro Gratis (Villa Urquiza)</option>
            <option value={3000}>Envío Zona 1 ($3.000)</option>
            <option value={5000}>Envío Zona 2 ($5.000)</option>
            <option value={7000}>Envío Zona 3 ($7.000)</option>
          </select>
        </div>

        <div className={styles.list}>
          {items.map((item: any, index: number) => (
            <div key={index} className={styles.card}>
              <img src={item.producto.imagen} className={styles.img} alt={item.producto.nombre} />
              <div className={styles.info}>
                <p className={styles.name}>{item.producto.nombre}</p>
                <p className={styles.price}>
                  {item.cantidad} x ${new Intl.NumberFormat('es-AR').format(item.producto.precioTransfer)}
                </p>
              </div>
              <button className={styles.remove} onClick={() => removeFromCart(item.producto.id, item.envio)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.summary}>
            {ahorro > 0 && <div className={styles.ahorroBadge}>¡Ahorrás ${new Intl.NumberFormat('es-AR').format(ahorro)}!</div>}
            <div className={styles.totalRow}>
              <span>TOTAL</span>
              <span className={styles.finalPrice}>$ {new Intl.NumberFormat('es-AR').format(totalFinal)}</span>
            </div>
            <p className={styles.payway}>Aceptamos todos los medios de pago (Payway)</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.clear} onClick={clearCart}>Vaciar</button>
            <button className={styles.buy} onClick={() => router.push('/checkout')}>
              ELEGIR MEDIO DE PAGO
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}