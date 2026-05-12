'use client'
import { useState, useEffect, useMemo } from 'react'
import ProductModal from '@/app/components/ProductModal'
import styles from './category.module.css'

export default function CategoryClient({ category, productos, banners }: any) {
  const [selected, setSelected] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)

  const productosCategoria = useMemo(() => {
    return productos.filter((p: any) => 
      p.categoria.toLowerCase().trim() === category.toLowerCase().trim()
    )
  }, [productos, category])

  const productosOtros = useMemo(() => {
    return productos
      .filter((p: any) => p.categoria.toLowerCase().trim() !== category.toLowerCase().trim())
      .sort(() => 0.5 - Math.random())
      .slice(0, 10)
  }, [productos, category])

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const renderBanner = (ubicacion: string) => {
    const banner = banners.find((b: any) => b.ubicacion === ubicacion.toLowerCase());
    if (!banner) return null;
    return (
      <div className={styles.bannerContainer}>
        <img src={banner.imagen} alt="Publicidad" className={styles.bannerImg} />
      </div>
    );
  }

  const itemsSuperior = [...productosCategoria, ...productosCategoria]
  const itemsOtros = [...productosOtros, ...productosOtros]

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{category.replace(/-/g, ' ')}</h1>

      {/* 🎡 CARRUSEL 1: Categoría Actual */}
      {itemsSuperior.length > 0 && (
        <div className={styles.carouselContainer}>
          <div className={styles.track}>
            {itemsSuperior.map((item, i) => (
              <div key={`sup-${i}`} className={styles.carouselCard} onClick={() => setSelected(item)}>
                <img src={item.imagen} alt={item.nombre} />
                {/* 👈 Texto normalizado a minúsculas para que el CSS aplique Capitalize */}
                <div className={styles.miniLabel}>{item.nombre.toLowerCase()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {renderBanner(`hero-${category}`)}

      {/* 🟦 GRID PRINCIPAL */}
      <div className={styles.grid}>
        {productosCategoria.map((item: any) => (
          <div key={item.id} className={styles.productCard} onClick={() => setSelected(item)}>
            <div className={styles.imageBox}><img src={item.imagen} alt={item.nombre} /></div>
            <div className={styles.info}>
              {/* 👈 Texto normalizado */}
              <span className={styles.productName}>{item.nombre.toLowerCase()}</span>
              <span className={styles.price}>${new Intl.NumberFormat('es-AR').format(item.precioTransfer)}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>También te puede gustar</h2>

      {/* 🎡 CARRUSEL 2: Otros Productos (Reverse) */}
      {itemsOtros.length > 0 && (
        <div className={styles.carouselContainer}>
          <div className={`${styles.track} ${styles.trackReverse}`}>
            {itemsOtros.map((item, i) => (
              <div key={`inf-${i}`} className={styles.carouselCard} onClick={() => setSelected(item)}>
                <img src={item.imagen} alt={item.nombre} />
                {/* 👈 Categoría normalizada */}
                <div className={styles.miniLabel}>{item.categoria.toLowerCase()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {renderBanner(`footer-${category}`)}
      <ProductModal open={!!selected} producto={selected} onClose={() => setSelected(null)} />
    </main>
  )
}