import { NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const metodo = body.metodo || 'tarjeta'
    const vendedorEmail = body.vendedorEmail || "gla_142@hotmail.com"; 

    // 🛡️ Capturamos los datos del cliente que vienen del Modal (Tu lógica original)
    const clienteNombre = body.clienteNombre || "Cliente Online";
    const clienteWhatsapp = body.clienteWhatsapp || "";
    const puntoEntrega = body.puntoEntrega || "No especificado";

    let items = []
    if (body.items && Array.isArray(body.items)) {
      items = body.items.map((item: any) => ({
        title: item.title,
        // 🛡️ Aseguramos que el precio sea un número entero para evitar rechazos de MP
        unit_price: (metodo === 'transferencia' || metodo === 'alias') ? Math.round(Number(item.price) * 0.9) : Math.round(Number(item.price)),
        quantity: Number(item.quantity),
        currency_id: 'ARS',
      }))
    } else {
      items = [{
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
        // 📦 Fusionamos tus metadatos para que el Webhook los lea (Sincronizado con ayer)
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
    // 🔍 SENSOR DE DIAGNÓSTICO: Si MP rechaza la preferencia, lo vemos en Vercel
    console.error("🔥 ERROR MP PREFERENCE:", error.message);
    if (error.cause) console.error("📋 CAUSA MP:", JSON.stringify(error.cause));
    
    return NextResponse.json({ error: 'Error al crear preferencia' }, { status: 500 })
  }
}