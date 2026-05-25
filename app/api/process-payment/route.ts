// app/api/process-payment/route.ts - REEMPLAZAR COMPLETO
import { NextRequest, NextResponse } from 'next/server';

const PAYWAY_ENDPOINT = process.env.NODE_ENV === 'production' 
  ? 'https://api.decidir.com/api/v2/payments' 
  : 'https://sandbox.decidir.com/api/v2/payments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metodo, monto, customer, items, paymentDetail, vendedorEmail } = body;

    // --- LÓGICA PAYWAY ---
    if (metodo === 'payway') {
      const paywayPayload = {
        site_transaction_id: `TX-${Date.now()}`,
        token: paymentDetail.token || "mock_token_for_testing", // El token generado en el frontend
        amount: Math.round(monto),
        currency: 'ARS',
        installments: 1,
        payment_method_id: 1, // Visa/MasterCard (simplificado)
        bin: paymentDetail.lastFour ? "450799" : null, // Ejemplo
        customer: {
          id: customer.whatsapp,
          email: vendedorEmail || "tiendadetiendas@gmail.com",
        }
      };

      const response = await fetch(PAYWAY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.PAYWAY_PRIVATE_KEY || ''
        },
        body: JSON.stringify(paywayPayload),
      });

      const data = await response.json();

      // Si el pago es aprobado por Payway
      if (response.ok && data.status === 'approved') {
        // Disparamos el webhook interno para guardar en Sheets (10 columnas) y enviar mail
        await triggerInternalWebhook(data.id, 'payway', body);
        return NextResponse.json({ status: 'approved', id: data.id });
      } else {
        return NextResponse.json({ error: data.error_type || 'Pago rechazado' }, { status: 400 });
      }
    }

    // --- LÓGICA MERCADO PAGO (Existente) ---
    const payloadMP = { 
      ...body, 
      external_reference: vendedorEmail || "gla_142@hotmail.com",
      metadata: { 
        vendedor_email: vendedorEmail,
        cliente_nombre: body.clienteNombre,
        cliente_whatsapp: body.clienteWhatsapp,
        punto_entrega: body.puntoEntrega
      }
    };

    const responseMP = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(payloadMP),
    });

    const dataMP = await responseMP.json();

    if (responseMP.ok && (dataMP.status === 'approved' || dataMP.status === 'pending')) {
      await triggerInternalWebhook(dataMP.id, 'mercado_pago', body);
    }

    return NextResponse.json(dataMP);

  } catch (error: any) {
    console.error('Error en process-payment:', error.message);
    return NextResponse.json({ error: 'Error procesando el pago' }, { status: 500 });
  }
}

/**
 * 🛠️ HELPER: Notifica al sistema central para sincronizar Sheets y Mail
 */
async function triggerInternalWebhook(paymentId: string, provider: string, originalData: any) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'payment', 
        provider,
        data: { id: paymentId, originalData } 
      })
    });
  } catch (err) {
    console.error('Error notificando webhook interno:', err);
  }
}