'use client'

import { useState, useEffect } from 'react'
import styles from './ferias.module.css'

export default function FeriasClientContent({ banners }: { banners: any[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Filtramos todos los banners que tengan "feria" en su ubicación (feria-1, feria-2, etc)
  const bannersFeria = banners.filter(b => b.ubicacion.includes('feria'))

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>Ferias y Eventos</h1>
        <p>
          Participamos en ferias locales donde podés encontrar todos nuestros productos. 
          ¡Vení a visitarnos y probá nuestra miel pura!
        </p>
      </section>

      <section className={styles.container}>
        {bannersFeria.length > 0 ? (
          bannersFeria.map((banner, index) => (
            <div key={index} className={styles.bannerWrapper}>
              {banner.linkDestino ? (
                <a href={banner.linkDestino} target="_blank" rel="noopener noreferrer">
                  <img src={banner.imagen} alt={`Feria ${index}`} className={styles.bannerImg} />
                </a>
              ) : (
                <img src={banner.imagen} alt={`Feria ${index}`} className={styles.bannerImg} />
              )}
            </div>
          ))
        ) : (
          <p className={styles.noData}>Próximamente anunciaremos nuevas fechas...</p>
        )}
      </section>
    </main>
  )
}