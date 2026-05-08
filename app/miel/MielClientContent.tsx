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
    const prod = productos.find(p => p.id === id)
    if (prod) setSelected(prod)
  }

  if (!mounted) return null

  // --- FILTRADO POR CATEGORÍA (Columna G del Excel) ---
  // Ajusté los nombres para que coincidan con lo que suele haber en el Excel
  const mieles = productos.filter(p => p.categoria?.toLowerCase().includes('miel'))
  const caramelos = productos.filter(p => p.categoria?.toLowerCase().includes('caramelo'))
  const otros = productos.filter(p => 
    !p.categoria?.toLowerCase().includes('miel') && 
    !p.categoria?.toLowerCase().includes('caramelo')
  )

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <h1>Nuestra Miel Pura de Abejas</h1>
        <p>Del campo a tu mesa: productos cuidadosamente elaborados, bajo estrictas normas de higiene y salubridad.</p>
      </section>

      {/* 1. MIEL ENVASADA (Categoría Miel) */}
      {mieles.length > 0 && (
        <section className={styles.section}>
          <h2>Miel Envasada</h2>
          <div className={styles.bubbles}>
            {mieles.map((item) => (
              <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
                {/* CORRECCIÓN: Usamos item.imagen (Columna F) */}
                <img src={item.imagen} alt={item.nombre} />
                <span>{item.nombre.toUpperCase().replace('MIEL ', '')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. CARAMELOS (Categoría Caramelos) */}
      {caramelos.length > 0 && (
        <section className={styles.section}>
          <h2>Caramelos de Miel, Bolsitas de 10 U.</h2>
          <div className={styles.bubbles}>
            {caramelos.map((item) => (
              <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
                <img src={item.imagen} alt={item.nombre} />
                <span>V{item.id}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. EXTRAS (Cualquier otra categoría) */}
      {otros.length > 0 && (
        <section className={styles.section}>
          <h2>Más Productos Derivados</h2>
          <div className={styles.bubbles}>
            {otros.map((item) => (
              <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
                <img src={item.imagen} alt={item.nombre} />
                <span>{item.nombre}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODAL */}
      <ProductModal
        open={!!selected}
        producto={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  )
}