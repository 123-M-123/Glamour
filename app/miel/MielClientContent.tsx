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

  // --- FILTRADO POR CATEGORÍA EXACTA ---
  const mieles = productos.filter(p => p.categoria === "Miel Envasada")
  const caramelos = productos.filter(p => p.categoria === "Caramelo")
  const otros = productos.filter(p => p.categoria === "Otros Derivados")

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <h1>Nuestra Miel Pura de Abejas</h1>
        <p>Del campo a tu mesa: productos cuidadosamente elaborados, bajo estrictas normas de higiene y salubridad.</p>
      </section>

      {/* 1. MIEL ENVASADA */}
      {mieles.length > 0 && (
        <section className={styles.section}>
          <h2>Miel Envasada</h2>
          <div className={styles.bubbles}>
            {mieles.map((item) => (
              <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
                <img src={item.imagen} alt={item.nombre} />
                {/* LIMPIEZA: Quitamos "Miel" y mostramos solo el peso (ej: 2kg) */}
                <span>{item.nombre.toLowerCase().replace(/miel/g, '').trim().toUpperCase()}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. CARAMELOS */}
      {caramelos.length > 0 && (
        <section className={styles.section}>
          <h2>Caramelos de Miel, Bolsitas de 10 U.</h2>
          <div className={styles.bubbles}>
            {caramelos.map((item) => (
              <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
                <img src={item.imagen} alt={item.nombre} />
                {/* LIMPIEZA: Solo mostramos V + ID para que no "pise" la imagen con el texto largo */}
                <span>V{item.id}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. EXTRAS (Otros Derivados) */}
      {otros.length > 0 && (
        <section className={styles.section}>
          <h2>Más Productos Derivados</h2>
          <div className={styles.bubbles}>
            {otros.map((item) => (
              <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
                <img src={item.imagen} alt={item.nombre} />
                {/* LIMPIEZA: Mostramos solo la primera palabra (ej: "Polen" en vez de todo el texto) */}
                <span>{item.nombre.split(' ')[0].toUpperCase()}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <ProductModal
        open={!!selected}
        producto={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  )
}