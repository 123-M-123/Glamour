'use client'

import { useState, useEffect } from 'react'
import styles from './miel.module.css'
import ProductModal from '../components/ProductModal'
import { Producto } from '../data/productos'

export default function MielClientContent({ productos }: { productos: Producto[] }) {
  const [selected, setSelected] = useState<Producto | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = (id: string) => {
    // Buscamos en la lista que viene de Google Sheets
    const prod = productos.find(p => p.id === id)
    if (prod) setSelected(prod)
  }

  if (!mounted) return null

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>Nuestra Miel Pura de Abejas</h1>
        <p>Del campo a tu mesa...</p>
      </section>

      {/* 1. MIEL ENVASADA */}
      <section className={styles.section}>
        <h2>Miel Envasada</h2>
        <div className={styles.bubbles}>
          {productos.filter(p => p.id.includes('miel')).map((item) => (
            <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
              <img src={item.imagen} alt={item.nombre} />
              <span>{item.nombre.replace('Miel ', '')}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. CARAMELOS */}
      <section className={styles.section}>
        <h2>Caramelos de Miel</h2>
        <div className={styles.bubbles}>
          {productos.filter(p => p.id.includes('caramelo')).map((item) => (
            <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
              <img src={item.imagen} alt={item.nombre} />
              <span>V{item.id.split('-')[1]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. EXTRAS */}
      <section className={styles.section}>
        <h2>Más Productos Derivados</h2>
        <div className={styles.bubbles}>
          {productos.filter(p => ["polen", "tintura", "panal"].includes(p.id)).map((item) => (
            <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
              <img src={item.imagen} alt={item.nombre} />
              <span>{item.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      <ProductModal
        open={!!selected}
        producto={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  )
}