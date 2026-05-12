'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shirt, Sparkles } from 'lucide-react' 
import styles from './indumentaria.module.css'

// Lista blanca de subcategorías de INDUMENTARIA
const CATS_INDUMENTARIA = [
  'remeras', 'camisetas', 'jeans', 'noche', 'camperas', 
  'shorts', 'bermudas', 'calzas', 'camisas', 'sweaters', 'chalecos'
]

export default function IndumentariaClient({ productos, banners }: { productos: any[], banners: any[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  // Filtramos: Solo categorías que existen en el Excel Y están en nuestra lista de Indumentaria
  const categoriasFiltradas = Array.from(
    new Set(productos.map((p) => p.categoria.toLowerCase().trim()))
  ).filter(cat => CATS_INDUMENTARIA.includes(cat))

  const renderBanner = (ubicacion: string) => {
    const banner = banners.find(b => b.ubicacion === ubicacion.toLowerCase());
    if (!banner) return null;
    return (
      <div className={styles.bannerContainer}>
        <img src={banner.imagen} alt="Publicidad" className={styles.bannerImg} />
      </div>
    );
  }

  return (
    <main className={styles.container}>
      {renderBanner("hero-indumentaria")}
      <header className={styles.header}>
        <h1 className={styles.title}>Indumentaria</h1>
        <p className={styles.subtitle}>Colecciones exclusivas Glamour</p>
      </header>

      <div className={styles.grid}>
        {categoriasFiltradas.map((cat, index) => (
          <Link key={cat} href={`/indumentaria/${cat.replace(/\s+/g, '-')}`} className={styles.card}>
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
              <Shirt className={styles.fallbackIcon} size={35} />
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.catName}>{cat.toUpperCase()}</span>
              <span className={styles.explore}>VER TODO</span>
            </div>
          </Link>
        ))}
      </div>
      {renderBanner("footer-indumentaria")}
    </main>
  )
}