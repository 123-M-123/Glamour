import { ImageResponse } from 'next/og'
import { getProductsFromSheets } from '@/lib/googleSheets'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // 🛡️ Obtenemos el dominio actual de la rama de forma dinámica
  const { origin } = req.nextUrl;
  
  try {
    const { searchParams } = new URL(req.url)
    const pParam = searchParams.get('p') || ''
    
    if (!pParam) {
      return new ImageResponse(
        <div style={{ background: '#FF0000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 40 }}>
            GLAMOUR - SELECCIONÁ PRODUCTOS
        </div>
      )
    }

    const ids = pParam.split(',').map(id => id.trim())
    const allProducts = await getProductsFromSheets()
    
    if (!allProducts || allProducts.length === 0) throw new Error('Error al leer Excel');

    const items = allProducts
      .filter(p => ids.includes(p.id.toString()))
      .slice(0, 6);

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
          {/* 🛡️ LOGO CON FALLBACK: Si no carga la imagen, no explota el 500 */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '30px' }}>
            <img 
              src={`${origin}/icons/logo-no.png`} 
              alt="Logo"
              style={{ height: '80px' }}
              // @ts-ignore
              onError="this.style.display='none'" 
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
                  src={item.imagen.replace('sz=w1000', 'sz=w400')} 
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

            {/* Footer ultra limpio */}
          <div style={{ marginTop: 'auto', display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
            <img src={`${origin}/icons/whats.png`} style={{ width: '32px', height: '32px' }} />
            <div style={{ color: 'white', fontSize: '24px', fontWeight: 800, letterSpacing: '1px', display: 'flex' }}>
                CATÁLOGO EXCLUSIVO
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch (e: any) {
    // Si falla algo, devolvemos una imagen de error elegante en lugar de un 500
    return new ImageResponse(
      <div style={{ background: '#FF0000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 30, flexDirection: 'column', padding: 50 }}>
        <div style={{ display: 'flex', fontWeight: 'bold' }}>GLAMOUR URQUIZA</div>
        <div style={{ display: 'flex', fontSize: 20, marginTop: 20 }}>Catálogo Temporal: {String(e.message)}</div>
      </div>
    )
  }
}