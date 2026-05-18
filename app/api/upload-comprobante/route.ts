import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { CLIENTE_ACTUAL } from '@/lib/clientes';
import nodemailer from 'nodemailer';

const FOLDER_ID = '1oMY4j8SkKqgDmE3LzGEp1K2SqcarXY_G';
const SHEET_ID  = process.env.GOOGLE_SHEET_ID!;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function getGoogleAuthClient() {
  return new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'],
  });
}

async function agregarEnSheet(titulo: string, precio: string, linkDrive: string, fecha: string, vendedorEmail: string, clienteNombre: string, clienteWhatsapp: string, puntoEntrega: string) {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const range = 'Pedidos!A:J'; 
  const values = [[vendedorEmail, fecha, titulo, precio, 'POR_VERIFICAR', linkDrive, 'Venta Online Web', clienteNombre, clienteWhatsapp, puntoEntrega]];
  await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID, range, valueInputOption: 'RAW', requestBody: { values } });
}

async function subirADrive(archivo: File): Promise<string> {
  const auth = await getGoogleAuthClient();
  const drive = google.drive({ version: 'v3', auth });
  const buffer = Buffer.from(await archivo.arrayBuffer());
  
  try {
    const res = await drive.files.create({
      requestBody: {
        name: `COMPROBANTE-${Date.now()}-${archivo.name}`,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: archivo.type,
        body: require('stream').Readable.from(buffer),
      },
      fields: 'id, webViewLink',
      supportsAllDrives: true, 
    });

    if (!res.data.id) throw new Error('Error al crear el archivo');

    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    return res.data.webViewLink || '';
  } catch (error: any) {
    console.error('❌ Error de Drive:', error.message);
    throw new Error(`Error de Almacenamiento: ${error.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    
    // 🛡️ CASTING EXPLÍCITO A STRING PARA EVITAR ERROR TS(2345)
    const archivo = form.get('archivo') as File | null;
    const titulo = (form.get('titulo') as string) || "";
    const precio = (form.get('precio') as string) || "";
    const vendedorEmail = (form.get('vendedorEmail') as string) || "tiendadtiendas@gmail.com";
    const clienteNombre = (form.get('clienteNombre') as string) || "";
    const clienteWhatsapp = (form.get('clienteWhatsapp') as string) || "";
    const puntoEntrega = (form.get('puntoEntrega') as string) || "No especificado";

    if (!archivo || !titulo || !precio || !clienteNombre || !clienteWhatsapp) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const linkDrive = await subirADrive(archivo);
    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

    await agregarEnSheet(titulo, precio, linkDrive, fecha, vendedorEmail, clienteNombre, clienteWhatsapp, puntoEntrega);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        // Ahora clienteNombre y titulo son garantizados como string
        const msgWa = encodeURIComponent(`¡Hola ${clienteNombre}! 👋 Recibimos tu comprobante por la compra de: ${titulo}.`);
        const linkWa = `https://wa.me/${clienteWhatsapp.replace(/\D/g, '')}?text=${msgWa}`;

        await transporter.sendMail({
          from: `"Tienda de Tiendas" <${process.env.EMAIL_USER}>`,
          to: 'tiendadtiendas@gmail.com', // 👈 PRUEBA
          subject: `🛍️ ¡Nueva Venta! - ${clienteNombre}`,
          html: `<div style="font-family: sans-serif; border: 2px solid #FFC9CB; padding: 20px; border-radius: 15px;">
                  <h2 style="color: #FF0000; text-align: center;">¡Tuviste una venta!</h2>
                  <p><strong>Cliente:</strong> ${clienteNombre}</p>
                  <p><strong>Total:</strong> $${precio}</p>
                  <p><a href="${linkDrive}">Ver Comprobante</a></p>
                  <br>
                  <a href="${linkWa}" style="background: #25D366; color: white; padding: 15px; border-radius: 50px; text-decoration: none; font-weight: bold; display: block; text-align: center;">CONTACTAR POR WHATSAPP</a>
                </div>`
        });
      } catch (e) { console.error("Error mail:", e); }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('🔥 CRASH API:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}