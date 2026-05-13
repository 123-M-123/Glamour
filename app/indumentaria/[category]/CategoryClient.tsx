'use client'
import { useState, useEffect, useMemo } from 'react'
import ProductModal from '@/app/components/ProductModal'
import styles from './category.module.css'
import { useCartStore } from '@/app/store/useCartStore'
import { useWishlistStore } from '@/app/store/useWishlistStore'
import { ShoppingBag } from 'lucide-react'

export default function CategoryClient({ category, productos, banners }: any) {
  const [selected, setSelected] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Stores de Zustand
  const { addToCart } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

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
    e.stopPropagation(); // No abre el modal
    addToCart({ ...item, envio: 0 }, 0);
    // Podrías poner un mini aviso acá si quisieras
  }

  const handleQuickWish = (e: any, item: any) => {
    e.stopPropagation(); // No abre el modal
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

      {itemsSuperior.length > 0 && (
        <div className={styles.carouselContainer}>
          <div className={styles.track}>
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
        {productosCategoria.map((item: any) => (
          <div key={item.id} className={styles.productCard} onClick={() => setSelected(item)}>
            <div className={styles.imageBox}>
              <img src={item.imagen} alt={item.nombre} />
              
              {/* --- BOTONES FLOTANTES --- */}
              <button 
                className={styles.quickWish} 
                onClick={(e) => handleQuickWish(e, item)}
              >
                <img 
                  src="/icons/corazon-rojo-deseotexto.png" 
                  style={{ filter: isInWishlist(item.id) ? 'none' : 'grayscale(1) opacity(0.7)' }}
                  alt="Fav" 
                />
              </button>

              <button 
                className={styles.quickBag} 
                onClick={(e) => handleQuickBag(e, item)}
              >
                <ShoppingBag size={18} color="white" />
              </button>
            </div>
            
            <div className={styles.info}>
              <span className={styles.productName}>{item.nombre.toLowerCase()}</span>
              <span className={styles.price}>${new Intl.NumberFormat('es-AR').format(item.precioTransfer)}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>También te puede gustar</h2>

      {itemsOtros.length > 0 && (
        <div className={styles.carouselContainer}>
          <div className={`${styles.track} ${styles.trackReverse}`}>
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