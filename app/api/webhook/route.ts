import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;

// Auth Service Account
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function agregarEnSheet(fila: any[]) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Pedidos!A:J', 
      valueInputOption: 'RAW',
      requestBody: { values: [fila] },
    });
  } catch (error: any) {
    console.error('❌ Error escribiendo en Sheets (Webhook):', error.message);
  }
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
    
    if (!mpRes.ok) return NextResponse.json({ status: 'error_mp_query' });
    const pago = await mpRes.json();

    if (pago.status !== 'approved') return NextResponse.json({ status: 'not_approved' });

    // 2. Extraer Metadata (Nuestros 3 campos capturados en el modal)
    // Usamos ?. para evitar crash si la metadata viene vacía
    const meta = pago.metadata || {};
    const clienteNombre = meta.cliente_nombre || 'Cliente Online';
    const clienteWhatsapp = meta.cliente_whatsapp || '';
    const puntoEntrega = meta.punto_entrega || 'No especificado';
    const vendedorFijo = meta.vendedor_email || pago.external_reference || "gla_142@hotmail.com";

    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

    // 3. Mapeo a 10 Columnas (A-J)
    const fila = [
      vendedorFijo,                       // A: Vendedor
      fecha,                              // B: Fecha
      pago.description || 'Compra Online',// C: Productos
      pago.transaction_amount,            // D: Precio
      'PAGADO (MP)',                      // E: Estado
      paymentId.toString(),               // F: ID Transacción
      `Método: ${pago.payment_method_id}`,// G: Notas
      clienteNombre,                      // H: Nombre
      clienteWhatsapp,                    // I: WhatsApp
      puntoEntrega                        // J: Entrega
    ];

    await agregarEnSheet(fila);

    // 4. Notificación vía Nodemailer (Igual que en transferencias)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const msgWa = encodeURIComponent(`¡Hola ${clienteNombre}! 👋 Confirmamos tu pago en Glamour Urquiza. Estamos preparando tu envío a: ${puntoEntrega}.`);
        const linkWa = `https://wa.me/${clienteWhatsapp.toString().replace(/\D/g, '')}?text=${msgWa}`;

        await transporter.sendMail({
          from: `"Tienda de Tiendas" <${process.env.EMAIL_USER}>`,
          to: 'tiendadtiendas@gmail.com', // 👈 Te llega a vos
          subject: `💰 ¡COBRO RECIBIDO! - ${clienteNombre}`,
          html: `
            <div style="font-family: sans-serif; border: 2px solid #25D366; padding: 20px; border-radius: 15px; max-width: 500px;">
              <h2 style="color: #25D366; text-align: center;">¡Pago Aprobado!</h2>
              <div style="background-color: #F0FDF4; padding: 15px; border-radius: 10px;">
                <p><strong>Tienda:</strong> Glamour Urquiza</p>
                <p><strong>Cliente:</strong> ${clienteNombre}</p>
                <p><strong>Monto:</strong> $${pago.transaction_amount}</p>
                <p><strong>WhatsApp:</strong> ${clienteWhatsapp}</p>
                <p><strong>Entrega:</strong> ${puntoEntrega}</p>
                <p><strong>ID Pago:</strong> #${paymentId}</p>
              </div>
              <br>
              <a href="${linkWa}" style="background: #25D366; color: white; padding: 15px; border-radius: 50px; text-decoration: none; font-weight: bold; display: block; text-align: center;">
                CONTACTAR POR WHATSAPP
              </a>
            </div>`
        });
      } catch (mailErr) {
        console.error("❌ Error enviando mail Webhook:", mailErr);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('🔥 CRASH WEBHOOK:', error.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}