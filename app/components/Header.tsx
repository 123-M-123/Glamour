'use client'

import { useState } from 'react'
import { 
  Menu, X, Instagram, ShoppingBag, Home, 
  ChevronDown, ChevronRight, Shirt, Sparkles 
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Header.module.css'
import { useCartStore } from '../store/useCartStore'
import { useWishlistStore } from '../store/useWishlistStore'
import CartModal from './CartModal'

export default function Header() {
  const { items } = useCartStore()
  const { wishlist } = useWishlistStore()
  const [openCart, setOpenCart] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  
  const [showIndumentaria, setShowIndumentaria] = useState(false)
  const [showAccesorios, setShowAccesorios] = useState(false)

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0)
  const totalWishlist = wishlist.length

  const indumentariaCats = [
    'remeras', 'camisetas', 'jeans', 'noche', 'camperas', 
    'shorts', 'bermudas', 'calzas', 'camisas', 'sweaters', 'chalecos'
  ]

  const accesoriosCats = [
    'cinturones', 'carteras', 'gorras', 'billeteras', 'sobres-de-fiesta', 
    'perfuminas', 'chokers', 'porta-celulares', 'panuelos', 'pashminas'
  ]

  const NavIcon = ({ slug, fallback: Fallback }: { slug: string, fallback: any }) => (
    <div className={styles.iconWrapper}>
      <img 
        src={`/icons/${slug}.png`} 
        alt="" 
        className={styles.sidebarPng}
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
      <Fallback size={20} className={styles.sidebarLucide} />
    </div>
  )

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button className={styles.menuBtn} onClick={() => setOpenMenu(true)}>
            <Menu color="white" size={35} />
          </button>
          <a href="https://www.instagram.com/glamour.urquiza" target="_blank" className={styles.hideMobile}>
            <Instagram color="white" size={30} />
          </a>
        </div>

        <div className={styles.center}>
          <Link href="/">
            <img src="/logo.png" className={styles.logo} alt="Logo" />
          </Link>
        </div>

        <div className={styles.right}>
          <Link href="/wishlist" className={styles.wishlistBtn}>
            <img src="/icons/corazon-blanco.png" alt="Favoritos" className={styles.wishlistIcon} />
            {totalWishlist > 0 && <span className={styles.badge}>{totalWishlist}</span>}
          </Link>

          <button className={styles.cart} onClick={() => setOpenCart(true)}>
            <ShoppingBag color="white" size={35} />
            {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* SIDEBAR AJUSTADO CON LOGO */}
      <div className={`${styles.sidebar} ${openMenu ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            {/* Reemplazo de texto por logo-no.png */}
            <img src="/logo-no.png" className={styles.sidebarLogo} alt="Glamour" />
            <span className={styles.sidebarSubtitle}>Navegación</span>
          </div>
          <button onClick={() => setOpenMenu(false)}><X size={30} /></button>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/" className={styles.sidebarItem} onClick={() => setOpenMenu(false)}>
            <Home size={22} /> Inicio
          </Link>

          <div className={styles.accordion}>
            <button 
              className={`${styles.accordionTrigger} ${showIndumentaria ? styles.active : ''}`}
              onClick={() => setShowIndumentaria(!showIndumentaria)}
            >
              <div className={styles.triggerLeft}>
                <Shirt size={22} /> Tienda Indumentaria
              </div>
              <ChevronDown className={showIndumentaria ? styles.rotate : ''} size={18} />
            </button>
            
            <AnimatePresence>
              {showIndumentaria && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={styles.accordionContent}
                >
                  {indumentariaCats.map(cat => (
                    <Link 
                      key={cat} 
                      href={`/indumentaria/${cat}`} 
                      className={styles.subItem}
                      onClick={() => setOpenMenu(false)}
                    >
                      <NavIcon slug={cat} fallback={ChevronRight} />
                      {cat}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.accordion}>
            <button 
              className={`${styles.accordionTrigger} ${showAccesorios ? styles.active : ''}`}
              onClick={() => setShowAccesorios(!showAccesorios)}
            >
              <div className={styles.triggerLeft}>
                <Sparkles size={22} /> Accesorios
              </div>
              <ChevronDown className={showAccesorios ? styles.rotate : ''} size={18} />
            </button>

            <AnimatePresence>
              {showAccesorios && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={styles.accordionContent}
                >
                  {accesoriosCats.map(cat => (
                    <Link 
                      key={cat} 
                      href={`/accesorios/${cat}`} 
                      className={styles.subItem}
                      onClick={() => setOpenMenu(false)}
                    >
                      <NavIcon slug={cat} fallback={ChevronRight} />
                      {cat}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <a href="https://www.instagram.com/glamour.urquiza" target="_blank">SEGUINOS EN INSTAGRAM</a>
        </div>
      </div>

      {openMenu && <div className={styles.overlay} onClick={() => setOpenMenu(false)} />}
      <CartModal open={openCart} onClose={() => setOpenCart(false)} />
    </>
  )
}