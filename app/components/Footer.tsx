'use client'
import { ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <>
      {/* FOOTER CLIENTE (normal, baja con el contenido) */}
      <footer
        style={{
          background: '#Ff4248',
          textAlign: 'center',
          padding: '1rem',
          borderTop: '3px solid #ffffff',
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
      </footer>

      {/* ESPACIO RESERVADO para que no tape contenido */}
      <div style={{ height: '75px' }} />

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
    href="https://tienda-de-tiendas.vercel.app"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: '#ffffff', 
      textDecoration: 'underline',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px', // espacio fino entre texto e icono
    }}
  >
    <span>Diseño y Desarrollo web: Tienda de Tiendas</span>
    <ExternalLink size={13} strokeWidth={2} />
  </a>
</p>
        <p
          style={{
            fontSize: '0.85rem',
            lineHeight: '1.4',
            margin: 0,
          }}
        >
          <a
            href="https://tienda-de-tiendas.vercel.app"
            style={{
              color: '#ffffff', opacity: 0.75,
              textDecoration: 'none',
            }}
          >
            Promo Micro Emp 50% off hasta Dic 2026
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
            href="mailto:tiendadtiendas@gmail.com"
            style={{
              color: '#ffffff', opacity: 0.75,
              textDecoration: 'none',
            }}
          >
            Tené tu Web en 2 días ✉️ Contacto
          </a>
        </p>
      </footer>
    </>
  )
}