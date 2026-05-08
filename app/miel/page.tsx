import { getProductsFromSheets } from '@/lib/googleSheets'
import MielClientContent from './MielClientContent' // Ahora creamos este componente abajo

export default async function Miel() {
  // Buscamos los productos REALES de Google Sheets
  const productosLive = await getProductsFromSheets()

  return <MielClientContent productos={productosLive} />
}