'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shirt } from 'lucide-react' 
import styles from './indumentaria.module.css'

export default function IndumentariaClient({ productos, banners }: { productos: any[], banners: any[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  // 🪄 MAGIA: Filtramos categorías de tipo 'indumentaria' dinámicamente
  // Usamos un Map para asegurar que sean únicas por su slug
  const catMap = new Map();
  productos.forEach(p => {
    if (p.tipo === 'indumentaria' && !catMap.has(p.categoriaSlug)) {
      catMap.set(p.categoriaSlug, p.categoria);
    }
  });

  const categoriasFinales = Array.from(catMap.entries());

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
        {categoriasFinales.map(([slug, label]) => (
          <Link key={slug} href={`/indumentaria/${slug}`} className={styles.card}>
            <div className={styles.iconBox}>
              <img 
                src={`/icons/${slug}.png`} 
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
              <span className={styles.catName}>{label.toUpperCase()}</span>
              <span className={styles.explore}>VER TODO</span>
            </div>
          </Link>
        ))}
      </div>
      {renderBanner("footer-indumentaria")}
    </main>
  )
}