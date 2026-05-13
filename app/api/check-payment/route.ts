import { NextRequest, NextResponse } from 'next/server'

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!

export async function GET(req: NextRequest) {
  try {
    // 🔎 Obtenemos el ID de la URL
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) return NextResponse.json({ paid: false, error: 'No ID' });

    // 🔥 BUSQUEDA FILTRADA por external_reference (no el último global)
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${orderId}`,
      {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }
    )

    const data = await res.json();
    
    // Solo si el pago con ese ID existe y está aprobado
    const payment = data.results?.find((p: any) => p.external_reference === orderId);

    if (payment?.status === 'approved') {
      return NextResponse.json({ paid: true });
    }

    return NextResponse.json({ paid: false });
  } catch (error) {
    return NextResponse.json({ paid: false });
  }
}