import { STORE_CONFIG } from '@/lib/storeConfig'
import { ArrowLeft, ShieldCheck, Truck, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

export default function PoliticasPage() {
  const config = STORE_CONFIG["glamour-urquiza"].politicas

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8F8', padding: '120px 20px 60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ff0000', textDecoration: 'none', fontWeight: 800, marginBottom: '30px' }}>
          <ArrowLeft size={20} /> VOLVER A LA TIENDA
        </Link>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#1C1B19', marginBottom: '40px', textAlign: 'center' }}>
          POLÍTICAS DE <span style={{ color: '#ff0000' }}>TIENDA</span>
        </h1>

        <div style={{ display: 'grid', gap: '25px' }}>
          
          <section style={cardStyle}>
            <div style={iconCircle}><RefreshCcw color="#ff0000" /></div>
            <div>
              <h2 style={titleStyle}>{config.cambios.titulo}</h2>
              <p style={textStyle}>{config.cambios.cuerpo}</p>
            </div>
          </section>

          <section style={cardStyle}>
            <div style={iconCircle}><ShieldCheck color="#ff0000" /></div>
            <div>
              <h2 style={titleStyle}>{config.devoluciones.titulo}</h2>
              <p style={textStyle}>{config.devoluciones.cuerpo}</p>
            </div>
          </section>

          <section style={cardStyle}>
            <div style={iconCircle}><Truck color="#ff0000" /></div>
            <div>
              <h2 style={titleStyle}>{config.envios.titulo}</h2>
              <p style={textStyle}>{config.envios.cuerpo}</p>
            </div>
          </section>

        </div>

        <div style={{ marginTop: '50px', textAlign: 'center', color: '#9A9690', fontSize: '0.9rem' }}>
          <p>© 2024 Glamour - Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '24px',
  border: '2px solid #FFC9CB',
  display: 'flex',
  gap: '20px',
  alignItems: 'flex-start'
}

const iconCircle = {
  background: '#FFF0F1',
  padding: '12px',
  borderRadius: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
}

const titleStyle = {
  fontSize: '1.2rem',
  fontWeight: 900,
  color: '#1C1B19',
  marginBottom: '10px',
  textTransform: 'uppercase' as 'uppercase'
}

const textStyle = {
  fontSize: '1rem',
  color: '#444',
  lineHeight: '1.6',
  fontWeight: 500
}