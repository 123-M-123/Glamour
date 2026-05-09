// app/ferias/page.tsx
import { getBannersFromSheets } from '@/lib/googleSheets'
import FeriasClientContent from './FeriasClientContent'

export default async function FeriasPage() {
  // Traemos todos los banners de la Maestra
  const bannersLive = await getBannersFromSheets()

  return <FeriasClientContent banners={bannersLive} />
}