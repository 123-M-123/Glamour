import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || process.env.MASTER_PAYMENTS_SHEET_ID!;
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;

// Auth Service Account para Google Sheets
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

    const provider = body.provider || 'mercado_pago'; // Default para retrocompatibilidad
    let paymentId = body.data?.id;
    
    // Variables normalizadas
    let clienteNombre = '';
    let clienteWhatsapp = '';
    let puntoEntrega = '';
    let vendedorEmail = '';
    let monto = 0;
    let estadoLabel = '';
    let notas = '';
    let productosDesc = '';

    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

    // --- CASO 1: MERCADO PAGO ---
    if (provider === 'mercado_pago') {
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
      });
      
      if (!mpRes.ok) return NextResponse.json({ status: 'error_mp_query' });
      const pago = await mpRes.json();
      if (pago.status !== 'approved' && pago.status !== 'pending') return NextResponse.json({ status: 'not_target_status' });

      const meta = pago.metadata || {};
      clienteNombre = meta.cliente_nombre || 'Cliente MP';
      clienteWhatsapp = meta.cliente_whatsapp || '';
      puntoEntrega = meta.punto_entrega || 'No especificado';
      vendedorEmail = meta.vendedor_email || pago.external_reference || "gla_142@hotmail.com";
      monto = pago.transaction_amount;
      estadoLabel = pago.status === 'approved' ? 'PAGADO (MP)' : 'PENDIENTE (MP)';
      notas = `Método: ${pago.payment_method_id}`;
      productosDesc = pago.description || 'Compra Online';

    } 
    // --- CASO 2: PAYWAY ---
    else if (provider === 'payway') {
      const { originalData } = body.data; // Datos pasados desde process-payment
      clienteNombre = originalData.customer.nombre;
      clienteWhatsapp = originalData.customer.whatsapp;
      puntoEntrega = originalData.customer.entrega;
      vendedorEmail = originalData.vendedorEmail || "gla_142@hotmail.com";
      monto = originalData.monto;
      estadoLabel = 'PAGADO (PAYWAY)';
      paymentId = body.data.id;
      notas = `Tarjeta: **** ${originalData.paymentDetail?.lastFour || 'Bancaria'}`;
      productosDesc = originalData.items?.map((i: any) => `${i.cantidad}x ${i.producto.nombre}`).join(', ') || 'Compra Payway';
    }

    // 3. Mapeo a 10 Columnas (A-J) - FIDELIDAD ABSOLUTA
    const fila = [
      vendedorEmail,      // A: Vendedor
      fecha,              // B: Fecha
      productosDesc,      // C: Productos
      monto,              // D: Precio
      estadoLabel,        // E: Estado
      paymentId.toString(),// F: ID Transacción
      notas,              // G: Notas
      clienteNombre,      // H: Nombre
      clienteWhatsapp,    // I: WhatsApp
      puntoEntrega        // J: Entrega
    ];

    await agregarEnSheet(fila);

    // 4. Notificación vía Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const msgWa = encodeURIComponent(`¡Hola ${clienteNombre}! 👋 Confirmamos tu pago de $${monto}. Estamos preparando tu envío a: ${puntoEntrega}.`);
        const linkWa = `https://wa.me/${clienteWhatsapp.toString().replace(/\D/g, '')}?text=${msgWa}`;

        await transporter.sendMail({
          from: `"Tienda de Tiendas" <${process.env.EMAIL_USER}>`,
          to: 'tiendadtiendas@gmail.com',
          subject: `💰 ¡COBRO ${provider.toUpperCase()}! - ${clienteNombre}`,
          html: `
            <div style="font-family: sans-serif; border: 2px solid #FF0000; padding: 20px; border-radius: 15px; max-width: 500px;">
              <h2 style="color: #FF0000; text-align: center;">¡Nuevo Pago Confirmado!</h2>
              <div style="background-color: #FFF5F5; padding: 15px; border-radius: 10px; border: 1px solid #FFC9CB;">
                <p><strong>Plataforma:</strong> ${provider.toUpperCase()}</p>
                <p><strong>Cliente:</strong> ${clienteNombre}</p>
                <p><strong>Monto:</strong> $${monto}</p>
                <p><strong>WhatsApp:</strong> ${clienteWhatsapp}</p>
                <p><strong>Entrega:</strong> ${puntoEntrega}</p>
                <p><strong>ID:</strong> #${paymentId}</p>
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

    return NextResponse.json({ status: 'ok', provider });
  } catch (error: any) {
    console.error('🔥 CRASH WEBHOOK:', error.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}