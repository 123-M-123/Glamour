import { getProductsFromSheets, getBannersFromSheets } from '@/lib/googleSheets'
import AccesoriosClient from './AccesoriosClient'

export default async function AccesoriosPage() {
  const [productos, banners] = await Promise.all([
    getProductsFromSheets(),
    getBannersFromSheets()
  ])

  return <AccesoriosClient productos={productos} banners={banners} />
}