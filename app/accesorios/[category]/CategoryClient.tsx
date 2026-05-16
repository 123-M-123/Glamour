'use client'
import { useState, useEffect, useMemo } from 'react'
import ProductModal from '@/app/components/ProductModal'
import styles from './category.module.css'
import { useCartStore } from '@/app/store/useCartStore'
import { useWishlistStore } from '@/app/store/useWishlistStore'
import { ShoppingBag, Share2 } from 'lucide-react'

export default function CategoryClient({ category, productos, banners }: any) {
  const [selected, setSelected] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Stores de Zustand
  const { addToCart } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

  // 🏃‍♂️ CONFIGURACIÓN DE VELOCIDAD CONSTANTE (Segundos por ítem)
  const VELOCIDAD_POR_ITEM = 5;

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

  // Lógica de botones flotantes
  const handleQuickBag = (e: any, item: any) => {
    e.stopPropagation();
    addToCart({ ...item, envio: 0 }, 0);
  }

  const handleQuickWish = (e: any, item: any) => {
    e.stopPropagation();
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        imagen: item.imagen
      });
    }
  }

  const handleQuickShare = (e: any, item: any) => {
    e.stopPropagation();
    const shareData = {
      title: item.nombre,
      text: `¡Mirá este producto en Glamour Urquiza: ${item.nombre}!`,
      url: `${window.location.origin}${window.location.pathname}?p=${item.id}`,
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Enlace copiado al portapapeles");
    }
  }

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

  // Cálculo de duraciones dinámicas para velocidad constante
  const duracionSup = productosCategoria.length * VELOCIDAD_POR_ITEM;
  const duracionOtros = productosOtros.length * VELOCIDAD_POR_ITEM;

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{category.replace(/-/g, ' ')}</h1>

      {/* 🎡 CARRUSEL 1: Categoría Actual */}
      {itemsSuperior.length > 0 && (
        <div className={styles.carouselContainer}>
          <div 
            className={styles.track} 
            style={{ animationDuration: `${duracionSup}s` }}
          >
            {itemsSuperior.map((item, i) => (
              <div key={`sup-${i}`} className={styles.carouselCard} onClick={() => setSelected(item)}>
                <img src={item.imagen} alt={item.nombre} />
                <div className={styles.miniLabel}>{item.nombre.toLowerCase()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {renderBanner(`hero-${category}`)}

      <div className={styles.grid}>
        {productosCategoria.map((item: any) => {
          const isFav = isInWishlist(item.id);
          return (
            <div key={item.id} className={styles.productCard} onClick={() => setSelected(item)}>
              <div className={styles.imageBox}>
                <img src={item.imagen} alt={item.nombre} />
                
                {/* --- BOTÓN BOLSA --- */}
                <button className={styles.quickBag} onClick={(e) => handleQuickBag(e, item)}>
                  <ShoppingBag size={18} color="white" />
                </button>

                {/* --- BOTÓN WISHLIST --- */}
              <button 
  className={styles.quickWish} 
  onClick={(e) => handleQuickWish(e, item)}
  style={{ 
    backgroundColor: isFav ? '#FF0000' : '#FFF8F8' // 👈 Magia: Cambia el fondo según el estado
  }}
>
  <img 
    src={isFav ? "/icons/corazon-blanco.png" : "/icons/corazon-rojo.png"} 
    alt="Fav" 
  />
</button>

                {/* --- BOTÓN COMPARTIR --- */}
                <button className={styles.quickShare} onClick={(e) => handleQuickShare(e, item)}>
                  <Share2 size={18} color="white" />
                </button>
              </div>
              
              <div className={styles.info}>
                <span className={styles.productName}>{item.nombre.toLowerCase()}</span>
                <span className={styles.price}>${new Intl.NumberFormat('es-AR').format(item.precioTransfer)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <h2 className={styles.sectionTitle}>También te puede gustar</h2>

      {/* 🎡 CARRUSEL 2: Otros Productos (Reverse) */}
      {itemsOtros.length > 0 && (
        <div className={styles.carouselContainer}>
          <div 
            className={`${styles.track} ${styles.trackReverse}`}
            style={{ animationDuration: `${duracionOtros}s` }}
          >
            {itemsOtros.map((item, i) => (
              <div key={`inf-${i}`} className={styles.carouselCard} onClick={() => setSelected(item)}>
                <img src={item.imagen} alt={item.nombre} />
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