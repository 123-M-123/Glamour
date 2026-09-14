import { NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

/**
 * CREACIÓN DE PREFERENCIA DE CHECKOUT - GLAMOUR URQUIZA
 * =========================================================================
 * Arquitectura Híbrida:
 * 1. Consulta dinámica a tdt.ar para obtener las credenciales activas de Gladys (gaId: 537730087).
 * 2. Fallback de seguridad hacia process.env.MP_ACCESS_TOKEN (Cuenta de Marcos).
 * 3. Preserva intactas las validaciones de precio (< 150) y metadata de entrega.
 * 4. Actualiza la URL de notificación a tdt.ar oficial.
 */

// Fallback de seguridad: Tu cuenta personal de Marcos en Vercel
const FALLBACK_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

// gaId oficial de Glamour registrado en la Planilla Maestra de TdT
const GLAMOUR_GAID = process.env.GA_ID || "537730087";

// Secreto interno de comunicación con la Nave Nodriza
const INTERNAL_SECRET = process.env.TIENDAS_INTERNAL_SECRET || "tdt-secure-bridge-2026";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const vendedorEmail = body.vendedorEmail || "gla_142@hotmail.com"; 

    // 1. Limpieza y validación de precio mínimo
    const unitPrice = Math.round(Number(body.price));
    if (unitPrice < 150) {
      return NextResponse.json({ error: "Monto muy bajo" }, { status: 400 });
    }

    // 2. 🟢 RESOLUCIÓN DINÁMICA DEL TOKEN (Consulta a tdt.ar)
    let tokenActivo = FALLBACK_ACCESS_TOKEN;
    let origenToken = "FALLBACK_MARCOS";

    try {
      const resToken = await fetch(`https://tdt.ar/api/tiendas/mp-token?gaId=${GLAMOUR_GAID}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-store",
          "x-tiendas-secret": INTERNAL_SECRET,
        },
        signal: AbortSignal.timeout(3000),
      });

      if (resToken.ok) {
        const dataToken = await resToken.json();
        if (dataToken.success && dataToken.access_token) {
          tokenActivo = dataToken.access_token;
          origenToken = "OFICIAL_GLAMOUR";
        }
      }
    } catch (errToken) {
      console.warn(
        `[CHECKOUT GLAMOUR] No se pudo consultar tdt.ar. Usando token de fallback:`,
        errToken
      );
    }

    // Validación de seguridad
    if (!tokenActivo) {
      console.error("[CHECKOUT GLAMOUR] Error crítico: No hay ningún token disponible.");
      return NextResponse.json(
        { error: "Medio de pago no configurado. Coordinar por WhatsApp." },
        { status: 500 }
      );
    }

    console.log(`[CHECKOUT GLAMOUR] Procesando preferencia con credencial: [${origenToken}]`);

    // 3. 🟢 INSTANCIACIÓN DINÁMICA DEL SDK CON EL TOKEN RESUELTO
    const client = new MercadoPagoConfig({
      accessToken: tokenActivo,
    });

    const preference = new Preference(client);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://glamour-urquiza.vercel.app";

    const result = await preference.create({
      body: {
        items: [{
          id: 'item-glamour',
          title: (body.title || 'Compra Glamour').substring(0, 250),
          unit_price: unitPrice,
          quantity: 1,
          currency_id: 'ARS',
        }],
        external_reference: vendedorEmail,

        // 🟢 NOTIFICACIÓN CENTRAL ACTUALIZADA A TDT.AR
        notification_url: "https://tdt.ar/api/webhook",

        back_urls: {
          success: `${baseUrl}/success`,
          failure: `${baseUrl}/failure`,
          pending: `${baseUrl}/pending`,
        },
        auto_return: 'approved',

        metadata: {
          vendedor_email: vendedorEmail,
          cliente_nombre: body.clienteNombre || "S/D",
          cliente_whatsapp: body.clienteWhatsapp || "S/D",
          punto_entrega: body.puntoEntrega || "S/D"
        }
      },
    });

    return NextResponse.json({ id: result.id });
  } catch (error: any) {
    console.error("🔥 ERROR MP PREFERENCE GLAMOUR:", error.message);
    return NextResponse.json({ error: "Error en preferencia" }, { status: 500 });
  }
}