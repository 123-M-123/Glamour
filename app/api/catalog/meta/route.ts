export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getProductsFromSheets } from '@/lib/googleSheets';

// Función para limpiar caracteres que rompen el XML (incluyendo los links de Drive)
const escapeXml = (unsafe: any) => {
  if (!unsafe) return "";
  return unsafe.toString().replace(/[<>&"']/g, (c: string) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
};

export async function GET() {
  try {
    const productos = await getProductsFromSheets();
    const baseUrl = "https://glamour-urquiza.vercel.app";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Glamour Urquiza</title>
    <link>${baseUrl}</link>
    <description>Catálogo de Indumentaria Femenina Glamour Urquiza</description>`;

    productos.forEach((p: any) => {
      const catPrincipal = ['cinturones', 'carteras', 'gorras', 'billeteras', 'sobres-de-fiesta', 'perfuminas', 'chokers', 'porta-celulares', 'panuelos', 'pashminas'].includes(p.categoria.toLowerCase()) 
        ? 'accesorios' 
        : 'indumentaria';

      // 🛑 CLAVE: Limpiamos CADA campo, especialmente p.imagen y el link generado
      const productLink = escapeXml(`${baseUrl}/${catPrincipal}/${p.categoria}?p=${p.id}`);
      const imageLink = escapeXml(p.imagen);

      xml += `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.nombre)}</g:title>
      <g:description>${escapeXml(p.descripcion || 'Indumentaria femenina de alta calidad')}</g:description>
      <g:link>${productLink}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:brand>Glamour Urquiza</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${p.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${p.precioTransfer} ARS</g:price>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
    </item>`;
    });

    xml += `
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error("Error generando catálogo:", error);
    return new NextResponse("Error generando catálogo", { status: 500 });
  }
}