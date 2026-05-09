// C:\Users\Marcos\proyectos ordenados 1y2\el-campito\app\miel\page.tsx
import { getProductsFromSheets, getBannersFromSheets } from '@/lib/googleSheets'
import MielClientContent from './MielClientContent'

export default async function MielPage() {
  const [productosLive, bannersLive] = await Promise.all([
    getProductsFromSheets(),
    getBannersFromSheets()
  ])

  return <MielClientContent productos={productosLive} banners={bannersLive} />
}