import { NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const metodo = body.metodo || 'tarjeta'
    const vendedorEmail = "elianamarti90@gmail.com"; 

    let items = []
    if (body.items && Array.isArray(body.items)) {
      items = body.items.map((item: any) => ({
        title: item.title,
        unit_price: (metodo === 'transferencia' || metodo === 'alias') ? Math.round(Number(item.price) * 0.9) : Number(item.price),
        quantity: Number(item.quantity),
        currency_id: 'ARS',
      }))
    } else {
      items = [{
        title: body.title || 'Compra',
        unit_price: (metodo === 'transferencia' || metodo === 'alias') ? Math.round(Number(body.price) * 0.9) : Number(body.price),
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
      },
    })

    return NextResponse.json({ id: result.id })
  } catch (error: any) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}