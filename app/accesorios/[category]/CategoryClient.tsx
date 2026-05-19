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
  const { addToCart } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

  // 🪄 MAGIA: Filtramos por el slug normalizado
  const productosCategoria = useMemo(() => {
    return productos.filter((p: any) => p.categoriaSlug === category)
  }, [productos, category])

  // Obtenemos el nombre real para el título (desde el primer producto)
  const categoryLabel = productosCategoria[0]?.categoria || category.replace(/-/g, ' ');

  const productosOtros = useMemo(() => {
    return productos
      .filter((p: any) => p.categoriaSlug !== category)
      .sort(() => 0.5 - Math.random())
      .slice(0, 10)
  }, [productos, category])

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const handleQuickBag = (e: any, item: any) => {
    e.stopPropagation();
    addToCart({ ...item, envio: 0 }, 0);
  }

  const handleQuickWish = (e: any, item: any) => {
    e.stopPropagation();
    if (isInWishlist(item.id)) removeFromWishlist(item.id);
    else addToWishlist({ id: item.id, nombre: item.nombre, precio: item.precio, imagen: item.imagen });
  }

  const handleQuickShare = (e: any, item: any) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?p=${item.id}`;
    if (navigator.share) navigator.share({ title: item.nombre, url });
    else { navigator.clipboard.writeText(url); alert("Link copiado!"); }
  }

  const renderBanner = (ubicacion: string) => {
    const banner = banners.find((b: any) => b.ubicacion === ubicacion.toLowerCase());
    return banner ? <div className={styles.bannerContainer}><img src={banner.imagen} alt="Ads" className={styles.bannerImg} /></div> : null;
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{categoryLabel.toUpperCase()}</h1>

      {productosCategoria.length > 0 && (
        <div className={styles.carouselContainer}>
          <div className={styles.track} style={{ animationDuration: `${productosCategoria.length * 5}s` }}>
            {[...productosCategoria, ...productosCategoria].map((item, i) => (
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
              <button className={styles.quickBag} onClick={(e) => handleQuickBag(e, item)}><ShoppingBag size={18} color="white" /></button>
              <button className={styles.quickWish} onClick={(e) => handleQuickWish(e, item)} style={{ backgroundColor: isInWishlist(item.id) ? '#FF0000' : '#FFF8F8' }}>
                <img src={isInWishlist(item.id) ? "/icons/corazon-blanco.png" : "/icons/corazon-rojo.png"} alt="Fav" />
              </button>
              <button className={styles.quickShare} onClick={(e) => handleQuickShare(e, item)}><Share2 size={18} color="white" /></button>
            </div>
            <div className={styles.info}>
              <span className={styles.productName}>{item.nombre.toLowerCase()}</span>
              <span className={styles.price}>${new Intl.NumberFormat('es-AR').format(item.precioTransfer)}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>También te puede gustar</h2>
      <div className={styles.carouselContainer}>
        <div className={`${styles.track} ${styles.trackReverse}`} style={{ animationDuration: '40s' }}>
          {[...productosOtros, ...productosOtros].map((item, i) => (
            <div key={`inf-${i}`} className={styles.carouselCard} onClick={() => setSelected(item)}>
              <img src={item.imagen} alt={item.nombre} />
              <div className={styles.miniLabel}>{item.categoria.toLowerCase()}</div>
            </div>
          ))}
        </div>
      </div>
      {renderBanner(`footer-${category}`)}
      <ProductModal open={!!selected} producto={selected} onClose={() => setSelected(null)} />
    </main>
  )
}