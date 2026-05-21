import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 🔍 LOG DE SEGURIDAD PARA VERCEL
    console.log("DEBUG: Body recibido del cliente:", JSON.stringify(body));

    const { 
      vendedorEmail, 
      clienteNombre, 
      clienteWhatsapp, 
      puntoEntrega, 
      transaction_amount,
      formData,
      selectedPaymentMethod,
      paymentType,
      ...rest 
    } = body;

    // 1. 🛡️ TRADUCCIÓN DE MÉTODO DE PAGO (MAGIA SENIOR)
    // El SDK manda "wallet_purchase", pero la API exige "account_money"
    let finalPaymentMethodId = formData?.payment_method_id || selectedPaymentMethod || paymentType;
    
    if (finalPaymentMethodId === 'wallet_purchase') {
      finalPaymentMethodId = 'account_money';
    }

    if (!finalPaymentMethodId) {
      console.error("❌ ERROR: No se pudo determinar el payment_method_id");
      return NextResponse.json({ error: "Método de pago no identificado" }, { status: 400 });
    }

    // 2. VALIDACIÓN DE MONTO
    const finalAmount = Number(transaction_amount);
    if (!finalAmount || finalAmount < 150) {
      return NextResponse.json({ 
        error: "Monto muy bajo", 
        detail: "Mercado Pago requiere un mínimo de $150 para procesar pagos online." 
      }, { status: 400 });
    }

    // 3. CONSTRUCCIÓN DEL PAYLOAD ESTRICTO
    const payloadMP: any = {
      transaction_amount: finalAmount,
      payment_method_id: finalPaymentMethodId,
      external_reference: vendedorEmail || "gla_142@hotmail.com",
      installments: formData?.installments ? Number(formData.installments) : 1,
      // MP exige un email del pagador. Si no viene en el form, usamos un placeholder.
      payer: {
        email: formData?.payer?.email || "comprador-glamour@test.com"
      },
      metadata: { 
        vendedor_email: vendedorEmail,
        cliente_nombre: clienteNombre,
        cliente_whatsapp: clienteWhatsapp,
        punto_entrega: puntoEntrega
      }
    };

    // Si hay un token de tarjeta, lo agregamos
    if (formData?.token) payloadMP.token = formData.token;
    if (formData?.issuer_id) payloadMP.issuer_id = formData.issuer_id;

    console.log("🚀 Enviando a Mercado Pago con ID traducido:", finalPaymentMethodId);

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

    // Si se aprueba, disparamos el Webhook para registrar en la Planilla Maestra
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
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}