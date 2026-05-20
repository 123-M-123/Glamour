import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 🔍 LOG DE SEGURIDAD PARA CONTROL
    console.log("DEBUG: Procesando pago para:", body.clienteNombre);

    // 1. Extraemos todo lo que recibimos
    const { 
      vendedorEmail, 
      clienteNombre, 
      clienteWhatsapp, 
      puntoEntrega, 
      transaction_amount,
      // 🛡️ Filtramos los campos que el SDK manda pero la API de MP RECHAZA
      paymentType,
      selectedPaymentMethod,
      formData,
      // Todo lo demás es información válida (token, installments, payer, etc.)
      ...rest 
    } = body;

    // 2. Si hay un objeto 'formData' interno, lo fusionamos (vuelve a ser válido)
    const paymentData = formData ? { ...rest, ...formData } : { ...rest };

    const finalAmount = Number(transaction_amount);

    if (!finalAmount || finalAmount < 100) {
      return NextResponse.json({ error: "Monto inválido para Mercado Pago" }, { status: 400 });
    }

    // 3. Construimos el paquete LIMPIO para Mercado Pago
    const payloadMP = { 
      // Si existe token lo manda, si es pago con cuenta MP usa el method_id correspondiente
      ...paymentData, 
      transaction_amount: finalAmount,
      external_reference: vendedorEmail || "gla_142@hotmail.com",
      // Metadata para que tu Webhook siga recibiendo los datos del cliente
      metadata: { 
        vendedor_email: vendedorEmail,
        cliente_nombre: clienteNombre,
        cliente_whatsapp: clienteWhatsapp,
        punto_entrega: puntoEntrega
      }
    };

    // 🛡️ SEGURIDAD EXTRA: Eliminamos cualquier residuo de campos inválidos en la raíz
    const invalidKeys = ['paymentType', 'selectedPaymentMethod', 'formData', 'vendedorEmail', 'clienteNombre', 'clienteWhatsapp', 'puntoEntrega'];
    invalidKeys.forEach(key => delete (payloadMP as any)[key]);

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
        body: JSON.stringify(payloadMP),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("🔥 ERROR RESPUESTA MERCADO PAGO:", JSON.stringify(data));
        return NextResponse.json(data, { status: response.status });
      }

      // Registro automático en el Webhook si está aprobado
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