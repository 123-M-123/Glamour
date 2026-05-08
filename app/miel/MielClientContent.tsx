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

  // --- NUEVA LÓGICA DE FILTRADO BASADA EN EL NOMBRE ---
  
  // 1. Mieles: Nombre contiene "Miel" pero NO contiene "Pack" (para no mezclar con caramelos)
  const mieles = productos.filter(p => 
    p.nombre.toLowerCase().includes('miel') && !p.nombre.toLowerCase().includes('pack')
  )

  // 2. Caramelos: Nombre contiene "Pack" o "car."
  const caramelos = productos.filter(p => 
    p.nombre.toLowerCase().includes('pack') || p.nombre.toLowerCase().includes('car.')
  )

  // 3. Extras: IDs 11, 12 y 13 (Polen, Tintura, Panal según tu Excel)
  const extras = productos.filter(p => 
    ['11', '12', '13'].includes(p.id) || p.nombre.toLowerCase().includes('polen')
  )

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <h1>Nuestra Miel Pura de Abejas</h1>
        <p>Del campo a tu mesa: productos cuidadosamente elaborados, bajo estrictas normas de higiene y salubridad.</p>
      </section>

      {/* 1. MIEL ENVASADA */}
      <section className={styles.section}>
        <h2>Miel Envasada</h2>
        <div className={styles.bubbles}>
          {mieles.map((item) => (
            <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
              <img src={item.imagen || '/placeholder.png'} alt={item.nombre} />
              {/* Intentamos mostrar solo el peso si el nombre es "Miel 1kg" */}
              <span>{item.nombre.toLowerCase().replace('miel ', '').toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. CARAMELOS */}
      <section className={styles.section}>
        <h2>Caramelos de Miel</h2>
        <div className={styles.bubbles}>
          {caramelos.map((item) => (
            <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
              <img src={item.imagen || '/placeholder.png'} alt={item.nombre} />
              {/* Mostramos "V" + ID (ej: V4, V5) para mantener tu estética */}
              <span>V{item.id}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. EXTRAS */}
      <section className={styles.section}>
        <h2>Más Productos Derivados</h2>
        <div className={styles.bubbles}>
          {extras.map((item) => (
            <div key={item.id} className={styles.bubble} onClick={() => handleClick(item.id)}>
              <img src={item.imagen || '/placeholder.png'} alt={item.nombre} />
              <span>{item.nombre.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL */}
      <ProductModal
        open={!!selected}
        producto={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  )
}