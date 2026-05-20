import { NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const vendedorEmail = body.vendedorEmail || "gla_142@hotmail.com"; 

    const unitPrice = Math.round(Number(body.price));
    if (unitPrice < 150) {
      return NextResponse.json({ error: "Monto menor al mínimo" }, { status: 400 });
    }

    // 🛡️ Limpiamos la URL para evitar el Warning de url.parse
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`.trim();

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
        notification_url: webhookUrl,
        metadata: {
          vendedor_email: vendedorEmail,
          cliente_nombre: body.clienteNombre || "Cliente Online",
          cliente_whatsapp: body.clienteWhatsapp || "",
          punto_entrega: body.puntoEntrega || "No especificado"
        }
      },
    })

    return NextResponse.json({ id: result.id })
  } catch (error: any) {
    console.error("🔥 ERROR MP PREFERENCE:", error.message);
    return NextResponse.json({ error: "Error en preferencia" }, { status: 500 })
  }
}