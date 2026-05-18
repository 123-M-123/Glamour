import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { CLIENTE_ACTUAL } from '@/lib/clientes';
import nodemailer from 'nodemailer';
import { Readable } from 'stream';

/**
 * 🛡️ CONFIGURACIÓN ESTRICTA DE IDs
 */
const FOLDER_ID = '1oMY4j8SkKqgDmE3LzGEp1K2SqcarXY_G'; // ID de tu captura
const SHEET_ID  = process.env.GOOGLE_SHEET_ID!;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function getGoogleAuthClient() {
  return new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ],
  });
}

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
    vendedorEmail,        
    fecha,                
    titulo,               
    precio,               
    'POR_VERIFICAR',      
    linkDrive,            
    'Venta Online Web',   
    clienteNombre,        
    clienteWhatsapp,      
    puntoEntrega          
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}

async function subirADrive(archivo: File): Promise<string> {
  const auth = await getGoogleAuthClient();
  const drive = google.drive({ version: 'v3', auth });
  
  // Convertimos el archivo a un buffer y luego a un stream legible
  const bytes = await archivo.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  
  try {
    // 🛡️ SINTAXIS DE EMERGENCIA PARA CUOTA 0 (Personal Drive)
    const res = await drive.files.create({
      requestBody: {
        name: `COMPROBANTE-${Date.now()}-${archivo.name}`,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: archivo.type,
        body: stream,
      },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    } as any);

    const fileId = res.data.id;
    if (!fileId) throw new Error('No se generó el ID del archivo');

    // Otorgar permisos de lectura para que el vendedor vea el archivo
    await drive.permissions.create({
      fileId: fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    } as any);

    return res.data.webViewLink || '';
  } catch (error: any) {
    console.error('❌ Error crítico de Drive Quota:', error.message);
    throw new Error(`Drive Error: ${error.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    
    // Casting de tipos para evitar errores de compilación TS
    const archivo = form.get('archivo') as File | null;
    const titulo = (form.get('titulo') as string) || "Pedido";
    const precio = (form.get('precio') as string) || "0";
    const vendedorEmail = (form.get('vendedorEmail') as string) || "tiendadtiendas@gmail.com";
    const clienteNombre = (form.get('clienteNombre') as string) || "";
    const clienteWhatsapp = (form.get('clienteWhatsapp') as string) || "";
    const puntoEntrega = (form.get('puntoEntrega') as string) || "No especificado";

    if (!archivo || !clienteNombre || !clienteWhatsapp) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const linkDrive = await subirADrive(archivo);
    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

    await agregarEnSheet(
      titulo, precio, linkDrive, fecha, vendedorEmail,
      clienteNombre, clienteWhatsapp, puntoEntrega
    );

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const msgWa = encodeURIComponent(`Hola ${clienteNombre}! 👋 Recibimos tu comprobante por la compra.`);
        const linkWa = `https://wa.me/${clienteWhatsapp.replace(/\D/g, '')}?text=${msgWa}`;

        await transporter.sendMail({
          from: `"Tienda de Tiendas" <${process.env.EMAIL_USER}>`,
          to: 'tiendadtiendas@gmail.com',
          subject: `🛍️ ¡Nueva Venta! - ${clienteNombre}`,
          html: `<div style="font-family: sans-serif; border: 2px solid #FFC9CB; padding: 20px; border-radius: 15px;">
                  <h2 style="color: #FF0000;">¡Tuviste una venta!</h2>
                  <p><strong>Cliente:</strong> ${clienteNombre}</p>
                  <p><a href="${linkDrive}">Ver Comprobante</a></p>
                  <br>
                  <a href="${linkWa}" style="background: #25D366; color: white; padding: 15px; border-radius: 50px; text-decoration: none; font-weight: bold; display: block; text-align: center;">CONTACTAR POR WHATSAPP</a>
                </div>`
        });
      } catch (e) { console.error("Error email:", e); }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('🔥 CRASH API:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}