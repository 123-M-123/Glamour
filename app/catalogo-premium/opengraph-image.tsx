import { ImageResponse } from 'next/og'
import { getProductsFromSheets } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'
export const alt = 'Catálogo Glamour'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ searchParams }: { searchParams: { p?: string } }) {
  const domain = 'https://glamour-urquiza.vercel.app'
  
  try {
    const allProducts = await getProductsFromSheets()
    
    // Si no hay productos, algo falló con la API de Google
    if (!allProducts || allProducts.length === 0) {
      throw new Error('No se pudieron cargar productos del Excel');
    }

    const pParam = searchParams.p || ''
    const ids = pParam.split(',').map(id => id.trim())
    
    // Buscamos los productos asegurando que el ID coincida
    const items = allProducts.filter(p => ids.includes(p.id.toString())).slice(0, 6)

    // Si los IDs no existen en el Excel, mostramos un aviso
    if (items.length === 0) {
      return new ImageResponse(
        <div style={{ background: '#FF0000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 40, flexDirection: 'column' }}>
          <div style={{ display: 'flex' }}>GLAMOUR URQUIZA</div>
          <div style={{ display: 'flex', fontSize: 20, marginTop: 10 }}>Seleccioná productos válidos</div>
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
          {/* Header con Logo Absoluto */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '30px' }}>
            <img 
              src={`${domain}/icons/logo-no.png`} 
              style={{ height: '80px' }} 
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

          {/* Footer */}
          <div style={{ marginTop: 'auto', display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <img src={`${domain}/icons/whats.png`} style={{ width: '25px', height: '25px' }} />
            <div style={{ color: 'white', fontSize: '20px', fontWeight: 700, opacity: 0.8, display: 'flex' }}>
                CATÁLOGO EXCLUSIVO • {domain.replace('https://', '')}
            </div>
          </div>
        </div>
      ),
      { ...size }
    )
  } catch (e: any) {
    return new ImageResponse(
      <div style={{ background: '#FF0000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 30, flexDirection: 'column', padding: 40 }}>
        <div style={{ display: 'flex' }}>GLAMOUR URQUIZA - ERROR TÉCNICO</div>
        <div style={{ display: 'flex', fontSize: 16, marginTop: 20 }}>{e.message}</div>
        <div style={{ display: 'flex', fontSize: 14, opacity: 0.7 }}>Verificá las Variables de Entorno en Vercel (Ramas Preview)</div>
      </div>
    )
  }
}