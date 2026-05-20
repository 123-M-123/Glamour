import { NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

// Inicialización optimizada
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const vendedorEmail = body.vendedorEmail || "gla_142@hotmail.com"; 

    // Limpieza de precio para evitar errores de decimales
    const unitPrice = Math.round(Number(body.price));

    if (unitPrice < 150) {
      return NextResponse.json({ error: "El monto es inferior al mínimo" }, { status: 400 });
    }

    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items: [{
          id: 'item-glamour',
          title: (body.title || 'Compra Glamour').substring(0, 250),
          unit_price: unitPrice,
          quantity: 1,
          currency_id: 'ARS',
        }],
        external_reference: vendedorEmail,
        // Forzamos URL absoluta para evitar problemas con url.parse
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`,
        metadata: {
          vendedor_email: vendedorEmail,
          cliente_nombre: body.clienteNombre || "S/D",
          cliente_whatsapp: body.clienteWhatsapp || "S/D",
          punto_entrega: body.puntoEntrega || "S/D"
        }
      },
    })

    return NextResponse.json({ id: result.id })
  } catch (error: any) {
    console.error("🔥 ERROR MP PREFERENCE:", error.message);
    return NextResponse.json({ error: "Error al generar el link de pago" }, { status: 500 })
  }
}