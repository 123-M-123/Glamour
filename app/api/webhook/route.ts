import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;

// Auth Service Account
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function agregarEnSheet(fila: any[]) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Pedidos!A:J', // 👈 Pestaña Pedidos, Columnas A-J
    valueInputOption: 'RAW',
    requestBody: { values: [fila] },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.type !== 'payment') return NextResponse.json({ status: 'ignored' });

    const paymentId = body.data?.id;
    if (!paymentId) return NextResponse.json({ status: 'error' });

    // 1. Consultar a Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
    });
    const pago = await mpRes.json();

    if (pago.status !== 'approved') return NextResponse.json({ status: 'not_approved' });

    // 2. Extraer Metadata (Nuestros 3 campos mágicos)
    const { cliente_nombre, cliente_whatsapp, punto_entrega, vendedor_email } = pago.metadata;
    
    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    const vendedorFijo = vendedor_email || pago.external_reference || "gla_142@hotmail.com";

    // 3. Mapeo a 10 Columnas (A-J)
    const fila = [
      vendedorFijo,                       // A: Vendedor
      fecha,                              // B: Fecha
      pago.description || 'Compra Online',// C: Productos
      pago.transaction_amount,            // D: Precio
      'PAGADO (MP)',                      // E: Estado
      paymentId,                          // F: Comprobante (ID Transacción)
      `Tarjeta: ${pago.payment_method_id}`,// G: Notas
      cliente_nombre || 'S/D',            // H: Nombre
      cliente_whatsapp || 'S/D',          // I: WhatsApp
      punto_entrega || 'S/D'              // J: Entrega
    ];

    await agregarEnSheet(fila);

    // 4. Notificación por Email (Resend)
    if (process.env.RESEND_API_KEY && cliente_whatsapp) {
      const msgWa = encodeURIComponent(`¡Hola ${cliente_nombre}! Gracias por tu compra. Recibimos el pago #${paymentId}. Estamos preparando tu envío a: ${punto_entrega}.`);
      const linkWa = `https://wa.me/${cliente_whatsapp.replace(/\D/g, '')}?text=${msgWa}`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'Tienda de Tiendas <onboarding@resend.dev>',
          to: [vendedorFijo],
          subject: `💰 ¡Cobro Recibido! - ${cliente_nombre}`,
          html: `
            <div style="font-family: sans-serif; border: 2px solid #25D366; padding: 20px; border-radius: 15px; max-width: 500px;">
              <h2 style="color: #25D366;">¡Pago Confirmado!</h2>
              <p><strong>Cliente:</strong> ${cliente_nombre}</p>
              <p><strong>Monto:</strong> $${pago.transaction_amount}</p>
              <p><strong>Entrega:</strong> ${punto_entrega}</p>
              <br>
              <a href="${linkWa}" style="background: #25D366; color: white; padding: 15px; border-radius: 50px; text-decoration: none; font-weight: bold; display: block; text-align: center;">
                CONTACTAR POR WHATSAPP
              </a>
            </div>`
        }),
      }).catch(e => console.error("Error Resend Webhook:", e));
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error Webhook:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}