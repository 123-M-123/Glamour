import { ImageResponse } from 'next/og'
import { getProductsFromSheets } from '@/lib/googleSheets'

export const runtime = 'edge'
export const alt = 'Catálogo Glamour'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ searchParams }: { searchParams: { p?: string } }) {
  const allProducts = await getProductsFromSheets()
  const ids = searchParams.p?.split(',') || []
  // 🎨 Tomamos los primeros 6 para el diseño del Flyer
  const items = allProducts.filter(p => ids.includes(p.id)).slice(0, 6)

  return new ImageResponse(
    (
      <div style={{
        background: '#FF0000',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px',
      }}>
        {/* Header del Flyer */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img src="https://glamour-urquiza.vercel.app/icons/logo-no.png" style={{ height: '70px' }} />
        </div>

        {/* Grid de 6 productos */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', flex: 1 }}>
          {items.map((item) => (
            <div key={item.id} style={{ 
              display: 'flex', 
              background: 'white', 
              borderRadius: '15px', 
              width: '350px', 
              height: '220px', 
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img src={item.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ 
                position: 'absolute', bottom: '10px', right: '10px', 
                background: '#FF0000', color: 'white', 
                padding: '5px 12px', borderRadius: '20px', 
                fontSize: '22px', fontWeight: 'bold' 
              }}>
                ${item.precioTransfer}
              </div>
            </div>
          ))}
        </div>

        {/* Footer del Flyer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
          <span style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>SELECCIÓN VIP PREPARADA PARA VOS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="https://glamour-urquiza.vercel.app/icons/whats.png" style={{ width: '25px' }} />
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 800 }}>WWW.GLAMOUR-URQUIZA.COM.AR</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}