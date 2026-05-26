'use client'

import { STORE_CONFIG } from '@/lib/storeConfig'
import { 
  ArrowLeft, ShieldCheck, Truck, RefreshCcw, 
  HelpCircle, Scale, MessageCircle, AlertTriangle 
} from 'lucide-react'
import Link from 'next/link'

const K = { bg: '#FFF8F8', border: '#FFC9CB', accent: '#FF0000', text: '#1C1B19', muted: '#9A9690' };

export default function PoliticasPage() {
  const config = STORE_CONFIG["glamour-urquiza"]
  const p = config.politicas

  return (
    <div style={{ minHeight: '100vh', background: K.bg, padding: '120px 20px 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <Link href="/" style={backLink}>
          <ArrowLeft size={18} /> VOLVER A LA TIENDA
        </Link>

        <h1 style={mainTitle}>
          CENTRO DE <span style={{ color: K.accent }}>AYUDA</span>
        </h1>
        <p style={subtitle}>Todo lo que necesitás saber sobre tu compra en Glamour.</p>

        <div style={{ display: 'grid', gap: '20px' }}>
          
          {/* SECCIÓN 1: OPERACIONES (Cambios y Envíos) */}
          <div style={gridTwo}>
            <section style={smallCard}>
              <div style={iconBox}><RefreshCcw size={20} color={K.accent} /></div>
              <h2 style={cardTitle}>{p.cambios.titulo}</h2>
              <p style={cardText}>{p.cambios.cuerpo}</p>
            </section>

            <section style={smallCard}>
              <div style={iconBox}><Truck size={20} color={K.accent} /></div>
              <h2 style={cardTitle}>{p.envios.titulo}</h2>
              <p style={cardText}>{p.envios.cuerpo}</p>
            </section>
          </div>

          {/* SECCIÓN 2: BOTÓN DE ARREPENTIMIENTO (Destacado por Ley) */}
          <section style={highlightCard}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
              <AlertTriangle color="white" size={24} />
              <h2 style={{ ...cardTitle, color: 'white', margin: 0 }}>{p.arrepentimiento.titulo}</h2>
            </div>
            <p style={{ ...cardText, color: 'rgba(255,255,255,0.9)' }}>{p.arrepentimiento.cuerpo}</p>
            <a 
              href={`https://wa.me/${config.whatsapp}?text=Hola Glamour, quiero usar el Botón de Arrepentimiento por un pedido.`} 
              style={actionButton}
            >
              SOLICITAR CANCELACIÓN AQUÍ
            </a>
          </section>

          {/* SECCIÓN 3: FAQ (Preguntas Frecuentes) */}
          <section style={cardStyle}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <HelpCircle color={K.accent} size={22} />
              <h2 style={cardTitle}>PREGUNTAS FRECUENTES</h2>
            </div>
            <div style={{ display: 'grid', gap: '20px' }}>
              {config.faq.map((item, i) => (
                <div key={i} style={faqItem}>
                  <p style={question}>¿ {item.q}</p>
                  <p style={answer}>{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 4: LEGAL (Términos y AFIP) */}
          <section style={{ ...cardStyle, background: 'transparent', border: `1px dashed ${K.border}` }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
              <Scale color={K.muted} size={20} />
              <h2 style={{ ...cardTitle, color: K.muted }}>LEGALES Y DATA FISCAL</h2>
            </div>
            <p style={{ ...cardText, fontSize: '0.85rem' }}>{p.terminos.cuerpo}</p>
            <div style={dataFiscalContainer}>
               <span style={f960}>{config.dataFiscalText}</span>
            </div>
          </section>

        </div>

        {/* FOOTER DE PÁGINA */}
        <div style={pageFooter}>
          <p>© 2026 {config.name} Glamour</p>
          <div style={socials}>
             <a href={config.instagram} target="_blank" style={socialLink}>INSTAGRAM</a>
             <a href={config.tiktok} target="_blank" style={socialLink}>TIKTOK</a>
          </div>
        </div>

      </div>
    </div>
  )
}

// ESTILOS (Fidelidad Estética Glamour)
const backLink = { display: 'inline-flex', alignItems: 'center', gap: '8px', color: K.accent, textDecoration: 'none', fontWeight: 800, marginBottom: '30px', fontSize: '0.9rem' };
const mainTitle = { fontSize: '2.4rem', fontWeight: 950, color: K.text, marginBottom: '10px', textAlign: 'center' as 'center' };
const subtitle = { textAlign: 'center' as 'center', color: K.muted, marginBottom: '40px', fontWeight: 600, fontSize: '1rem' };
const gridTwo = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' };

const cardStyle = { background: 'white', padding: '30px', borderRadius: '24px', border: `2px solid ${K.border}` };
const smallCard = { ...cardStyle, padding: '25px' };

const highlightCard = {
  background: K.accent,
  padding: '35px',
  borderRadius: '24px',
  boxShadow: '0 15px 30px rgba(255,0,0,0.2)'
};

const actionButton = {
  display: 'inline-block',
  background: 'white',
  color: K.accent,
  padding: '12px 25px',
  borderRadius: '50px',
  textDecoration: 'none',
  fontWeight: 900,
  fontSize: '0.85rem',
  marginTop: '15px'
};

const iconBox = { background: '#FFF0F1', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' };
const cardTitle = { fontSize: '1.1rem', fontWeight: 900, color: K.text, marginBottom: '10px', textTransform: 'uppercase' as 'uppercase' };
const cardText = { fontSize: '0.95rem', color: '#444', lineHeight: '1.6', fontWeight: 500, margin: 0 };

const faqItem = { borderLeft: `3px solid ${K.border}`, paddingLeft: '15px' };
const question = { fontWeight: 800, color: K.text, marginBottom: '5px', fontSize: '0.95rem' };
const answer = { color: '#666', fontSize: '0.9rem', lineHeight: '1.5' };

const dataFiscalContainer = { marginTop: '20px', paddingTop: '15px', borderTop: `1px solid #eee` };
const f960 = { fontSize: '0.75rem', fontWeight: 800, color: K.muted, letterSpacing: '1px' };

const pageFooter = { marginTop: '60px', textAlign: 'center' as 'center', borderTop: '1px solid #eee', paddingTop: '30px' };
const socials = { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' };
const socialLink = { fontSize: '0.75rem', fontWeight: 800, color: K.muted, textDecoration: 'none' };