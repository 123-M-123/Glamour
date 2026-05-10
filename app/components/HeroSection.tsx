'use client'

import { Shirt, Sparkles } from 'lucide-react' // Importamos los iconos solicitados

import styles from './HeroSection.module.css'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.kicker}>
          Indumentaria Femenina
        </p>

        <h1 className={styles.title}>
          Resaltá tu esencia. <br />
          Vestite como querés sentirte.
        </h1>

        <p className={styles.subtitle}>
          Calidad, estilo y actitud en cada prenda.
        </p>

        {/* Nuevos botones de acción */}
        <div className={styles.buttonContainer}>
          <Link href="/indumentaria" className={styles.primaryBtn}>
            <Shirt size={20} />
            Indumentaria
          </Link>
          
          <Link href="/accesorios" className={styles.secondaryBtn}>
            <Sparkles size={20} />
            Accesorios
          </Link>
        </div>
      </div>

      <div suppressHydrationWarning>
      
      </div>
    </section>
  )
}