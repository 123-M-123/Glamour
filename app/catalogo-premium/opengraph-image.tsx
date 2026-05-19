import { ImageResponse } from 'next/og'
import { getProductsFromSheets } from '@/lib/googleSheets'

// 🛡️ FIX BUILD: Evita que Vercel intente pre-renderizar esto como página estática
export const dynamic = 'force-dynamic'
export const alt = 'Catálogo Glamour'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ searchParams }: { searchParams: { p?: string } }) {
  try {
    const allProducts = await getProductsFromSheets()
    const ids = searchParams.p?.split(',') || []
    const items = allProducts.filter(p => ids.includes(p.id.toString())).slice(0, 6)

    return new ImageResponse(
      (
        <div style={{
          background: '#FF0000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px',
          alignItems: 'center',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{ color: 'white', fontSize: '65px', fontWeight: 900, letterSpacing: '2px', display: 'flex' }}>
                GLAMOUR URQUIZA
            </div>
          </div>

          {/* Grid de 6 productos */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', width: '1120px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ 
                display: 'flex', 
                background: 'white', 
                borderRadius: '20px', 
                width: '340px', 
                height: '210px', 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={item.imagen} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ 
                  position: 'absolute', bottom: '10px', right: '10px', 
                  background: '#FF0000', color: 'white', 
                  padding: '5px 15px', borderRadius: '20px', 
                  fontSize: '24px', fontWeight: 'bold',
                  display: 'flex'
                }}>
                  ${new Intl.NumberFormat('es-AR').format(item.precioTransfer)}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 'auto', display: 'flex', width: '100%', justifyContent: 'center' }}>
            <div style={{ color: 'white', fontSize: '22px', fontWeight: 700, opacity: 0.8, display: 'flex' }}>
              CATÁLOGO EXCLUSIVO • https://glamour-urquiza.vercel.app
            </div>
          </div>
        </div>
      ),
      { ...size }
    )
  } catch (e) {
    return new ImageResponse(
      <div style={{ background: '#FF0000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 30 }}>
        GLAMOUR URQUIZA - CATÁLOGO
      </div>
    )
  }
}