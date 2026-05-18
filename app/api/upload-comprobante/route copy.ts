import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * CONFIGURACIÓN DE IDs
 */
const FOLDER_ID = '1oMY4j8SkKqgDmE3LzGEp1K2SqcarXY_G';
const SHEET_ID  = process.env.GOOGLE_SHEET_ID!;

// Variables según tu .env
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

/**
 * 🔐 AUTENTICACIÓN POR SERVICE ACCOUNT (MODO OBJETO PARA EVITAR ERROR TS)
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
 * 📝 ESCRITURA EN PLANILLA MAESTRA
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
    vendedorEmail,        // A
    fecha,                // B
    titulo,               // C
    precio,               // D
    'POR_VERIFICAR',      // E
    linkDrive,            // F
    'Venta Online Web',   // G
    clienteNombre,        // H
    clienteWhatsapp,      // I
    puntoEntrega          // J
  ]];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
  } catch (error: any) {
    console.error('❌ Error en Google Sheets:', error.response?.data || error.message);
    throw new Error('No se pudo guardar en la planilla maestra');
  }
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

  try {
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
  } catch (error: any) {
    console.error('❌ Error en Google Drive:', error.response?.data || error.message);
    throw new Error('Error al subir comprobante a Drive');
  }
}

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

    const linkDrive = await subirADrive(archivo);

    const fecha = new Date().toLocaleString('es-AR', { 
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    await agregarEnSheet(
      titulo, 
      precio, 
      linkDrive, 
      fecha, 
      vendedorEmail,
      clienteNombre,
      clienteWhatsapp,
      puntoEntrega || 'No especificado'
    );

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error('🔥 CRASH EN API UPLOAD:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}