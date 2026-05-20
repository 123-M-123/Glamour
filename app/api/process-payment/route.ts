import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 🔍 LOG DE CONTROL (Lo verás en Vercel)
    console.log("DEBUG: Iniciando validación de pago para:", body.clienteNombre);

    const { 
      vendedorEmail, 
      clienteNombre, 
      clienteWhatsapp, 
      puntoEntrega, 
      transaction_amount,
      formData,
      selectedPaymentMethod, // 👈 Lo capturamos para transformarlo
      paymentType,
      ...rest 
    } = body;

    // 1. DETERMINAR EL MÉTODO DE PAGO REAL
    // Si viene en formData (tarjeta) lo usamos. Si no, usamos el selectedPaymentMethod (cuenta MP)
    const finalPaymentMethodId = formData?.payment_method_id || selectedPaymentMethod || paymentType;

    if (!finalPaymentMethodId) {
      console.error("❌ ERROR: No se detectó un payment_method_id válido.");
      return NextResponse.json({ error: "Falta el método de pago" }, { status: 400 });
    }

    // 2. VALIDAR EL MONTO
    const finalAmount = Number(transaction_amount);
    if (!finalAmount || finalAmount < 100) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    // 3. CONSTRUIR EL PAYLOAD ESTRICTO PARA MERCADO PAGO
    // Mercado Pago exige campos específicos. Aquí armamos el objeto "limpio".
    const payloadMP: any = {
      transaction_amount: finalAmount,
      payment_method_id: finalPaymentMethodId,
      external_reference: vendedorEmail || "gla_142@hotmail.com",
      installments: formData?.installments ? Number(formData.installments) : 1,
      payer: formData?.payer || { email: "comprador@tienda.com" }, // Email genérico si falta
      metadata: { 
        vendedor_email: vendedorEmail,
        cliente_nombre: clienteNombre,
        cliente_whatsapp: clienteWhatsapp,
        punto_entrega: puntoEntrega
      }
    };

    // Si es un pago con tarjeta (hay token), lo agregamos
    if (formData?.token) {
      payloadMP.token = formData.token;
    }

    // Si viene issuer_id, lo agregamos
    if (formData?.issuer_id) {
      payloadMP.issuer_id = formData.issuer_id;
    }

    console.log("🚀 Enviando Payload Limpio a MP:", JSON.stringify(payloadMP));

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

    if (!response.ok) {
      console.error("🔥 ERROR RESPUESTA MERCADO PAGO:", JSON.stringify(data));
      return NextResponse.json(data, { status: response.status });
    }

    // Trigger Webhook si se aprobó
    if (data.status === 'approved') {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'payment', data: { id: data.id } })
      }).catch(e => console.error("Error trigger webhook:", e));
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ CRASH EN PROCESS-PAYMENT:', error.message);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}