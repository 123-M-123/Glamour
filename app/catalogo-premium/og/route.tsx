import { ImageResponse } from 'next/og'
import { getProductsFromSheets } from '@/lib/googleSheets'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const domain = 'https://glamour-urquiza.vercel.app'
  
  try {
    const { searchParams } = new URL(req.url)
    const pParam = searchParams.get('p') || ''
    const ids = pParam.split(',').map(id => id.trim())

    const allProducts = await getProductsFromSheets()
    if (!allProducts || allProducts.length === 0) throw new Error('No sheets data');

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
          {/* Header con Logo Blanco */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '30px' }}>
            <img 
              src={`${domain}/icons/logo-no.png`} 
              style={{ height: '85px' }} 
            />
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

          {/* Footer con Icono WhatsApp */}
          <div style={{ marginTop: 'auto', display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <img src={`${domain}/icons/whats.png`} style={{ width: '25px', height: '25px' }} />
            <div style={{ color: 'white', fontSize: '20px', fontWeight: 700, opacity: 0.8, display: 'flex' }}>
                CATÁLOGO EXCLUSIVO • GLAMOUR-URQUIZA.VERCEL.APP
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch (e: any) {
    return new ImageResponse(
      (
        <div style={{ background: '#FF0000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 30 }}>
          GLAMOUR URQUIZA - SELECCIÓN ESPECIAL
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }
}