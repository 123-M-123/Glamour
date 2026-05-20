import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      vendedorEmail, 
      clienteNombre, 
      clienteWhatsapp, 
      puntoEntrega, 
      ...formData 
    } = body;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({ 
          ...formData, 
          external_reference: vendedorEmail || "gla_142@hotmail.com",
          metadata: { 
            vendedor_email: vendedorEmail,
            cliente_nombre: clienteNombre,
            cliente_whatsapp: clienteWhatsapp,
            punto_entrega: puntoEntrega
          }
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      // 🔍 DETECCIÓN DE ERROR DE MERCADO PAGO
      if (!response.ok) {
        console.error("🔥 ERROR MP PROCESS-PAYMENT:", JSON.stringify(data));
        // Devolvemos el error real de MP para que el Brick lo entienda
        return NextResponse.json(data, { status: response.status });
      }

      if (data.status === 'approved') {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'payment', data: { id: data.id } })
        }).catch(e => console.error("Error trigger webhook manual:", e));
      }

      return NextResponse.json(data);

    } finally {
      clearTimeout(timeout);
    }
  } catch (error: any) {
    console.error('❌ CRASH EN PROCESS-PAYMENT:', error.message);
    return NextResponse.json({ error: 'Error procesando el pago' }, { status: 500 });
  }
}