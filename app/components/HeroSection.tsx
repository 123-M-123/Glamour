'use client'

import { Shirt, Sparkles } from 'lucide-react'
import styles from './HeroSection.module.css'
import Link from 'next/link'

export default function HeroSection({ banners }: { banners: any[] }) {
  
  // 1. Banner superior exclusivo de la Home
  const promoBanner = banners?.find((b: any) => b.ubicacion === 'hero-promos')
  
  // 2. 🎯 FILTRO CORREGIDO: Buscamos específicamente los que dicen "footer-h-" 
  // (footer-h-1, footer-h-2, etc.) para que no se mezclen con los de otras categorías.
  const footerBanners = banners?.filter((b: any) => 
    b.ubicacion.startsWith('footer-h-')
  ).sort((a, b) => a.ubicacion.localeCompare(b.ubicacion))

  return (
    <section className={styles.hero}>
      
      {/* BANNER SUPERIOR CON LINK OPCIONAL */}
      {promoBanner && (
        <div className={styles.topBanner}>
          {promoBanner.linkDestino ? (
            <a href={promoBanner.linkDestino} target="_blank" rel="noopener noreferrer">
              <img src={promoBanner.imagen} alt="Promoción Principal" />
            </a>
          ) : (
            <img src={promoBanner.imagen} alt="Promoción Principal" />
          )}
        </div>
      )}

      <div className={styles.content}>
        <h1 className={styles.title}>
          Resaltá tu esencia. <br />
          Vestite como querés sentirte.
        </h1>

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

        {/* 🚀 CONTENEDOR DE BANNERS EXCLUSIVOS DE LA HOME (footer-h-1 al 5) */}
        <div className={styles.footerBannersContainer}>
          {footerBanners && footerBanners.map((banner, index) => {
            const BannerImg = (
              <div className={styles.paymentsBanner}>
                <img src={banner.imagen} alt={`Banner Home ${index + 1}`} />
              </div>
            );

            return (
              <div key={index} style={{ width: '100%' }}>
                {banner.linkDestino ? (
                  <a href={banner.linkDestino} target="_blank" rel="noopener noreferrer">
                    {BannerImg}
                  </a>
                ) : BannerImg}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}