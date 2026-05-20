import { NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const metodo = body.metodo || 'tarjeta'
    const vendedorEmail = body.vendedorEmail || "gla_142@hotmail.com"; 

    // 🛡️ Capturamos los datos del cliente que vienen del Modal
    const clienteNombre = body.clienteNombre || "Cliente Online";
    const clienteWhatsapp = body.clienteWhatsapp || "";
    const puntoEntrega = body.puntoEntrega || "No especificado";

    let items = []
    if (body.items && Array.isArray(body.items)) {
      items = body.items.map((item: any) => ({
        id: item.id || 'item-glamour', // 👈 Solución al error ts(2741)
        title: item.title,
        unit_price: (metodo === 'transferencia' || metodo === 'alias') ? Math.round(Number(item.price) * 0.9) : Math.round(Number(item.price)),
        quantity: Number(item.quantity),
        currency_id: 'ARS',
      }))
    } else {
      items = [{
        id: 'item-glamour-unique', // 👈 Solución al error ts(2741)
        title: (body.title || 'Compra Glamour').substring(0, 250),
        unit_price: Math.round(Number(body.price)),
        quantity: Number(body.quantity || 1),
        currency_id: 'ARS',
      }]
    }

    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items,
        external_reference: vendedorEmail,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`,
        metadata: {
          vendedor_email: vendedorEmail,
          cliente_nombre: clienteNombre,
          cliente_whatsapp: clienteWhatsapp,
          punto_entrega: puntoEntrega
        }
      },
    })

    return NextResponse.json({ id: result.id })
  } catch (error: any) {
    console.error("🔥 Error al crear preferencia MP:", error.message);
    return NextResponse.json({ error: 'Error al procesar el pago' }, { status: 500 })
  }
}