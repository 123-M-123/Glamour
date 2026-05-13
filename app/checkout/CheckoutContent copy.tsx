'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useCartStore } from '../store/useCartStore';

declare global {
  interface Window { MercadoPago: any }
}

const ALIAS = 'Eliana.elcampito';
const CVU   = '';

// ── Paleta neutral elegante ───────────────────────────────────────────
const K = {
  bg:        '#F7F6F3',
  surface:   '#FFFFFF',
  border:    '#E2E0DC',
  muted:     '#9A9690',
  text:      '#1C1B19',
  sub:       '#6B6862',
  accent:    '#2D6BE4',
  accentBg:  '#EEF3FC',
  green:     '#1A7F5A',
  greenBg:   '#EDF7F3',
  mp:        '#009EE3',
  mpBg:      '#EDF7FD',
  warn:      '#7A5C00',
  warnBg:    '#FFF8E1',
} as const;

type Metodo = 'alias' | 'tarjeta' | 'mp' | 'otros' | 'qr';

const OPCIONES = [
  { id: 'alias', label: 'Transferencia', sub: 'Obtené descuento pagando directo', icon: '/ico-ui/alias.png', bg: '#d1ffed' },
  { id: 'qr', label: 'QR Bancario', sub: 'Pagá con MODO, Ualá o bancos', icon: '/ico-ui/qr.png', bg: '#F0F8F2' },
  { id: 'tarjeta', label: 'Tarjeta / Efectivo', sub: 'Crédito, débito o Rapipago', icon: '/ico-ui/tarjeta.png', bg: '#FFF8E8' },
  { id: 'mp', label: 'Cuenta MP', sub: 'Saldo o tarjetas guardadas', icon: '/ico-ui/mp.png', bg: '#EEF8FF' },
  { id: 'otros', label: 'Otros métodos', sub: 'Próximamente', icon: '/ico-ui/otros.png', bg: '#F6F6F6' },
] as const;

// ── Botones métodos ──────────────────────────────────────────────────
function OpcionBtn({
  op,
  activo,
  onClick,
}: {
  op: typeof OPCIONES[number];
  activo: boolean;
  onClick: () => void;
}) {
  const activeBg =
    op.id === 'alias'
      ? '#bcfae2'
      : op.id === 'qr'
      ? '#ddfde5'
      : op.id === 'tarjeta'
      ? '#fff8de'
      : op.id === 'mp'
      ? '#dff3ff'
      : '#f3f3f3';

  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 140px',
        padding: '0.9rem',
        borderRadius: 14,
        cursor: 'pointer',
        textAlign: 'left',
        border: `2px solid ${activo ? '#2D6BE4' : '#E2E0DC'}`,
        background: activeBg,
        transition: '0.2s',
        opacity: 1,
      }}
    >
      <img
        src={op.icon}
        alt={op.label}
        style={{
          width: 28,
          height: 28,
          objectFit: 'contain',
          marginBottom: '0.45rem',
          display: 'block',
        }}
      />

      <div
        style={{
          fontSize: '0.84rem',
          fontWeight: 800,
          color: '#1C1B19',
          lineHeight: 1.2,
        }}
      >
        {op.label}
      </div>

      <div
        style={{
          fontSize: '0.68rem',
          color: '#777',
          marginTop: '0.25rem',
          lineHeight: 1.25,
        }}
      >
        {op.sub}
      </div>
    </button>
  );
}

// ── Checkout principal ────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const brickContainer = useRef<HTMLDivElement>(null);
const [pagado, setPagado] = useState(false)
  const [metodo,      setMetodo]      = useState<Metodo>('alias');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(true);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [enviando,    setEnviando]    = useState(false);
  const [enviado,     setEnviado]     = useState(false);
const [qrUrl, setQrUrl] = useState<string | null>(null)
  

const cart = useCartStore((state) => state.items);

const total = cart.reduce(
  (acc: number, item: any) =>
    acc + item.producto.precioTransfer * item.cantidad + item.envio,
  0
);
const precioFinal =
  metodo === 'alias'
    ? total
    : metodo === 'qr'
    ? total * 1.053
    : total * 1.111;
    
const precioLista = Math.round(total * 1.111);
const ahorroAlias = precioLista - total;
const ahorroQr = precioLista - Math.round(total * 1.053);





const titulo = 'Compra en El Campito';
const precio = total;
const descripcion = `Compra de ${cart.length} productos`;
const panelColor =
  metodo === 'alias'
    ? '#bcfae2'
    : metodo === 'qr'
    ? '#ddfde5'
    : metodo === 'tarjeta'
    ? '#fff8de'
    : metodo === 'mp'
    ? '#d7edff'
    : K.surface;

