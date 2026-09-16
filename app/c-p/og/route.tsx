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

    // 🟢 CÁLCULO DE ALTURA DINÁMICA (Sin huecos vacíos)
    const totalItems = items.length || 1;
    const filas = Math.max(1, Math.ceil(totalItems / 3));
    const canvasWidth = 1500;

    // Encabezado (logo + frase) = ~250px | Cada fila = 355px | Cartel resto = 105px | Footer = 175px
    const baseHeader = 250;
    const gridHeight = filas * 320 + (filas - 1) * 35;
    const extraHeight = restoCount > 0 ? 105 : 0;
    const footerHeight = 175;
    const canvasHeight = baseHeader + gridHeight + extraHeight + footerHeight;

    // 1️⃣ GENERACIÓN DEL FLYER ADAPTATIVO (Next/OG - Satori)
    const res = new ImageResponse(
      (
        <div style={{
          background: '#FF0000',
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          display: 'flex',
          flexDirection: 'column',
          padding: '30px 50px 30px', // 👈 Subido unos píxeles arriba
          alignItems: 'center',
          position: 'relative',
        }}>

          {/* 💧 MARCA DE AGUA Y RESPLANDOR (SIEMPRE AL CENTRO EXACTO DEL ALTO TOTAL) */}
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
              width: '1150px',
              height: '1150px',
              borderRadius: '575px',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 0, 0, 0) 65%)',
              display: 'flex',
            }} />

            {/* Marca de agua c-p-t-r */}
            <img 
              src={`${origin}/c-p-t-r.png`} 
              style={{ 
                width: '1150px',
                height: '1150px', 
                objectFit: 'contain',
                opacity: 0.16, // 👈 Sutil y elegante
              }} 
            />
          </div>

          {/* 👑 Cabecera con Logo Glamour (+20% tamaño y elevado) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <img 
              src={`${origin}/icons/logo-no.png`} 
              style={{ height: '145px', objectFit: 'contain', marginBottom: '8px' }} // 👈 +20% agrandado
            />
            {/* ✨ Frase de Novedades */}
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.95)', 
              fontSize: '36px', 
              fontWeight: 800, 
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textShadow: '0 3px 12px rgba(0,0,0,0.3)'
            }}>
              ¡Enterate de estas Novedades!
            </span>
          </div>

          {/* 🎴 Grilla de Productos */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '35px', 
            justifyContent: 'center', 
            width: '1350px' 
          }}>
            {items.map((item) => (
              <div key={item.id} style={{ 
                display: 'flex', background: 'white', borderRadius: '25px', 
                width: '420px', height: '320px', overflow: 'hidden', position: 'relative',
                boxShadow: '0 10px 25px rgba(0,0,0,0.25)'
              }}>
                <img src={getThumb(item.imagen)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {/* Etiqueta de Precio Condicional */}
                {mostrarPrecios && (
                  <div style={{ 
                    position: 'absolute', bottom: '15px', right: '15px', 
                    background: '#FF0000', color: 'white', 
                    padding: '8px 20px', borderRadius: '50px', 
                    fontSize: '60px', fontWeight: 'bold', display: 'flex',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.25)'
                  }}>
                    ${new Intl.NumberFormat('es-AR').format(item.precioTransfer)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 📢 CARTEL DE PRODUCTOS RESTANTES (BLANCO CON ROJO, ANCHO TOTAL 1350px, +25% TAMAÑO) */}
          {restoCount > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '1350px', // 👈 Abarca todo el ancho de la grilla
              marginTop: '25px',
              background: '#ffffff',
              color: '#FF0000',
              padding: '14px 25px',
              borderRadius: '50px',
              fontSize: '34px', // 👈 +25% tamaño de letra
              fontWeight: 900,
              border: '4px solid #FF0000',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              + {restoCount} PRODUCTOS MÁS EN ESTE CATÁLOGO · TOCÁ EL LINK PARA VERLOS
            </div>
          )}

          {/* 🏁 ZÓCALO FOOTER */}
          <div style={{ 
            marginTop: 'auto', 
            display: 'flex', 
            flexDirection: 'column',
            width: '1250px',
            justifyContent: 'center', 
            alignItems: 'center', 
            border: '2px solid rgba(255, 255, 255, 0.4)', 
            padding: '22px 25px',
            background: 'rgba(255, 255, 255, 0.35)', 
            borderRadius: '35px',
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

            {/* Renglón 2: Tienda de Tiendas en Rojo Oscuro / Carbón Elegante */}
            <span style={{ 
              color: '#3B0000', // 👈 Tono oscuro contrastante sobre fondo translúcido
              fontSize: '54px', 
              fontWeight: 900, 
              marginTop: '4px',
              letterSpacing: '1.5px',
              lineHeight: 1.15,
            }}>
              Tienda de Tiendas
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