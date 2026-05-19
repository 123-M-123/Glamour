import { getProductsFromSheets } from '@/lib/googleSheets'
import { Metadata } from 'next'
import styles from '../wishlist/wishlist.module.css'
import Link from 'next/link'

type Props = { searchParams: { p?: string } }

// 🪄 GENERADOR DE METADATA PARA EL FLYER
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const ids = searchParams.p?.split(',') || []
  return {
    title: `Selección Glamour - ${ids.length} productos`,
    description: 'Mirá la selección exclusiva que preparé para vos en Glamour Urquiza.',
    openGraph: {
      title: 'Catálogo Personalizado Glamour',
      description: `Vistite con estilo. Mirá estos ${ids.length} artículos elegidos.`,
      images: [`/seleccion/opengraph-image?p=${searchParams.p}`], // Llama al generador de imagen
    }
  }
}

export default async function SeleccionPage({ searchParams }: Props) {
  const allProducts = await getProductsFromSheets()
  const ids = searchParams.p?.split(',') || []
  const selectedProducts = allProducts.filter(p => ids.includes(p.id))

  return (
    <div className={styles.container} style={{ paddingTop: '100px' }}>
      <header className={styles.header}>
        <h1 style={{ fontWeight: 900, color: '#FF0000' }}>MI SELECCIÓN</h1>
        <p className={styles.countBadge}>{selectedProducts.length} productos elegidos</p>
      </header>

      <div className={styles.grid}>
        {selectedProducts.map((item) => (
          <div key={item.id} className={styles.card}>
            <img src={item.imagen} alt={item.nombre} className={styles.image} />
            <div className={styles.info}>
              <h3 className={styles.name}>{item.nombre}</h3>
              <p className={styles.price}>$ {new Intl.NumberFormat('es-AR').format(item.precioTransfer)}</p>
              <Link href={`/indumentaria`} style={{ textDecoration: 'none' }}>
                <button className={styles.addCartBtn}>VER EN TIENDA</button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <Link href="/" className={styles.continueLink}>IR A LA WEB OFICIAL</Link>
      </footer>
    </div>
  )
}