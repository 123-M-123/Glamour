import { ImageResponse } from 'next/og'
import { getProductsFromSheets } from '@/lib/googleSheets'
import { NextRequest } from 'next/server'
import sharp from 'sharp'

// 🛡️ Configuración de entorno para Vercel
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 🖼️ Helper para miniaturas de carga rápida
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
    const mostrarPrecios = searchParams.get('$') !== '0'; 
    
    // IDs solicitados
    const ids = pParam.split(',').map(id => id.trim()).filter(Boolean);
    const totalOriginal = ids.length;

    const allProducts = await getProductsFromSheets()
    
    // Mostramos hasta 9 productos (grilla de 3 columnas)
    const maxFlyerItems = 9;
    const items = allProducts
      .filter(p => ids.includes(p.id.toString()))
      .slice(0, maxFlyerItems);

    const restoCount = Math.max(0, totalOriginal - items.length);

    // 🟢 CÁLCULO DE ALTURA PROPORCIONAL Y HOLGADA (CERO SOLAPAMIENTOS)
    const totalItems = items.length || 1;
    const filas = Math.max(1, Math.ceil(totalItems / 3));
    const canvasWidth = 1500;

    // Medidas verticales reales:
    // Header (logo): 185px | Grilla: filas * 320px + gaps | Novedades: 90px | Zócalo: 180px | Margen seguridad: 70px
    const headerHeight = 185;
    const gridHeight = filas * 320 + (filas - 1) * 35;
    const extraCountHeight = restoCount > 0 ? 100 : 0;
    const enterateHeight = 90;
    const footerHeight = 180;
    const paddingTotal = 80; // 40 top + 40 bottom
    const canvasHeight = headerHeight + gridHeight + extraCountHeight + enterateHeight + footerHeight + paddingTotal + 70;

    // 1️⃣ GENERACIÓN DEL FLYER (Next/OG - Satori)
    const res = new ImageResponse(
      (
        <div style={{
          background: '#FF0000',
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 50px',
          alignItems: 'center',
          position: 'relative',
        }}>

          {/* 💧 MARCA DE AGUA Y RESPLANDOR (SIEMPRE AL CENTRO GEOMÉTRICO EXACTO) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {/* Brillo blanco tenue */}
            <div style={{
              position: 'absolute',
              width: '1200px',
              height: '1200px',
              borderRadius: '600px',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.20) 0%, rgba(255, 0, 0, 0) 65%)',
              display: 'flex',
            }} />

            {/* Marca de agua c-p-t-r */}
            <img 
              src={`${origin}/c-p-t-r.png`} 
              style={{ 
                width: '1150px',
                height: '1150px', 
                objectFit: 'contain',
                opacity: 0.16,
              }} 
            />
          </div>

          {/* 👑 1. CABECERA: Logo Glamour limpio y elevado */}
          <div style={{ 
            display: 'flex', 
            width: '100%', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '145px',
            marginBottom: '40px',
            flexShrink: 0,
          }}>
            <img 
              src={`${origin}/icons/logo-no.png`} 
              style={{ height: '145px', objectFit: 'contain' }} 
            />
          </div>

          {/* 🎴 2. GRILLA DE PRODUCTOS (3 Columnas de 420px = 1330px total) */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            columnGap: '35px', 
            rowGap: '35px', 
            justifyContent: 'center', 
            width: '1330px',
            flexShrink: 0,
          }}>
            {items.map((item) => (
              <div key={item.id} style={{ 
                display: 'flex', background: 'white', borderRadius: '25px', 
                width: '420px', height: '320px', overflow: 'hidden', position: 'relative',
                boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                flexShrink: 0,
              }}>
                <img src={getThumb(item.imagen)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {/* Etiqueta de Precio */}
                {mostrarPrecios && (
                  <div style={{ 
                    position: 'absolute', bottom: '15px', right: '15px', 
                    background: '#FF0000', color: 'white', 
                    padding: '8px 20px', borderRadius: '50px', 
                    fontSize: '56px', fontWeight: 'bold', display: 'flex',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.25)'
                  }}>
                    ${new Intl.NumberFormat('es-AR').format(item.precioTransfer)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 📢 3. CARTEL DE PRODUCTOS RESTANTES (Si hay más de 9) */}
          {restoCount > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '1330px',
              marginTop: '30px',
              background: '#ffffff',
              color: '#FF0000',
              padding: '14px 25px',
              borderRadius: '50px',
              fontSize: '32px',
              fontWeight: 900,
              border: '4px solid #FF0000',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              flexShrink: 0,
            }}>
              + {restoCount} PRODUCTOS MÁS EN ESTE CATÁLOGO · TOCÁ EL LINK PARA VERLOS
            </div>
          )}

          {/* ✨ 4. FRASE DE NOVEDADES (ANCHO 1330px, +35% MÁS GRANDE, ARRIBA DEL ZÓCALO) */}
          <div style={{
            display: 'flex',
            width: '1330px',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '35px',
            marginBottom: '20px',
            flexShrink: 0,
          }}>
            <span style={{ 
              color: '#ffffff', 
              fontSize: '50px', // 👈 +35% más grande (era 36px)
              fontWeight: 900, 
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              textAlign: 'center',
              textShadow: '0 4px 15px rgba(0,0,0,0.5)',
            }}>
              ¡Enterate de estas Novedades!
            </span>
          </div>

          {/* 🏁 5. ZÓCALO FOOTER (TEXTO OSCURO CON tdt.ar) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            width: '1250px',
            justifyContent: 'center', 
            alignItems: 'center', 
            border: '2px solid rgba(255, 255, 255, 0.4)', 
            padding: '24px 25px',
            background: 'rgba(255, 255, 255, 0.35)', 
            borderRadius: '35px',
            flexShrink: 0,
          }}>
            {/* Renglón 1: Blanco nítido */}
            <span style={{ 
              color: '#ffffff', 
              fontSize: '56px', 
              fontWeight: 900, 
              letterSpacing: '1px',
              lineHeight: 1.15,
            }}>
              Catálogo Exclusivo Redes
            </span>

            {/* Renglón 2: Tienda de Tiendas (tdt.ar) en tono carbón/bordó oscuro */}
            <span style={{ 
              color: '#1c0404', // 👈 Oscuro contrastante
              fontSize: '52px', 
              fontWeight: 900, 
              marginTop: '4px',
              letterSpacing: '1.2px',
              lineHeight: 1.15,
            }}>
              Tienda de Tiendas (tdt.ar)
            </span>
          </div>

        </div>
      ),
      { width: canvasWidth, height: canvasHeight }
    )

    // 2️⃣ CONVERSIÓN A JPG (Sharp)
    const pngBuffer = await res.arrayBuffer();
    const jpgBuffer = await sharp(Buffer.from(pngBuffer))
      .jpeg({ 
        quality: 75, 
        mozjpeg: true 
      })
      .toBuffer();

    // 3️⃣ RESPUESTA FINAL
    return new Response(new Uint8Array(jpgBuffer), {
      headers: { 
        'Content-Type': 'image/jpeg', 
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' 
      },
    });

  } catch (e: any) {
    console.error("Error en OG Route:", e.message);
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}