import { ImageResponse } from 'next/og'
import { getProductsFromSheets } from '@/lib/googleSheets'
import { NextRequest } from 'next/server'
import sharp from 'sharp'

// 🛡️ Configuración de entorno para Vercel
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 🖼️ Helper para miniaturas:
 * Pide a Google Drive una versión de 500px para que el flyer genere rápido.
 */
function getThumb(url: string) {
  if (!url) return '';
  return url.replace('sz=w1000', 'sz=w500');
}

export async function GET(req: NextRequest) {
  const { origin } = req.nextUrl;
  
  try {
    const { searchParams } = new URL(req.url)
    const pParam = searchParams.get('p') || ''
    // Sensor de precios: Se ocultan si el parámetro $ es '0'
    const mostrarPrecios = searchParams.get('$') !== '0'; 
    
    const ids = pParam.split(',').map(id => id.trim())
    const allProducts = await getProductsFromSheets()
    
    // Filtramos los productos seleccionados (Máximo 6 para la grilla)
    const items = allProducts
      .filter(p => ids.includes(p.id.toString()))
      .slice(0, 6);

    // 1️⃣ GENERACIÓN DEL FLYER (Next/OG - Satori)
    const res = new ImageResponse(
      (
        <div style={{
          background: '#FF0000',
          width: '1500px',
          height: '1300px',
          display: 'flex',
          flexDirection: 'column',
          padding: '45px 50px 35px',
          alignItems: 'center',
          position: 'relative',
        }}>

          {/* 💧 MARCA DE AGUA C-P-T-R (90% transparencia / 15% debajo del centro) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1500px',
            height: '1300px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '180px', // 👈 Desplaza ~15% por debajo del centro
          }}>
            <img 
              src={`${origin}/c-p-t-r.png`} 
              style={{ 
                width: '780px', 
                height: '780px', 
                objectFit: 'contain',
                opacity: 0.10, // 👈 90% transparente (efecto marca de agua suave)
              }} 
            />
          </div>

          {/* Cabecera con Logo */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '35px' }}>
            <img src={`${origin}/icons/logo-no.png`} style={{ height: '120px', objectFit: 'contain' }} />
          </div>

          {/* Grilla de Productos */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '35px', justifyContent: 'center', width: '1350px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ 
                display: 'flex', background: 'white', borderRadius: '25px', 
                width: '420px', height: '320px', overflow: 'hidden', position: 'relative'
              }}>
                <img src={getThumb(item.imagen)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {/* Etiqueta de Precio Condicional */}
                {mostrarPrecios && (
                  <div style={{ 
                    position: 'absolute', bottom: '15px', right: '15px', 
                    background: '#FF0000', color: 'white', 
                    padding: '8px 20px', borderRadius: '50px', 
                    fontSize: '64px', fontWeight: 'bold', display: 'flex',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                  }}>
                    ${new Intl.NumberFormat('es-AR').format(item.precioTransfer)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 🏁 ZÓCALO FOOTER (25% más chico de ancho y alto, sin logos laterales) */}
          <div style={{ 
            marginTop: 'auto', 
            display: 'flex', 
            flexDirection: 'column',
            width: '1050px', // 👈 25% más chico que el ancho total (1400px -> 1050px)
            justifyContent: 'center', 
            alignItems: 'center', 
            border: '2px solid rgba(255, 255, 255, 0.35)', 
            padding: '24px 20px', // 👈 Altura reducida proporcionalmente
            background: 'rgba(255, 255, 255, 0.30)', // 🌸 Tono esmerilado rosado intacto
            borderRadius: '35px',
          }}>
            {/* Renglón 1: Blanco con ligera transparencia (80% vivo) */}
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.82)', 
              fontSize: '52px', 
              fontWeight: 900, 
              letterSpacing: '1px',
              lineHeight: 1.15,
            }}>
              Catálogo Exclusivo Redes
            </span>

            {/* Renglón 2: Color dorado vivo institucional con ligera transparencia */}
            <span style={{ 
              color: 'rgba(255, 230, 0, 0.85)', 
              fontSize: '50px', 
              fontWeight: 700, 
              marginTop: '6px',
              letterSpacing: '1.5px',
              lineHeight: 1.15,
            }}>
              Tienda de Tiendas
            </span>
          </div>

        </div>
      ),
      { width: 1500, height: 1300 }
    )

    // 2️⃣ CONVERSIÓN A JPG (Sharp)
    const pngBuffer = await res.arrayBuffer();
    const jpgBuffer = await sharp(Buffer.from(pngBuffer))
      .jpeg({ 
        quality: 75, // Balance ideal peso/calidad para WhatsApp
        mozjpeg: true 
      })
      .toBuffer();

    // 3️⃣ RESPUESTA FINAL
    return new Response(new Uint8Array(jpgBuffer), {
      headers: { 
        'Content-Type': 'image/jpeg', 
        'Cache-Control': 'public, immutable, max-age=3600' 
      },
    });

  } catch (e: any) {
    console.error("Error en OG Route:", e.message);
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}