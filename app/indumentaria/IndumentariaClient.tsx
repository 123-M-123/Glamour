'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shirt, Moon, Wind, Sun, Trees, Zap, User, RectangleVertical, ShoppingBag } from 'lucide-react'
import styles from './indumentaria.module.css'

// ✅ AQUÍ ESTÁN LAS 9 CATEGORÍAS, NUNCA SE FUERON
const categories = [
  { name: 'Remeras', slug: 'remeras', icon: <Shirt size={40} /> },
  { name: 'Camisetas', slug: 'camisetas', icon: <ShoppingBag size={40} /> },
  { name: 'Jeans', slug: 'jeans', icon: <RectangleVertical size={40} /> },
  { name: 'Noche', slug: 'noche', icon: <Moon size={40} /> },
  { name: 'Camperas', slug: 'camperas', icon: <Wind size={40} /> },
  { name: 'Shorts', slug: 'shorts', icon: <Sun size={40} /> },
  { name: 'Bermudas', slug: 'bermudas', icon: <Trees size={40} /> },
  { name: 'Calzas', slug: 'calzas', icon: <Zap size={40} /> },
  { name: 'Camisas', slug: 'camisas', icon: <User size={40} /> },
]

export default function IndumentariaClient({ productos, banners }: { productos: any[], banners: any[] }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => { 
    setMounted(true) 
    console.log("Banners cargados:", banners)
  }, [banners])

  if (!mounted) return null

  const renderBanner = (ubicacion: string) => {
    const banner = banners.find(b => b.ubicacion === ubicacion.toLowerCase());
    if (!banner) return null;
    
    return (
      <div className={styles.bannerContainer}>
        <img 
          src={banner.imagen} 
          alt="Publicidad Glamour" 
          className={styles.bannerImg} 
        />
      </div>
    );
  }

  return (
    <main className={styles.container}>
      {/* 🚀 BANNER HERO: Se cargará si en el Excel dice 'hero-indumentaria' */}
      {renderBanner("hero-indumentaria")}

      <header className={styles.header}>
        <h1 className={styles.title}>Indumentaria</h1>
        <p className={styles.subtitle}>Colecciones exclusivas Glamour</p>
      </header>

      <div className={styles.grid}>
        {categories.map((cat, index) => (
          <Link 
            key={cat.slug} 
            href={`/tienda/${cat.slug}`} 
            className={styles.card}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.iconBox}>
              {cat.icon}
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.catName}>{cat.name}</span>
              <span className={styles.explore}>VER TODO</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 🚀 BANNER FOOTER: Se cargará si en el Excel dice 'footer-indumentaria' */}
      {renderBanner("footer-indumentaria")}
    </main>
  )
}