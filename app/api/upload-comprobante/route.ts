import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { CLIENTE_ACTUAL } from '@/lib/clientes';

/**
 * CONFIGURACIÓN DE IDs
 */
const FOLDER_ID = '1oMY4j8SkKqgDmE3LzGEp1K2SqcarXY_G';
const SHEET_ID  = process.env.GOOGLE_SHEET_ID!;

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

/**
 * 🔐 AUTENTICACIÓN POR SERVICE ACCOUNT
 */
async function getGoogleAuthClient() {
  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ],
  });
  return auth;
}

/**
 * 📝 ESCRITURA EN PLANILLA MAESTRA (A-J)
 */
async function agregarEnSheet(
  titulo: string, 
  precio: string, 
  linkDrive: string, 
  fecha: string, 
  vendedorEmail: string,
  clienteNombre: string,
  clienteWhatsapp: string,
  puntoEntrega: string
): Promise<void> {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const range = 'Pedidos!A:J'; 
  const values = [[
    vendedorEmail,        // A: Vendedor
    fecha,                // B: Fecha
    titulo,               // C: Productos
    precio,               // D: Precio
    'POR_VERIFICAR',      // E: Estado
    linkDrive,            // F: Comprobante
    'Venta Online Web',   // G: Notas
    clienteNombre,        // H: Nombre Cliente
    clienteWhatsapp,      // I: WhatsApp
    puntoEntrega          // J: Punto Entrega
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}

/**
 * 📂 SUBIDA A GOOGLE DRIVE
 */
async function subirADrive(archivo: File): Promise<string> {
  const auth = await getGoogleAuthClient();
  const drive = google.drive({ version: 'v3', auth });
  const buffer = Buffer.from(await archivo.arrayBuffer());
  
  const fileMetadata = {
    name: `COMPROBANTE-${Date.now()}-${archivo.name}`,
    parents: [FOLDER_ID],
  };

  const media = {
    mimeType: archivo.type,
    body: require('stream').Readable.from(buffer),
  };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink',
  });

  if (!res.data.id) throw new Error('Error al crear archivo en Drive');

  await drive.permissions.create({
    fileId: res.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return res.data.webViewLink || '';
}

/**
 * 🚀 POST HANDLER
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    
    const archivo = form.get('archivo') as File | null;
    const titulo = form.get('titulo') as string | null;
    const precio = form.get('precio') as string | null;
    const vendedorEmail = form.get('vendedorEmail') as string | null;
    const clienteNombre = form.get('clienteNombre') as string | null;
    const clienteWhatsapp = form.get('clienteWhatsapp') as string | null;
    const puntoEntrega = form.get('puntoEntrega') as string | null;

    if (!archivo || !titulo || !precio || !vendedorEmail || !clienteNombre || !clienteWhatsapp) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    // 1. Procesos de Google
    const linkDrive = await subirADrive(archivo);
    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

    await agregarEnSheet(
      titulo, precio, linkDrive, fecha, vendedorEmail,
      clienteNombre, clienteWhatsapp, puntoEntrega || 'No especificado'
    );

    // 2. Notificación Resend (Opcional si tenés la KEY)
    if (process.env.RESEND_API_KEY) {
      try {
        const msgWa = encodeURIComponent(`Hola ${clienteNombre}! Recibimos tu comprobante en ${CLIENTE_ACTUAL.nombre}. Pedido: ${titulo}. Entrega en: ${puntoEntrega}.`);
        const linkWa = `https://wa.me/${clienteWhatsapp.replace(/\D/g, '')}?text=${msgWa}`;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
          body: JSON.stringify({
            from: 'Tienda de Tiendas <onboarding@resend.dev>',
            to: [vendedorEmail],
            subject: `🛍️ Venta Glamour - ${clienteNombre}`,
            html: `
              <div style="font-family: sans-serif; border: 2px solid #FFC9CB; padding: 20px; border-radius: 15px; max-width: 500px;">
                <h2 style="color: #FF0000;">¡Nueva Venta!</h2>
                <p><strong>Cliente:</strong> ${clienteNombre}</p>
                <p><strong>WhatsApp:</strong> ${clienteWhatsapp}</p>
                <p><strong>Pedido:</strong> ${titulo}</p>
                <p><a href="${linkDrive}">Ver Comprobante</a></p>
                <br>
                <a href="${linkWa}" style="background: #25D366; color: white; padding: 15px; border-radius: 50px; text-decoration: none; font-weight: bold; display: block; text-align: center;">
                  CONTACTAR POR WHATSAPP
                </a>
              </div>`
          }),
        });
      } catch (e) { console.error("Error envío mail:", e); }
    }

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error('🔥 CRASH API:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}