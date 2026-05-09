'use client'

import { useState } from 'react'
import styles from './Header.module.css'
import { useCartStore } from '../store/useCartStore'
import CartModal from './CartModal'

export default function Header() {
  const { items } = useCartStore()
  const [openCart, setOpenCart] = useState(false)

  const totalItems = items.reduce(
    (acc, item) => acc + item.cantidad,
    0
  )

  return (
    <>
      <header className={styles.header}>

        {/* IZQUIERDA */}
        <div className={styles.left}>
          <a
            href="https://www.instagram.com/glamour.urquiza"
            target="_blank"
          >
            <img src="/icons/instagram.png" className={styles.icon} />
          </a>
        </div>

        {/* CENTRO */}
        <div className={styles.center}>
          <img src="/logo.png" className={styles.logo} />
        </div>

        {/* DERECHA */}
        <div className={styles.right}>
          <button
            className={styles.cart}
            onClick={() => setOpenCart(true)}
          >
            <img src="/icons/cart.png" className={styles.icon} />

            {totalItems > 0 && (
              <span className={styles.badge}>
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </header>

      <CartModal
        open={openCart}
        onClose={() => setOpenCart(false)}
      />
    </>
  )
}