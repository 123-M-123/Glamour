'use client'

import { Shirt, Sparkles } from 'lucide-react'
import styles from './HeroSection.module.css'
import Link from 'next/link'

export default function HeroSection({ banners }: { banners: any[] }) {
  
  const promoBanner = banners?.find((b: any) => b.ubicacion.toLowerCase() === 'hero-promos')
  const footerBanners = banners?.filter((b: any) => 
    b.ubicacion.toLowerCase().includes('footer-pagos')
  )

  return (
    <section className={styles.hero}>
      
      {promoBanner && (
        <div className={styles.topBanner}>
          <img src={promoBanner.imagen} alt="Promociones" />
        </div>
      )}

      <div className={styles.content}>
        <p className={styles.kicker}>Indumentaria Femenina</p>

        <h1 className={styles.title}>
          Resaltá tu esencia. <br />
          Vestite como querés sentirte.
        </h1>

        <p className={styles.subtitle}>
          Calidad, estilo y actitud en cada prenda.
        </p>

        <div className={styles.buttonContainer}>
          <Link href="/indumentaria" className={styles.primaryBtn}>
            <Shirt size={22} />
            Indumentaria
          </Link>
          
          <Link href="/accesorios" className={styles.secondaryBtn}>
            <Sparkles size={22} />
            Accesorios
          </Link>
        </div>

        <div className={styles.introBlock}>
          <p>
            Bienvenidas a <strong>Glamour</strong>, un espacio pensado para mujeres auténticas 
            que buscan vestirse con estilo, comodidad y actitud. Ofrecemos indumentaria femenina 
            actual, versátil y de calidad, pensada para acompañarte en tu día a día y en cada momento especial.
          </p>
        </div>

        {/* CONTENEDOR CON GAP PARA SEPARAR BANNERS */}
        <div className={styles.footerBannersContainer}>
          {footerBanners && footerBanners.map((banner, index) => (
            <div key={index} className={styles.paymentsBanner}>
              <img src={banner.imagen} alt={`Banner Pago ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}