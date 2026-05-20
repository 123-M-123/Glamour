import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 🔍 LOG DE SEGURIDAD: Vamos a ver qué llega del frontend
    console.log("DEBUG: Datos recibidos en process-payment:", JSON.stringify(body));

    const { 
      vendedorEmail, 
      clienteNombre, 
      clienteWhatsapp, 
      puntoEntrega, 
      transaction_amount, // 👈 Lo extraemos explícitamente
      ...formData 
    } = body;

    // 🛡️ REGLA SENIOR: Si el monto no viene en el body principal, 
    // lo buscamos dentro de formData por si la librería lo movió.
    const finalAmount = transaction_amount || formData.transaction_amount;

    if (!finalAmount) {
      console.error("❌ ERROR: El monto (transaction_amount) llegó nulo al servidor.");
      return NextResponse.json({ error: "El monto del pago es nulo o inválido" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const payloadMP = { 
      ...formData, 
      transaction_amount: Number(finalAmount), // 👈 Nos aseguramos que sea un Número
      external_reference: vendedorEmail || "gla_142@hotmail.com",
      metadata: { 
        vendedor_email: vendedorEmail,
        cliente_nombre: clienteNombre,
        cliente_whatsapp: clienteWhatsapp,
        punto_entrega: puntoEntrega
      }
    };

    try {
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify(payloadMP),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("🔥 ERROR REAL DE MERCADO PAGO:", JSON.stringify(data));
        return NextResponse.json(data, { status: response.status });
      }

      // Si el pago es exitoso, disparamos el webhook para anotar en Sheets
      if (data.status === 'approved') {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'payment', data: { id: data.id } })
        }).catch(e => console.error("Error trigger webhook:", e));
      }

      return NextResponse.json(data);

    } finally {
      clearTimeout(timeout);
    }
  } catch (error: any) {
    console.error('❌ CRASH EN PROCESS-PAYMENT:', error.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}