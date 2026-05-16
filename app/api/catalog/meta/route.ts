import { NextResponse } from 'next/server';
import { getProductsFromSheets } from '@/lib/googleSheets';

export async function GET() {
  const productos = await getProductsFromSheets();
  const baseUrl = "https://glamoururquiza.vercel.app"; // 👈 Tu dominio real

  // Generamos el formato XML que pide Facebook
  let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Glamour Urquiza</title>
    <link>${baseUrl}</title>
    <description>Catálogo de Indumentaria Femenina</description>`;

  productos.forEach((p: any) => {
    xml += `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${p.nombre}</g:title>
      <g:description>${p.descripcion || 'Indumentaria Glamour'}</g:description>
      <g:link>${baseUrl}/indumentaria/${p.categoria}?p=${p.id}</g:link>
      <g:image_link>${p.imagen}</g:image_link>
      <g:brand>Glamour Urquiza</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${p.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${p.precioTransfer} ARS</g:price>
      <g:google_product_category>Clothing &amp; Accessories &gt; Clothing</g:google_product_category>
    </item>`;
  });

  xml += `  </channel>\n</rss>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}