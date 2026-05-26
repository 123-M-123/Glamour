import { ImageResponse } from 'next/og'
import { getProductsFromSheets } from '@/lib/googleSheets'
import { NextRequest } from 'next/server'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getThumb(url: string) {
  if (!url) return '';
  return url.replace('sz=w1000', 'sz=w500');
}

export async function GET(req: NextRequest) {
  const { origin } = req.nextUrl;
  
  try {
    const { searchParams } = new URL(req.url)
    const pParam = searchParams.get('p') || ''
    const mostrarPrecios = searchParams.get('$') !== '0'; // 👈 Sensor de precios por $
    
    const ids = pParam.split(',').map(id => id.trim())
    const allProducts = await getProductsFromSheets()
    
    const items = allProducts
      .filter(p => ids.includes(p.id.toString()))
      .slice(0, 6);

    const res = new ImageResponse(
      (
        <div style={{
          background: '#FF0000',
          width: '1200px',
          height: '1000px',
          display: 'flex',
          flexDirection: 'column',
          padding: '50px',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '40px' }}>
            <img src={`${origin}/icons/logo-no.png`} style={{ height: '120px', objectFit: 'contain' }} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'center', width: '1100px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ 
                display: 'flex', background: 'white', borderRadius: '25px', 
                width: '340px', height: '300px', overflow: 'hidden', position: 'relative'
              }}>
                <img src={getThumb(item.imagen)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {mostrarPrecios && (
                  <div style={{ 
                    position: 'absolute', bottom: '15px', right: '15px', 
                    background: '#FF0000', color: 'white', 
                    padding: '8px 20px', borderRadius: '50px', 
                    fontSize: '32px', fontWeight: 'bold', display: 'flex',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                  }}>
                    ${new Intl.NumberFormat('es-AR').format(item.precioTransfer)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: '30px', gap: '20px' }}>
              <img src={`${origin}/icons/whats.png`} style={{ width: '90px', height: '90px' }} />
              <span style={{ color: 'white', fontSize: '60px', fontWeight: 800, display: 'flex' }}>
                CATÁLOGO EXCLUSIVO REDES
              </span>
          </div>
        </div>
      ),
      { width: 1200, height: 1000 }
    )

    const pngBuffer = await res.arrayBuffer();
    const jpgBuffer = await sharp(Buffer.from(pngBuffer))
      .jpeg({ quality: 75, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(jpgBuffer), {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, immutable, max-age=3600' },
    });

  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}