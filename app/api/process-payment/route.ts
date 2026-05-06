import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const vendedorEmail = "elianamarti90@gmail.com";

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ 
        ...formData, 
        external_reference: vendedorEmail,
        differential_pricing_id: undefined 
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'approved') {
      // SI EL PAGO ES OK, AVISAMOS AL WEBHOOK PARA QUE ESCRIBA EN EL EXCEL
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'payment', data: { id: data.id } })
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}