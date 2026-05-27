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
          padding: '50px',
          alignItems: 'center',
        }}>
          {/* Cabecera con Logo */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '40px' }}>
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

          {/* 🏁 Footer con doble icono y frase central */}
          <div style={{ 
  marginTop: 'auto', 
  display: 'flex', 
  width: '100%', 
  justifyContent: 'center', 
  alignItems: 'center', 
  borderTop: '2px solid rgba(255,255,255,0.3)', 
  padding: '40px 0', 
  gap: '40px',
  background: 'rgba(255, 255, 255, 0.30)', // 🌸 Genera el efecto rosado sobre el fondo rojo
  borderRadius: '35px 35px 35px 35px' // Opcional: redondea las puntas de abajo
}}>
            {/* Icono Izquierdo */}
  <img src={`${origin}/c-p-t-r.png`} style={{ width: '150px', height: '150px', objectFit: 'contain' }} />
            
            {/* Bloque de Texto de 2 Renglones */}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <span style={{ color: 'white', fontSize: '70px', fontWeight: 900, textTransform: 'none' }}>
      Catálogo Exclusivo Redes
    </span>
    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '70px', fontWeight: 600, marginTop: '5px' }}>
      Tienda de Tiendas
    </span>
  </div>
            {/* Icono Derecho */}
  <img src={`${origin}/c-p-t-t.png`} style={{ width: '150px', height: '150px', objectFit: 'contain' }} />
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