const borderColor =
  metodo === 'alias'
    ? '#CFE8DA'
    : metodo === 'qr'
    ? '#D8EEDC'
    : metodo === 'tarjeta'
    ? '#F2E2A8'
    : metodo === 'mp'
    ? '#D6EAF8'
    : K.border;
  // ── Brick Tarjeta/Efectivo (sin wallet MP) ────────────────────────
 useEffect(() => {
  if (metodo !== 'qr') return

  const generarQR = async () => {
    try {
      const res = await fetch('/api/create-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, precio }),
      })

      const data = await res.json()

      if (data.qr) {
        setQrUrl(data.qr)
      }
    } catch (e) {
      console.error('Error QR', e)
    }
  }

  generarQR()
}, [metodo])

useEffect(() => {
  if (!qrUrl) return

  const interval = setInterval(async () => {
    try {
      const res = await fetch('/api/check-payment')
      const data = await res.json()

      if (data.paid) {
        setPagado(true)
        clearInterval(interval)
      }
    } catch (e) {
      console.error('Polling error', e)
    }
  }, 5000)

  return () => clearInterval(interval)
}, [qrUrl])

useEffect(() => {
  if (!qrUrl) return

  const interval = setInterval(async () => {
    try {
      const res = await fetch('/api/check-payment')
      const data = await res.json()

      if (data.paid) {
        setPagado(true)
        clearInterval(interval)
      }
    } catch (e) {
      console.error('Polling error', e)
    }
  }, 5000)

  return () => clearInterval(interval)
}, [qrUrl])

  useEffect(() => {
    if (metodo !== 'tarjeta') return;
    const container = document.getElementById('brick-tarjeta');
    if (!container || container.children.length > 0) return;

    const init = async () => {
      try {
        const res  = await fetch('/api/create-preference', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titulo, price: precio, quantity: 1, description: descripcion }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        if (!window.MercadoPago) {
          await new Promise<void>(resolve => {
            const s = document.createElement('script');
            s.src = 'https://sdk.mercadopago.com/js/v2';
            s.async = true; s.onload = () => resolve();
            document.body.appendChild(s);
          });
        }

        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'es-AR' });
        await mp.bricks().create('payment', 'brick-tarjeta', {
          initialization: { amount: precio, preferenceId: data.id },
          customization: {
            paymentMethods: {
              creditCard: 'all',
              debitCard:  'all',
              ticket:     'all',   // Pago Fácil y Rapipago van acá
            },
          },
          callbacks: {
            onReady: () => setLoading(false),
            onSubmit: async ({ formData }: any) => {
              const r = await fetch('/api/process-payment', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
              });
              const p = await r.json();
              if      (p.status === 'approved') window.location.href = '/success';
              else if (p.status === 'pending' || p.status === 'in_process') window.location.href = '/pending';
              else    window.location.href = '/failure';
            },
            onError: () => setError('Error en el formulario de pago.'),
          },
        });
      } catch (e: any) {
        setError(e.message); setLoading(false);
      }
    };
    init();
  }, [metodo]);

  // ── Brick Cuenta MP (wallet + saldo, sin tarjetas offline) ────────
  useEffect(() => {
    if (metodo !== 'mp') return;
    const container = document.getElementById('brick-mp');
    if (!container || container.children.length > 0) return;

    const init = async () => {
      try {
        const res  = await fetch('/api/create-preference', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titulo, price: precio, quantity: 1, description: descripcion }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        if (!window.MercadoPago) {
          await new Promise<void>(resolve => {
            const s = document.createElement('script');
            s.src = 'https://sdk.mercadopago.com/js/v2';
            s.async = true; s.onload = () => resolve();
            document.body.appendChild(s);
          });
        }

        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'es-AR' });
        await mp.bricks().create('payment', 'brick-mp', {
          initialization: { amount: precio, preferenceId: data.id },
          customization: {
            paymentMethods: {
              mercadoPago: 'all', // Solo wallet y saldo MP
            },
          },
          callbacks: {
            onReady: () => setLoading(false),
            onSubmit: async ({ formData, selectedPaymentMethod }: any) => {
              if (selectedPaymentMethod?.type === 'wallet_purchase') return;
              const r = await fetch('/api/process-payment', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
              });
              const p = await r.json();
              if      (p.status === 'approved') window.location.href = '/success';
              else if (p.status === 'pending' || p.status === 'in_process') window.location.href = '/pending';
              else    window.location.href = '/failure';
            },
            onError: () => setError('Error al conectar con MercadoPago.'),
          },
        });
      } catch (e: any) {
        setError(e.message); setLoading(false);
      }
    };
    init();
  }, [metodo]);

  // est es mi archivo y quiero cambiar el boton de enviar o subir comprobante
  // ── Enviar comprobante ────────────────────────────────────────────
  const handleEnviarComprobante = async () => {
    if (!comprobante) return;
    setEnviando(true);
    const fd = new FormData();
    fd.append('archivo', comprobante);
    fd.append('titulo',  titulo);
    fd.append('precio',  String(precio));
    try {
      const res = await fetch('/api/upload-comprobante', { method: 'POST', body: fd });
      if (res.ok) setEnviado(true);
      else        setError('Error al enviar. Intentá de nuevo.');
    } catch { setError('Error de conexión.'); }
    finally   { setEnviando(false); }
  };

  // supuestamente seria hasta aca no?
  // ── Render ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: K.bg, padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: panelColor, borderRadius: 16, padding: '1.5rem',
          border: `1px solid ${K.border}`, marginBottom: '1rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: K.muted, margin: '0 0 0.4rem' }}>
            Finalizar compra
          </p>
          <p style={{ fontSize: '0.9rem', color: K.sub, margin: '0 0 0.6rem', lineHeight: 1.4 }}>
            {titulo}
          </p>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: K.text, margin: 0, letterSpacing: '-0.02em' }}>
           $ {new Intl.NumberFormat('es-AR').format(Math.round(precioFinal))}
          </p>
          {metodo === 'alias' && (
  <p
    style={{
      marginTop: '0.45rem',
      marginBottom: 0,
      fontSize: '0.88rem',
      fontWeight: 700,
      color: '#666',
    }}
  >
    Ahorrás $
    {new Intl.NumberFormat('es-AR').format(ahorroAlias)}
    {' '}pagando por transferencia
  </p>
)}

