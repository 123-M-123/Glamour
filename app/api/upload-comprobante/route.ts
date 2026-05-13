import { NextRequest, NextResponse } from 'next/server'

const FOLDER_ID      = '1oMY4j8SkKqgDmE3LzGEp1K2SqcarXY_G' 
const SHEET_ID       = process.env.GOOGLE_SHEET_ID!
const CLIENT_ID      = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET  = process.env.GOOGLE_CLIENT_SECRET!
const REFRESH_TOKEN  = process.env.GOOGLE_REFRESH_TOKEN!

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
  if (!data.access_token) {
    console.error('❌ Error de Google Auth:', data)
    throw new Error('No se pudo obtener access token')
  }
  return data.access_token
}

async function agregarEnSheet(token: string, titulo: string, precio: string, linkDrive: string, fecha: string): Promise<void> {
  const range = 'Pedidos!A:G' // 👈 Aumentamos a G para cubrir todas las columnas
  
  // 🔥 MAPEO CORRECTO SEGÚN TU CAPTURA:
  // A: Vendedor | B: Fecha | C: Productos | D: Precio | E: Estado | F: Comprobante | G: Notas
  const values = [[
    'gla_142@hotmail.com', // Col A (Vendedor fijo para esta tienda)
    fecha,                 // Col B
    titulo,                // Col C
    precio,                // Col D
    'POR_VERIFICAR',       // Col E
    linkDrive,             // Col F
    'Pago vía Web Glamour' // Col G
  ]]

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    }
  )
  if (!res.ok) {
    const errorData = await res.json()
    console.error('❌ Error al escribir en Sheet:', errorData)
    throw new Error('Error al guardar en la planilla')
  }
}

// ... (la función subirADrive se mantiene igual)

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const archivo = form.get('archivo') as File | null
    const titulo = form.get('titulo') as string | null
    const precio = form.get('precio') as string | null

    if (!archivo || !titulo || !precio) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const token = await getAccessToken()
    
    // Subir a Drive
    const metadata = JSON.stringify({ name: `COMPROBANTE-${Date.now()}`, parents: [FOLDER_ID] })
    const driveForm = new FormData()
    driveForm.append('metadata', new Blob([metadata], { type: 'application/json' }))
    driveForm.append('file', archivo)

    const driveRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: driveForm
    })
    const driveData = await driveRes.json()
    
    if (!driveData.id) {
      console.error('❌ Error en Drive:', driveData)
      return NextResponse.json({ error: 'Error subiendo a Drive' }, { status: 500 })
    }

    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
    await agregarEnSheet(token, titulo, precio, driveData.webViewLink, fecha)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('🔥 CRASH EN API:', err.message) // 👈 AHORA SÍ LO VERÁS EN VS CODE
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}