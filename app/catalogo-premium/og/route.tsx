import { ImageResponse } from 'next/og'
import { getProductsFromSheets } from '@/lib/googleSheets'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * 🖼️ OPTIMIZACIÓN DE PESO (SENIOR UX)
 * Pedimos a Drive una miniatura de 400px en lugar de 1000px.
 * Esto reduce el PNG final de 1.5MB a ~450KB, garantizando que WhatsApp lo muestre.
 */
function getSmallThumbnail(url: string) {
  if (!url) return '';
  return url.replace('sz=w1000', 'sz=w400');
}

export async function GET(req: NextRequest) {
  const domain = 'https://glamour-urquiza.vercel.app'
  
  try {
    const { searchParams } = new URL(req.url)
    const pParam = searchParams.get('p') || ''
    
    if (!pParam) {
      return new ImageResponse(
        (
          <div style={{ background: '#FF0000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 40 }}>
              CATÁLOGO GLAMOUR URQUIZA
          </div>
        ),
        { width: 1200, height: 630 }
      )
    }

    const ids = pParam.split(',').map(id => id.trim())
    const allProducts = await getProductsFromSheets()
    
    if (!allProducts || allProducts.length === 0) throw new Error('No se pudo conectar con el Excel');

    // Filtramos los productos elegidos y aplicamos la miniatura liviana
    const items = allProducts
      .filter(p => ids.includes(p.id.toString()))
      .slice(0, 6)
      .map(p => ({
        ...p,
        imagenLiviana: getSmallThumbnail(p.imagen)
      }));

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
          {/* Header con Logo Blanco (logo-no.png) */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '30px' }}>
            <img 
              src={`${domain}/icons/logo-no.png`} 
              style={{ height: '80px' }} 
            />
          </div>

          {/* Grid de 6 productos (3 columnas x 2 filas) */}
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
                  src={item.imagenLiviana} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                {/* Etiqueta de Precio */}
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

          {/* Footer con Icono WhatsApp (whats.png) */}
          <div style={{ marginTop: 'auto', display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
            <img src={`${domain}/icons/whats.png`} style={{ width: '28px', height: '28px' }} />
            <div style={{ color: 'white', fontSize: '22px', fontWeight: 700, opacity: 0.9, display: 'flex' }}>
                CATÁLOGO EXCLUSIVO • GLAMOUR-URQUIZA.VERCEL.APP
            </div>
          </div>
        </div>
      ),
      { 
        width: 1200, 
        height: 630 
      }
    )
  } catch (e: any) {
    return new ImageResponse(
      (
        <div style={{ background: '#FF0000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, flexDirection: 'column', padding: 50 }}>
          <div style={{ display: 'flex', fontWeight: 'bold', fontSize: 40, marginBottom: 20 }}>GLAMOUR URQUIZA</div>
          <div style={{ display: 'flex' }}>Error al generar vista previa: {String(e.message)}</div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }
}