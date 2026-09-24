'use client'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <>
      {/* FOOTER CLIENTE (normal, pero empujado abajo con marginTop: auto) */}
      <footer
        style={{
          marginTop: 'auto', // 👈 CLAVE: Empuja el footer al fondo si hay poco contenido
          background: '#Ff4248',
          textAlign: 'center',
          padding: '1rem',
          borderTop: '3px solid #ffffff',
          width: '100%',
        }}
      >
        <p
          style={{
            fontSize: '0.85rem',
            color: '#ffffff', 
            fontWeight: 700,
            lineHeight: '1.4',
          }}
        >
         Glamour
        </p>

        <p
          style={{
            fontSize: '0.8rem',
            color: '#ffffff', opacity: 0.75,
            lineHeight: '1.4',
          }}
        >
         Indumentaria &nbsp;|&nbsp; Accesorios
        </p>

        <p
          style={{
            fontSize: '0.8rem',
            color: '#ffffff', opacity: 0.75,
            lineHeight: '1.4',
          }}
        >
          © {new Date().getFullYear()} Todos los derechos reservados
        </p>

        {/* RENGLÓN 4: PIRÁMIDE (Agregado FAQ) */}
        <p
          style={{
            fontSize: '0.75rem',
            color: '#ffffff', opacity: 0.85,
            lineHeight: '1.6',
            marginTop: '5px'
          }}
        >
          <Link href="/politicas#arrepentimiento" style={{ color: 'inherit', textDecoration: 'none' }}>Arrepentimiento</Link> &nbsp;|&nbsp; 
          <Link href="/politicas#faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</Link> &nbsp;|&nbsp; 
          <Link href="/politicas#contacto" style={{ color: 'inherit', textDecoration: 'none' }}>Contacto</Link>
        </p>

        {/* RENGLÓN 5: PIRÁMIDE (Base ancha con palabras clave de Google) */}
        <p
          style={{
            fontSize: '0.75rem',
            color: '#ffffff', opacity: 0.85,
            lineHeight: '1.6',
          }}
        >
          <Link href="/politicas#envio" style={{ color: 'inherit', textDecoration: 'none' }}>Envíos</Link> &nbsp;|&nbsp; 
          <Link href="/politicas#devolucion" style={{ color: 'inherit', textDecoration: 'none' }}>Devoluciones</Link> &nbsp;|&nbsp; 
          <Link href="/politicas#terminos" style={{ color: 'inherit', textDecoration: 'none' }}>Privacidad</Link> &nbsp;|&nbsp; 
          <Link href="/politicas#terminos" style={{ color: 'inherit', textDecoration: 'none' }}>Términos y Condiciones</Link>
        </p>
      </footer>

      {/* ESPACIO RESERVADO para que el footer fijo de abajo no tape los links */}
      <div style={{ height: '60px' }} />

      {/* FOOTER TU MARCA (fijo abajo SIEMPRE) */}
      <footer
        style={{
          background: '#Ff4248',
          textAlign: 'center',
          padding: '0.9rem 1rem',
          borderTop: 'none',
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          zIndex: 300,
        }}
      >
        <p
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            lineHeight: '1.4',
            margin: 0,
          }}
        >
          <a
            href="https://tdt.ar"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#ffffff', 
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Diseño y Desarrollo web: Tienda de Tiendas</span>
            <ExternalLink size={13} strokeWidth={2} />
          </a>
        </p>
        

        <p
          style={{
            fontSize: '0.8rem',
            lineHeight: '1.4',
            margin: 0,
          }}
        >
          <a
            href="mailto:info@tdt.ar"
            style={{
              color: '#ffffff', opacity: 0.75,
              textDecoration: 'none',
            }}
          >
            Tené tu Tienda Web ✉️ Contacto
          </a>
        </p>
      </footer>
    </>
  )
}