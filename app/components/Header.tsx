'use client'

import { useState } from 'react'
import { Menu, X, Instagram, ShoppingBag, Shirt, Moon, Wind, Sun, Trees, Zap, User, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import styles from './Header.module.css'
import { useCartStore } from '../store/useCartStore'
import CartModal from './CartModal'
import { C } from '@/styles/colores'

export default function Header() {
  const { items } = useCartStore()
  const [openCart, setOpenCart] = useState(false)
  const [openMenu, setOpenMenu] = useState(false) // Estado para el menú lateral

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0)

  // Las 9 categorías con iconos seguros de Lucide
  const categories = [
    { name: 'Remeras', slug: 'remeras', icon: <Shirt size={22} /> },
    { name: 'Camisetas', slug: 'camisetas', icon: <Shirt size={22} /> },
    { name: 'Jeans', slug: 'jeans', icon: <ChevronRight size={22} /> },
    { name: 'Noche', slug: 'noche', icon: <Moon size={22} /> },
    { name: 'Camperas', slug: 'camperas', icon: <Wind size={22} /> },
    { name: 'Shorts', slug: 'shorts', icon: <Sun size={22} /> },
    { name: 'Bermudas', slug: 'bermudas', icon: <Trees size={22} /> },
    { name: 'Calzas', slug: 'calzas', icon: <Zap size={22} /> },
    { name: 'Camisas', slug: 'camisas', icon: <User size={22} /> },
  ]

  return (
    <>
      <header className={styles.header}>
        {/* IZQUIERDA: Hamburguesa + Instagram */}
        <div className={styles.left}>
          <button className={styles.menuBtn} onClick={() => setOpenMenu(true)}>
            <Menu color="white" size={35} />
          </button>
          <a href="https://www.instagram.com/glamour.urquiza" target="_blank" className={styles.hideMobile}>
            <Instagram color="white" size={30} />
          </a>
        </div>

        {/* CENTRO: Tu Logo */}
        <div className={styles.center}>
          <Link href="/">
            <img src="/logo.png" className={styles.logo} alt="Logo" />
          </Link>
        </div>

        {/* DERECHA: Carrito */}
        <div className={styles.right}>
          <button className={styles.cart} onClick={() => setOpenCart(true)}>
            <ShoppingBag color="white" size={35} />
            {totalItems > 0 && (
              <span className={styles.badge}>{totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* MENÚ LATERAL (Sidebar Innovadora) */}
      <div className={`${styles.sidebar} ${openMenu ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>CATEGORÍAS</span>
          <button onClick={() => setOpenMenu(false)}><X size={30} /></button>
        </div>
        <nav className={styles.sidebarNav}>
          {categories.map((cat) => (
            <Link 
              key={cat.slug} 
              href={`/tienda/${cat.slug}`} 
              className={styles.sidebarItem}
              onClick={() => setOpenMenu(false)}
            >
              <span className={styles.sidebarIcon}>{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
          <div className={styles.sidebarFooter}>
             <a href="https://www.instagram.com/glamour.urquiza" target="_blank">SÍGUENOS EN INSTAGRAM</a>
          </div>
        </nav>
      </div>

      {/* Overlay para cerrar el menú */}
      {openMenu && <div className={styles.overlay} onClick={() => setOpenMenu(false)} />}

      <CartModal open={openCart} onClose={() => setOpenCart(false)} />
    </>
  )
}