{metodo === 'qr' && (
  <p
    style={{
      marginTop: '0.45rem',
      marginBottom: 0,
      fontSize: '0.88rem',
      fontWeight: 700,
      color: '#666',
    }}
  >
    Ahorrás $
    {new Intl.NumberFormat('es-AR').format(ahorroQr)}
    {' '}pagando con QR
  </p>
)}

{(metodo === 'tarjeta' || metodo === 'mp' || metodo === 'otros') && (
  <p
    style={{
      marginTop: '0.45rem',
      marginBottom: 0,
      fontSize: '0.88rem',
      fontWeight: 700,
      color: '#666',
    }}
  >
    Precio final con costos incluidos
  </p>
)}

{(metodo === 'tarjeta' || metodo === 'mp' || metodo === 'otros') && (
  <p
    style={{
      marginTop: '0.2rem',
      marginBottom: 0,
      fontSize: '0.74rem',
      color: '#777',
      lineHeight: 1.3,
    }}
  >
    Pagando por transferencia ahorrabas $
    {new Intl.NumberFormat('es-AR').format(ahorroAlias)}
  </p>
)}
        </div>

        {/* Selector métodos */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: K.muted, margin: '0 0 0.6rem 0.25rem' }}>
            Elegí cómo pagar
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {OPCIONES.map(op => (
              <OpcionBtn
                key={op.id} op={op} activo={metodo === op.id}
                onClick={() => setMetodo(op.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Panel Transferencia ── */}
{/* Caja dinámica según método */}
{metodo !== 'otros' && (
  <div
    style={{
      background:
        metodo === 'alias'
          ? '#bcfae2'
          : metodo === 'qr'
          ? '#ddfde5'
          : metodo === 'tarjeta'
          ? '#fff8de'
          : metodo === 'mp'
          ? '#d7edff': K.surface,
      borderRadius: 12,
      padding: '0.9rem 1rem',
      marginBottom: '1rem',
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
      border: `1px solid ${K.border}`,
    }}
  >
    <img
      src={
        metodo === 'alias'
          ? '/ico-ui/alias.png'
          : metodo === 'qr'
          ? '/ico-ui/qr.png'
          : metodo === 'tarjeta'
          ? '/ico-ui/tarjeta.png'
          : '/ico-ui/mp.png'
      }
      alt="icono"
      style={{
        width: 26,
        height: 26,
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />

    <p
      style={{
        margin: 0,
        fontSize: '0.82rem',
        fontWeight: 700,
        color: '#333',
        lineHeight: 1.35,
      }}
    >
      {metodo === 'alias' &&
        'PAGANDO POR TRANFERENCIA TENES 10% OFF!!. Transferí y luego subí el comprobante.'}

      {metodo === 'qr' &&
        'DESCUENTO 5%!! COMBINA PROMOS CON BANCOS Y BILLETERAS VIRTUALES COMPATIBLES CON QR 3.0'}

      {metodo === 'tarjeta' &&
        'Pagá con crédito, débito o efectivo en Pago Fácil / Rapipago mediante Mercado Pago.'}

      {metodo === 'mp' &&
        'Ingresá a Mercado Pago y usá tu saldo disponible o tarjetas guardadas.'}
    </p>
  </div>
)}

{/* ── Panel Transferencia ── */}

        {metodo === 'alias' && !enviado && (
          <div style={{ background: panelColor, borderRadius: 16, padding: '1.5rem', border: `1px solid ${K.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            
            

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: K.muted, display: 'block', marginBottom: '0.2rem' }}>Alias</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: K.text, letterSpacing: '0.03em' }}>{ALIAS}</span>
            </div>

            {CVU && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: K.muted, display: 'block', marginBottom: '0.2rem' }}>CVU</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: K.text }}>{CVU}</span>
              </div>
            )}

            <div
  style={{
    background: K.warnBg,
    borderRadius: 8,
    padding: '0.75rem 1rem',
    marginBottom: '1.25rem',
  }}
>
  <p style={{ margin: 0, fontSize: '0.82rem', color: K.warn }}>
    ⚠️ Transferí y luego subí el comprobante para confirmar tu pedido.
  </p>
</div>

<label
  style={{
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: K.text,
    marginBottom: '0.5rem',
  }}
>
  Comprobante de transferencia
</label>

<input
  type="file"
  accept="image/*,application/pdf"
  onChange={(e) => setComprobante(e.target.files?.[0] || null)}
  style={{
  width: '100%',
  marginBottom: '1rem',
  fontSize: '0.85rem',
  padding: '0.75rem',
  borderRadius: 10,
  border: `1px solid ${K.border}`,
  background: '#F2F2F2',
  color: '#222',
  cursor: 'pointer',
}}
/>

{error && (
  <p
    style={{
      color: 'red',
      fontSize: '0.82rem',
      marginBottom: '0.75rem',
    }}
  >
    {error}
  </p>
)}

<button
  onClick={handleEnviarComprobante}
  disabled={!comprobante || enviando}
  style={{
    width: '100%',
    padding: '0.9rem',
    borderRadius: 10,
    border: 'none',
    background:
      !comprobante || enviando ? K.border : K.green,
    color:
      !comprobante || enviando ? K.muted : '#fff',
    fontWeight: 800,
    fontSize: '0.95rem',
    cursor:
      !comprobante || enviando
        ? 'not-allowed'
        : 'pointer',
  }}
>
  {enviando ? 'Enviando...' : 'Confirmar pedido →'}
</button>
          </div>
        )}

        {/* ── Confirmación comprobante ── */}
        {metodo === 'alias' && enviado && (
          <div style={{ background: K.greenBg, borderRadius: 16, padding: '2rem', textAlign: 'center', border: `1px solid ${K.green}` }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>✅</p>
            <h2 style={{ fontWeight: 800, color: K.green, marginBottom: '0.5rem' }}>¡Comprobante recibido!</h2>
            <p style={{ color: K.sub, fontSize: '0.88rem' }}>
              Verificamos tu pago y te confirmamos el pedido a la brevedad.
            </p>
          </div>
        )}

        {/* ── Panel Tarjeta / Efectivo ── */}
        {metodo === 'tarjeta' && (
          <div style={{ background: panelColor, borderRadius: 16, padding: '1.5rem', border: `1px solid ${K.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.78rem', color: K.muted, marginBottom: '1rem' }}>
              Tarjeta de crédito, débito o efectivo (Pago Fácil / Rapipago) — procesado por MercadoPago de forma segura, sin necesidad de cuenta.
            </p>
            {loading && <p style={{ color: K.muted, fontSize: '0.85rem' }}>Cargando formulario...</p>}
            {error   && <p style={{ color: 'red',   fontSize: '0.82rem' }}>{error}</p>}
            <div id="brick-tarjeta" />
          </div>
        )}

        {/* ── Panel Cuenta MP ── */}
        {metodo === 'mp' && (
          <div style={{ background: panelColor, borderRadius: 16, padding: '1.5rem', border: `1px solid ${K.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.78rem', color: K.muted, marginBottom: '1rem' }}>
              Iniciá sesión en MercadoPago para pagar con tu saldo disponible o tarjetas guardadas en tu cuenta.
            </p>
            {loading && <p style={{ color: K.muted, fontSize: '0.85rem' }}>Cargando...</p>}
            {error   && <p style={{ color: 'red',   fontSize: '0.82rem' }}>{error}</p>}
            <div id="brick-mp" />
          </div>
        )}
{/* ── Panel QR ── */}
{metodo === 'qr' && (
  <div style={{
    background: panelColor,
    borderRadius: 16,
    padding: '1.5rem',
    border: `1px solid ${K.border}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  }}>
   <p
  style={{
    fontSize: '0.9rem',
    marginBottom: '1rem',
    color: '#333',
    fontWeight: 600,
    lineHeight: 1.4,
  }}
>
  Escaneá este QR con tu app bancaria (MODO, Ualá, Cuenta DNI, Naranja X o MercadoPago)
</p>
    {pagado ? (
      <div style={{
        width: '100%',
        height: 220,
        background: '#e6f9ec',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
        color: '#1a7f37',
        fontWeight: 600
      }}>
        ✅ Pago confirmado
      </div>
    ) : qrUrl ? (
      <img
        src={qrUrl}
        alt="QR de pago"
        style={{
          width: '100%',
          maxWidth: 260,
          borderRadius: 12,
          display: 'block',
          margin: '0 auto'
        }}
      />
    ) : (
      <div style={{
        width: '100%',
        height: 220,
        background: '#eee',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        Generando QR...
      </div>
    )}
  </div>
)}
        {/* ── Panel Otros métodos ── */}
        {metodo === 'otros' && (
          <div style={{ background: K.surface, borderRadius: 16, padding: '1.5rem', border: `1px solid ${K.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: K.muted, marginBottom: '1rem' }}>
              Plataformas disponibles próximamente
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {[
  { nombre: 'Cripto', icono: '/ico-ui/cripto.png' },
  { nombre: 'PayPal', icono: '/ico-ui/paypal.png' },
  { nombre: 'Apple Pay', icono: '/ico-ui/a-pay.png' },
  { nombre: 'Google Pay', icono: '/ico-ui/g-pay.png' },
  { nombre: 'Stripe', icono: '/ico-ui/stripe.png' },
  { nombre: 'Otros', icono: '/ico-ui/otros.png' },

].map(p => (
  <div
    key={p.nombre}
    style={{
      flex: '1 1 100px',
      padding: '1rem 0.75rem',
      borderRadius: 10,
      border: `1.5px solid ${K.border}`,
      textAlign: 'center',
    }}
  >
    <img
      src={p.icono}
      alt={p.nombre}
      style={{
        width: 34,
        height: 34,
        objectFit: 'contain',
        marginBottom: '0.45rem',
      }}
    />

    <div
      style={{
        fontSize: '0.8rem',
        fontWeight: 700,
        color: K.text,
      }}
    >
      {p.nombre}
    </div>

    <div
      style={{
        fontSize: '0.65rem',
        color: K.muted,
        marginTop: '0.2rem',
      }}
    >
      Próximamente
    </div>
  </div>
))}
            </div>
            <div style={{ background: K.bg, borderRadius: 8, padding: '0.75rem 1rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: K.sub }}>
                ¿Necesitás pagar con alguna de estas plataformas? Contactanos y lo gestionamos.
              </p>
              <a
                href="https://wa.me/5491158081432?text=Hola%2C%20quiero%20consultar%20sobre%20m%C3%A9todos%20de%20pago%20alternativos%20para%20mi%20compra."
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-block', marginTop: '0.6rem',
                  background: '#25D366', color: '#fff',
                  padding: '0.4rem 1rem', borderRadius: 20,
                  textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700,
                }}
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        )}
{/* Volver a la tienda */}
<div style={{ textAlign: 'center', marginTop: '1rem' }}>
  <a href="/" style={{
    fontSize: '0.88rem', color: K.muted,
    textDecoration: 'none', display: 'inline-flex',
    alignItems: 'center', gap: '0.3rem',
  }}>
    ← Volver a la tienda
  </a>
</div>
        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: K.muted, marginTop: '1.5rem' }}>
          🔒 Tus datos están protegidos · Pagos procesados de forma segura
        </p>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#9A9690' }}>Cargando...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}