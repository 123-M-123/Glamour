import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 🔍 LOG DE SEGURIDAD
    console.log("DEBUG: Body completo recibido:", JSON.stringify(body));

    const { 
      vendedorEmail, 
      clienteNombre, 
      clienteWhatsapp, 
      puntoEntrega, 
      transaction_amount,
      ...formData 
    } = body;

    // 🛡️ REGLA DE ORO: Validar el monto antes de procesar
    const finalAmount = transaction_amount || formData.transaction_amount;

    if (!finalAmount || Number(finalAmount) < 100) {
      console.error("❌ ERROR CRÍTICO: Monto inválido o nulo:", finalAmount);
      return NextResponse.json({ 
        error: "Monto inválido", 
        detail: "El monto no llegó al servidor o es menor al mínimo ($100)" 
      }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    // Construimos el objeto exacto para Mercado Pago
    const payloadMP = { 
      ...formData, 
      transaction_amount: Number(finalAmount),
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
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🔥 ERROR RESPUESTA MERCADO PAGO:", JSON.stringify(data));
      return NextResponse.json(data, { status: response.status });
    }

    // Si se aprueba, disparamos el webhook para anotar en Sheets
    if (data.status === 'approved') {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'payment', data: { id: data.id } })
      }).catch(e => console.error("Error trigger webhook:", e));
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ CRASH EN API PROCESS-PAYMENT:', error.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}