import { getProductsFromSheets, getBannersFromSheets } from '@/lib/googleSheets'
import IndumentariaClient from './IndumentariaClient'

export default async function IndumentariaPage() {
  const [productos, banners] = await Promise.all([
    getProductsFromSheets(),
    getBannersFromSheets()
  ])

  return <IndumentariaClient productos={productos} banners={banners} />
}