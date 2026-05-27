'use client'

import { useState } from 'react'
import styles from './CartModal.module.css'
import { useCartStore } from '../store/useCartStore'
import { useRouter } from 'next/navigation'
import { X, Trash2, Share2 } from 'lucide-react'

export default function CartModal({ open, onClose }: any) {
  const router = useRouter()
  const { items, clearCart, removeFromCart } = useCartStore()
  const [envioGlobal, setEnvioGlobal] = useState(0)

  if (!open) return null

  const totalTransfer = items.reduce((acc, item) => acc + (item.producto.precioTransfer * item.cantidad), 0)
  const totalLista = items.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0)
  const ahorro = totalLista - totalTransfer
  const totalFinal = totalTransfer + envioGlobal

  // 🪄 FUNCIÓN: COMPARTIR SELECCIÓN UNIVERSAL (LIMPIEZA TOTAL)
  const handleShareSelection = async () => {
    if (items.length === 0) return;

    const ids = items.map(item => item.producto.id).join(',');
    const baseUrl = "https://glamour-urquiza.vercel.app"; 
    const shareUrl = `${baseUrl}/c-p?p=${ids}&$=1`;

    try {
      // 📱 CELULARES (Menú compartir nativo)
      if (navigator.share) {
        // 💡 SECRETO DE SENIOR: Mandamos SOLAMENTE la URL.
        // Al no haber texto extra, WhatsApp no tiene otra opción que
        // renderizar la previsualización (Metadata) que configuramos antes.
        await navigator.share({
          url: shareUrl,
        });
      } else {
        // 💻 PC / NAVEGADORES VIEJOS (WhatsApp directo)
        // En PC también mandamos solo el link para evitar la doble leyenda.
        const waUrl = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;
        window.open(waUrl, '_blank');
      }
    } catch (err) {
      console.error("Error al compartir:", err);
    }
  };

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
            <option value={0}>Paquete interior (ANDREANI)</option>
            <option value={4000}>Caba Env Zona 1 ($4.000)</option>
            <option value={6000}>Caba Env Zona 2 ($6.000)</option>
            <option value={8000}>Caba Env Zona 3 ($8.000)</option>
            <option value={10000}>Caba Env Zona 4 ($10.000)</option>
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
          {/* 🚀 BOTÓN COMPARTIR (Limpieza aplicada) */}
          {items.length > 0 && (
            <button className={styles.exportBtn} onClick={handleShareSelection}>
              <Share2 size={16} /> EXPORTAR SELECCIÓN PERSONALIZADA
            </button>
          )}

          <div className={styles.summary}>
            {ahorro > 0 && <div className={styles.ahorroBadge}>¡Ahorrás ${new Intl.NumberFormat('es-AR').format(ahorro)}!</div>}
            <div className={styles.totalRow}>
              <span>TOTAL</span>
              <span className={styles.finalPrice}>$ {new Intl.NumberFormat('es-AR').format(totalFinal)}</span>
            </div>
            <p className={styles.payway}>Todos los medios de pago! (También PayWay)</p>
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