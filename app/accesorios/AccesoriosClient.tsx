'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react' 
import styles from './accesorios.module.css'

export default function AccesoriosClient({ productos, banners }: { productos: any[], banners: any[] }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => { 
    setMounted(true) 
  }, [])
  
  if (!mounted) return null

  // 🪄 MAGIA DINÁMICA: 
  // Filtramos productos que el motor identificó como 'accesorios' (los que tenían *)
  // Usamos un Map para garantizar categorías únicas por su slug normalizado.
  const catMap = new Map();
  productos.forEach(p => {
    if (p.tipo === 'accesorios' && !catMap.has(p.categoriaSlug)) {
      catMap.set(p.categoriaSlug, p.categoria);
    }
  });

  const categoriasFinales = Array.from(catMap.entries());

  // Motor de renderizado de banners
  const renderBanner = (ubicacion: string) => {
    const banner = banners.find(b => b.ubicacion === ubicacion.toLowerCase());
    if (!banner) return null;
    return (
      <div className={styles.bannerContainer}>
        <img src={banner.imagen} alt="Publicidad Glamour" className={styles.bannerImg} />
      </div>
    );
  }

  return (
    <main className={styles.container}>
      {/* BANNER SUPERIOR DINÁMICO */}
      {renderBanner("hero-accesorios")}

      <header className={styles.header}>
        <h1 className={styles.title}>Accesorios</h1>
        <p className={styles.subtitle}>Complementos Glamour</p>
      </header>

      <div className={styles.grid}>
        {categoriasFinales.map(([slug, label]) => (
          <Link key={slug} href={`/accesorios/${slug}`} className={styles.card}>
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
              <Sparkles className={styles.fallbackIcon} size={35} />
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.catName}>{label.toUpperCase()}</span>
              <span className={styles.explore}>VER TODO</span>
            </div>
          </Link>
        ))}
      </div>

      {/* BANNER INFERIOR DINÁMICO */}
      {renderBanner("footer-accesorios")}
    </main>
  )
}