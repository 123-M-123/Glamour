import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const vendedorEmail = "elianamarti90@gmail.com";

    const { vendedorEmail: _, ...datosLimpios } = formData;

    // Timeout explícito para evitar ETIMEDOUT
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    let response: Response
    try {
      response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({ 
          ...datosLimpios, 
          external_reference: vendedorEmail,
          differential_pricing_id: undefined 
        }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    const data = await response.json()

    console.log('Respuesta MP:', data.status, data.id)

    if (response.ok && data.status === 'approved') {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'payment', data: { id: data.id } })
        })
      } catch (webhookError) {
        console.error('Error notificando webhook:', webhookError)
      }
    }

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Error procesando pago:', error.message)
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Timeout conectando con MercadoPago. Intentá de nuevo.' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error procesando el pago' },
      { status: 500 }
    )
  }
}