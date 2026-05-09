// C:\Users\Marcos\proyectos ordenados 1y2\el-campito\app\miel\MielClientContent.tsx
'use client'
import { useState, useEffect } from 'react'
import styles from './miel.module.css'
import ProductModal from '../components/ProductModal'
import { Producto } from '../data/productos'

export default function MielClientContent({ productos, banners }: { productos: Producto[], banners: any[] }) {
  const [selected, setSelected] = useState<Producto | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleClick = (id: string) => {
    const prod = productos.find(p => p.id === id)
    if (prod) setSelected(prod)
  }

  // Módulo de Banner Independiente
  const renderBanner = (ubicacion: string) => {
    const banner = banners.find(b => b.ubicacion === ubicacion);
    if (!banner) return null;
    
    const content = (
      <div className={styles.bannerContainer}>
        <img src={banner.imagen} alt="Publicidad" className={styles.bannerImg} />
      </div>
    );

    return banner.linkDestino ? <a href={banner.linkDestino} target="_blank">{content}</a> : content;
  }

  if (!mounted) return null

  const mieles = productos.filter(p => p.categoria === "Miel Envasada")
  const caramelos = productos.filter(p => p.categoria === "Caramelo")
  const otros = productos.filter(p => p.categoria === "Otros Derivados")

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>Nuestra Miel Pura de Abejas</h1>
        <p>Del campo a tu mesa...</p>
      </section>

      {/* MODULO DE PUBLICIDAD: Aparece si en el Excel dice "hero-miel" */}
      {renderBanner("hero-miel")}

      <section className={styles.section}>
        <h2>Miel Envasada</h2>
        <div className={styles.bubbles}>
          {mieles.map((item) => (
            <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
              <img src={item.imagen} alt={item.nombre} />
              <span>{item.nombre.toLowerCase().replace(/miel/g, '').trim().toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      {renderBanner("medio-miel")}

      <section className={styles.section}>
        <h2>Caramelos de Miel</h2>
        <div className={styles.bubbles}>
          {caramelos.map((item) => (
            <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
              <img src={item.imagen} alt={item.nombre} />
              <span>V{item.id}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Más Productos Derivados</h2>
        <div className={styles.bubbles}>
          {otros.map((item) => (
            <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
              <img src={item.imagen} alt={item.nombre} />
              <span>{item.nombre.split(' ')[0].toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      <ProductModal open={!!selected} producto={selected} onClose={() => setSelected(null)} />
    </main>
  )
}