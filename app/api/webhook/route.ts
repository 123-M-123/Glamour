import { NextRequest, NextResponse } from 'next/server'

const SHEET_ID      = process.env.GOOGLE_SHEET_ID || ''
const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || ''
const ACCESS_TOKEN  = process.env.MP_ACCESS_TOKEN || ''

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('No se pudo obtener access token')
  return data.access_token
}

async function agregarEnSheet(token: string, fila: any[]) {
  const range = 'webhoock MP!A:G' 
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`
  
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [fila] }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Solo procesamos avisos de pago
    if (body.type !== 'payment') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ status: 'no payment id' }, { status: 200 })
    }

    // Consultar detalle a Mercado Pago
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    )
    
    if (!mpRes.ok) {
        console.error("Error al consultar MP:", await mpRes.text())
        return NextResponse.json({ status: 'error mp' }, { status: 200 })
    }

    const pago = await mpRes.json()

    // Solo registrar si está aprobado
    if (pago.status !== 'approved') {
      return NextResponse.json({ status: 'not approved' }, { status: 200 })
    }

    const fecha = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires'
    })

    // Capturamos el mail del vendedor (external_reference)
    const emailVendedor = pago.external_reference || 'elianamarti90@gmail.com'

    // Armamos la fila respetando tus nuevas columnas
    const fila = [
      emailVendedor,                       // Col A: Vendedor
      fecha,                               // Col B: Fecha
      pago.description || 'Compra Online', // Col C: Producto
      pago.transaction_amount || 0,        // Col D: Precio
      'PAGADO',                            // Col E: Estado
      pago.payer?.email || '',             // Col F: Comprador
    ]

    const token = await getAccessToken()
    await agregarEnSheet(token, fila)

    console.log('✅ Venta registrada en Excel para El Campito:', emailVendedor)
    return NextResponse.json({ status: 'ok' }, { status: 200 })

  } catch (error) {
    console.error('Error en webhook El Campito:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}