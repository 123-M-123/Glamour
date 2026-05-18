import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const SHEET_ID  = process.env.GOOGLE_SHEET_ID!;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function getGoogleAuthClient() {
  return new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function agregarEnSheet(titulo: string, precio: string, fecha: string, vendedorEmail: string, clienteNombre: string, clienteWhatsapp: string, puntoEntrega: string) {
  try {
    const auth = await getGoogleAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const range = 'Pedidos!A:J'; 
    const values = [[vendedorEmail, fecha, titulo, precio, 'POR_VERIFICAR', 'FOTO EN GMAIL', 'Venta Online Web', clienteNombre, clienteWhatsapp, puntoEntrega]];
    await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID, range, valueInputOption: 'RAW', requestBody: { values } });
  } catch (error: any) { console.error('Error Sheets:', error.message); }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const archivo = form.get('archivo') as File | null;
    const titulo = (form.get('titulo') as string) || "Pedido";
    const precio = (form.get('precio') as string) || "0";
    const vendedorEmail = (form.get('vendedorEmail') as string) || "tiendadtiendas@gmail.com";
    const clienteNombre = (form.get('clienteNombre') as string) || "";
    const clienteWhatsapp = (form.get('clienteWhatsapp') as string) || "";
    const puntoEntrega = (form.get('puntoEntrega') as string) || "No especificado";

    if (!archivo || !clienteNombre || !clienteWhatsapp) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    await agregarEnSheet(titulo, precio, fecha, vendedorEmail, clienteNombre, clienteWhatsapp, puntoEntrega);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const buffer = Buffer.from(await archivo.arrayBuffer());
        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
        const linkWa = `https://wa.me/${clienteWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${clienteNombre}! Recibimos tu comprobante.`)}`;

        await transporter.sendMail({
          from: `"Tienda de Tiendas" <${process.env.EMAIL_USER}>`,
          to: 'tiendadtiendas@gmail.com',
          subject: `🛍️ NUEVA VENTA - ${clienteNombre}`,
          html: `<div style="font-family:sans-serif; border:2px solid #FFC9CB; padding:20px; border-radius:15px; max-width:500px;">
                  <h2 style="color:#FF0000; text-align:center;">¡Nueva Venta Glamour!</h2>
                  <p><strong>Cliente:</strong> ${clienteNombre}</p>
                  <p><strong>WhatsApp:</strong> ${clienteWhatsapp}</p>
                  <p><strong>Total:</strong> $${precio}</p>
                  <p><strong>Entrega:</strong> ${puntoEntrega}</p>
                  <br><a href="${linkWa}" style="background:#25D366; color:white; padding:15px; border-radius:50px; text-decoration:none; display:block; text-align:center; font-weight:bold;">CONTACTAR POR WHATSAPP</a>
                </div>`,
          attachments: [{ filename: archivo.name, content: buffer }]
        });
      } catch (e) { console.error("Error Mail:", e); }
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}