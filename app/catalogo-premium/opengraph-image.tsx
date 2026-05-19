import { ImageResponse } from 'next/og'
import { getProductsFromSheets } from '@/lib/googleSheets'

// 🛡️ IMPORTANTE: NO usamos 'edge' porque Google Sheets API requiere Node.js normal
export const alt = 'Catálogo Glamour'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ searchParams }: { searchParams: { p?: string } }) {
  try {
    const allProducts = await getProductsFromSheets()
    const ids = searchParams.p?.split(',') || []
    
    // Filtramos los productos reales
    const items = allProducts.filter(p => ids.includes(p.id.toString())).slice(0, 6)

    if (items.length === 0) {
        return new ImageResponse(
            <div style={{ background: '#FF0000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 40 }}>
                SELECCIÓN GLAMOUR URQUIZA
            </div>
        )
    }

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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
               <h1 style={{ color: 'white', fontSize: '60px', fontWeight: 900, margin: 0 }}>GLAMOUR URQUIZA</h1>
          </div>

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
                <img src={item.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ 
                  position: 'absolute', bottom: '10px', right: '10px', 
                  background: '#FF0000', color: 'white', 
                  padding: '5px 15px', borderRadius: '20px', 
                  fontSize: '24px', fontWeight: 'bold' 
                }}>
                  ${new Intl.NumberFormat('es-AR').format(item.precioTransfer)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', width: '100%', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '22px', fontWeight: 700, opacity: 0.8 }}>
              CATÁLOGO EXCLUSIVO • https://GLAMOUR-urquiza.vercel.app
            </span>
          </div>
        </div>
      ),
      { ...size }
    )
  } catch (e) {
    return new ImageResponse(
        <div style={{ background: '#000', width: '100%', height: '100%', color: 'white' }}>Error: {String(e)}</div>
    )
  }
}