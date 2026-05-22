import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

/**
 * ⚙️ CONFIGURACIÓN DE IDENTIFICADORES
 */
const FOLDER_ID = '1oMY4j8SkKqgDmE3LzGEp1K2SqcarXY_G';
const SHEET_ID  = process.env.GOOGLE_SHEET_ID!;

/**
 * 🔐 AUTENTICACIÓN OAUTH2 (Para usar tu cuota de 15GB)
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

/**
 * 📂 FUNCIÓN: SUBIR A DRIVE (Recuperada y Mejorada)
 */
async function subirADrive(archivo: File): Promise<string> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
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

    if (!res.data.id) throw new Error('No se generó ID en Drive');

    // Permisos para que cualquiera con el link (vendedor) pueda verlo
    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return res.data.webViewLink || '';
  } catch (error: any) {
    console.error('❌ Error subiendo a Drive:', error.message);
    throw new Error('Fallo en la carga a Drive');
  }
}

/**
 * 📝 FUNCIÓN: ANOTAR EN EXCEL (Columnas A-J)
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
  try {
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const range = 'Pedidos!A:J'; 

    const values = [[
      vendedorEmail,        // A: Vendedor
      fecha,                // B: Fecha
      titulo,               // C: Productos
      precio,               // D: Precio
      'POR_VERIFICAR',      // E: Estado
      linkDrive,            // F: [RECUPERADO] Link de Drive real
      'Pago vía Web Glamour',// G: Notas
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
  } catch (error: any) {
    console.error('❌ Error escribiendo en Sheets:', error.message);
  }
}

/**
 * 🚀 PROCESO PRINCIPAL
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    
    const archivo = form.get('archivo') as File | null;
    const titulo = (form.get('titulo') as string) || "Pedido Glamour";
    const precio = (form.get('precio') as string) || "0";
    const vendedorEmail = (form.get('vendedorEmail') as string) || "tiendadtiendas@gmail.com";
    const clienteNombre = (form.get('clienteNombre') as string) || "";
    const clienteWhatsapp = (form.get('clienteWhatsapp') as string) || "";
    const puntoEntrega = (form.get('puntoEntrega') as string) || "No especificado";

    if (!archivo || !clienteNombre || !clienteWhatsapp) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

    // 1. SUBIR A DRIVE (Ahora sí con cuota real)
    const linkDrive = await subirADrive(archivo);

    // 2. GUARDAR EN EXCEL (Con el link de Drive en la Columna F)
    await agregarEnSheet(titulo, precio, linkDrive, fecha, vendedorEmail, clienteNombre, clienteWhatsapp, puntoEntrega);

    // 3. ENVIAR POR MAIL (Mantenemos el respaldo con adjunto)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const buffer = Buffer.from(await archivo.arrayBuffer());
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const msgWa = encodeURIComponent(`Hola ${clienteNombre}! 👋 Recibimos tu comprobante por: ${titulo}. Estamos preparando tu pedido.`);
        const linkWa = `https://wa.me/${clienteWhatsapp.replace(/\D/g, '')}?text=${msgWa}`;

        await transporter.sendMail({
          from: `"Tienda de Tiendas" <${process.env.EMAIL_USER}>`,
          to: 'tiendadtiendas@gmail.com', // Enviamos a tu mail de control
          subject: `🛍️ NUEVA VENTA (Drive + Mail) - ${clienteNombre}`,
          html: `
            <div style="font-family: sans-serif; border: 2px solid #FFC9CB; padding: 20px; border-radius: 15px; max-width: 500px;">
              <h2 style="color: #FF0000; text-align: center;">¡Tuviste una venta!</h2>
              <p><strong>Cliente:</strong> ${clienteNombre}</p>
              <p><strong>Total:</strong> $${precio}</p>
              <p><strong>Drive:</strong> <a href="${linkDrive}">Ver archivo en nube</a></p>
              <br>
              <a href="${linkWa}" style="background: #25D366; color: white; padding: 15px; border-radius: 50px; text-decoration: none; font-weight: bold; display: block; text-align: center;">
                CONTACTAR POR WHATSAPP
              </a>
            </div>`,
          attachments: [{ filename: archivo.name, content: buffer }]
        });
      } catch (e) {
        console.error("❌ Error enviando mail:", e);
      }
    }

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error('🔥 CRASH EN API UPLOAD:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}