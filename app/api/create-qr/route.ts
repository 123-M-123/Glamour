import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { titulo, precio } = body;

    if (!titulo || !precio) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    
    // 🆔 Generamos un ID de pedido único para esta sesión
    const orderId = `GLAM-${Date.now()}`;

    const preference = {
      items: [{
        title: titulo,
        quantity: 1,
        currency_id: 'ARS',
        unit_price: Number(precio),
      }],
      // 🔥 CLAVE: Referencia única para que no se cruce con otras tiendas
      external_reference: orderId,
      notification_url: `${BASE_URL}/api/webhook`,
      back_urls: {
        success: `${BASE_URL}/success`,
        failure: `${BASE_URL}/failure`,
        pending: `${BASE_URL}/pending`,
      },
      auto_return: 'approved',
    };

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: 'Error MP' }, { status: 500 });

    const qrBase64 = await QRCode.toDataURL(data.init_point);

    return NextResponse.json({
      qr: qrBase64,
      link: data.init_point,
      orderId: orderId // 👈 Devolvemos el ID al frontend
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}