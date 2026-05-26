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

  const catMap = new Map();
  productos.forEach(p => {
    if (p.tipo === 'accesorios' && !catMap.has(p.categoriaSlug)) {
      catMap.set(p.categoriaSlug, p.categoria);
    }
  });

  const categoriasFinales = Array.from(catMap.entries());

  // 🪄 MOTOR DE RENDERIZADO CORREGIDO (Con Link de Destino)
  const renderBanner = (ubicacion: string) => {
    const banner = banners.find(b => b.ubicacion === ubicacion.toLowerCase());
    if (!banner) return null;

    const content = (
      <div className={styles.bannerContainer}>
        <img src={banner.imagen} alt="Publicidad Glamour" className={styles.bannerImg} />
      </div>
    );

    // Si tiene link en la planilla, lo envolvemos en un <a>
    return banner.linkDestino ? (
      <a href={banner.linkDestino} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    ) : (
      content
    );
  }

  return (
    <main className={styles.container}>
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

      {renderBanner("footer-accesorios")}
    </main>
  )
}