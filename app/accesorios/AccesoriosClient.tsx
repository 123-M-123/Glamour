'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  GripHorizontal, Briefcase, Circle, Wallet, Mail, 
  Droplets, Disc, Smartphone, Wind, Box 
} from 'lucide-react'
import styles from './accesorios.module.css'

const categories = [
  { name: 'Cinturones', slug: 'cinturones', icon: <GripHorizontal size={35} /> },
  { name: 'Carteras', slug: 'carteras', icon: <Briefcase size={35} /> },
  { name: 'Gorras', slug: 'gorras', icon: <Circle size={35} /> },
  { name: 'Billeteras', slug: 'billeteras', icon: <Wallet size={35} /> },
  { name: 'Sobres de fiesta', slug: 'sobres', icon: <Mail size={35} /> },
  { name: 'Perfuminas', slug: 'perfuminas', icon: <Droplets size={35} /> },
  { name: 'Chokers', slug: 'chokers', icon: <Disc size={35} /> },
  { name: 'Porta-celulares', slug: 'porta-celulares', icon: <Smartphone size={35} /> },
  { name: 'Pañuelos', slug: 'panuelos', icon: <Wind size={35} /> },
  { name: 'Pashminas', slug: 'pashminas', icon: <Box size={35} /> },
]

export default function AccesoriosClient({ productos, banners }: { productos: any[], banners: any[] }) {
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
      {renderBanner("hero-accesorios")}

      <header className={styles.header}>
        <h1 className={styles.title}>Accesorios</h1>
        <p className={styles.subtitle}>El toque final para tu look Glamour</p>
      </header>

      <div className={styles.grid}>
        {categories.map((cat, index) => (
          <Link 
            key={cat.slug} 
            href={`/tienda/${cat.slug}`} 
            className={styles.card}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.iconBox}>{cat.icon}</div>
            <div className={styles.cardInfo}>
              <span className={styles.catName}>{cat.name}</span>
              <span className={styles.explore}>VER COLECCIÓN</span>
            </div>
          </Link>
        ))}
      </div>

      {renderBanner("footer-accesorios")}
    </main>
  )
}