'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react' 
import styles from './accesorios.module.css' // Copia el CSS de indumentaria a este nuevo archivo

const CATS_ACCESORIOS = [
  'cinturones', 'carteras', 'gorras', 'billeteras', 'sobres-de-fiesta', 
  'perfuminas', 'chokers', 'porta-celulares', 'panuelos', 'pashminas'
]

export default function AccesoriosClient({ productos, banners }: { productos: any[], banners: any[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const categoriasFiltradas = Array.from(
    new Set(productos.map((p) => p.categoria.toLowerCase().trim()))
  ).filter(cat => CATS_ACCESORIOS.includes(cat))

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Accesorios</h1>
        <p className={styles.subtitle}>Complementos Glamour</p>
      </header>
      <div className={styles.grid}>
        {categoriasFiltradas.map((cat) => (
          <Link key={cat} href={`/accesorios/${cat.replace(/\s+/g, '-')}`} className={styles.card}>
            <div className={styles.iconBox}>
              <img 
                src={`/icons/${cat}.png`} 
                alt="" 
                className={styles.customIcon}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.classList.add(styles.showFallback);
                }}
              />
              <Sparkles className={styles.fallbackIcon} size={35} />
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.catName}>{cat.toUpperCase()}</span>
              <span className={styles.explore}>VER TODO</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}