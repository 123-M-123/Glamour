import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendedorEmail, clienteNombre, clienteWhatsapp, puntoEntrega, ...formData } = body;

    const payloadMP = { 
      ...formData, 
      external_reference: vendedorEmail || "gla_142@hotmail.com",
      metadata: { 
        vendedor_email: vendedorEmail,
        cliente_nombre: clienteNombre,
        cliente_whatsapp: clienteWhatsapp,
        punto_entrega: puntoEntrega
      }
    };

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(payloadMP),
    });

    const data = await response.json();

    if (response.ok && data.status === 'approved') {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'payment', data: { id: data.id } })
      }).catch(e => console.error("Error trigger webhook:", e));
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error en process-payment:', error.message);
    return NextResponse.json({ error: 'Error procesando el pago' }, { status: 500 });
  }
}