'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shirt, Sparkles, Palmtree, Zap, UserRound, ShoppingBag, Moon, Wind, Sun, Trees, Smartphone } from 'lucide-react'
import styles from './indumentaria.module.css'

const categories = [
  { name: 'Remeras', slug: 'remeras',  useImage: true }, // 👈 Usa remeras.png
  { name: 'Camisetas', slug: 'camisetas', useImage: true }, // 👈 Usa camisetas.png
  { name: 'Jeans', slug: 'jeans', useImage: true },       // 👈 Usa jeans.png
  { name: 'Noche', slug: 'noche', icon: <Moon size={35} /> },  // 👈 Usa noche.png
  { name: 'Camperas', slug: 'camperas',  useImage: true }, // 👈 Usa camperas.png
  { name: 'Shorts', slug: 'shorts', useImage: true },
  { name: 'Bermudas', slug: 'bermudas', useImage: true },
  { name: 'Calzas', slug: 'calzas', useImage: true },
  { name: 'Camisas', slug: 'camisas', useImage: true },
  { name: 'Sweaters', slug: 'sweaters', useImage: true },
  { name: 'Chalecos', slug: 'chalecos',  useImage: true },
]

export default function IndumentariaClient({ productos, banners }: { productos: any[], banners: any[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

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
        {categories.map((cat, index) => (
          <Link 
            key={cat.slug} 
            href={`/indumentaria/${cat.slug}`} // 👈 Cambiado a ruta por rama como pediste
            className={styles.card}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.iconBox}>
              {cat.useImage ? (
                <img 
                  src={`/icons/${cat.slug}.png`} 
                  alt={cat.name} 
                  className={styles.customIcon} 
                />
              ) : (
                cat.icon
              )}
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.catName}>{cat.name}</span>
              <span className={styles.explore}>VER TODO</span>
            </div>
          </Link>
        ))}
      </div>

      {renderBanner("footer-indumentaria")}
    </main>
  )
}