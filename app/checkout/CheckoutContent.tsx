'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '../store/useCartStore';

declare global {
  interface Window { MercadoPago: any }
}

// ── DATOS GLAMOUR URQUIZA ───────────────────────────────────────────
const ALIAS = 'glamour.urquiza';
const CVU   = '0000003100000550350075';
const ALIAS_CBU = 'VILLEGASGLADYS';
const CBU   = '0170339740000064116107';

const K = {
  bg:        '#FFF8F8',
  surface:   '#FFFFFF',
  border:    '#FFC9CB',
  muted:     '#9A9690',
  text:      '#1C1B19',
  sub:       '#6B6862',
  accent:    '#FF0000',
  accentBg:  '#FFF0F1',
  green:     '#1A7F5A',
  greenBg:   '#EDF7F3',
  mp:        '#009EE3',
  mpBg:      '#EDF7FD',
  warn:      '#7A5C00',
  warnBg:    '#FFF8E1',
} as const;

type Metodo = 'alias' | 'tarjeta' | 'mp' | 'otros' | 'qr';

const OPCIONES = [
  { id: 'alias', label: 'Transferencia', sub: '20% OFF pagando directo', icon: '/ico-ui/alias.png', bg: '#FFF0F1' },
  { id: 'qr', label: 'QR Bancario', sub: 'Pagá con MODO, Ualá o bancos', icon: '/ico-ui/qr.png', bg: '#F0F8F2' },
  { id: 'tarjeta', label: 'Tarjeta / Efectivo', sub: 'Crédito, débito o Rapipago', icon: '/ico-ui/tarjeta.png', bg: '#FFF8E8' },
  { id: 'mp', label: 'Cuenta MP', sub: 'Saldo o tarjetas guardadas', icon: '/ico-ui/mp.png', bg: '#EEF8FF' },
  { id: 'otros', label: 'Otros métodos', sub: 'Payway y globales', icon: '/ico-ui/otros.png', bg: '#F6F6F6' },
] as const;

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
    op.id === 'alias' ? '#FFD1D3' : op.id === 'qr' ? '#ddfde5' : op.id === 'tarjeta' ? '#fff8de' : op.id === 'mp' ? '#dff3ff' : '#f3f3f3';

  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 140px',
        padding: '0.9rem',
        borderRadius: 14,
        cursor: 'pointer',
        textAlign: 'left',
        border: `2px solid ${activo ? '#FF0000' : '#FFC9CB'}`,
        background: activo ? activeBg : op.bg,
        transition: '0.2s',
        opacity: 1,
      }}
    >
      <img src={op.icon} alt={op.label} style={{ width: 28, height: 28, objectFit: 'contain', marginBottom: '0.45rem', display: 'block' }} />
      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1C1B19', lineHeight: 1.2 }}>{op.label}</div>
      <div style={{ fontSize: '0.68rem', color: '#777', marginTop: '0.25rem', lineHeight: 1.25 }}>{op.sub}</div>
    </button>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const [pagado, setPagado] = useState(false);
  const [metodo, setMetodo] = useState<Metodo>('alias');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const cart = useCartStore((state) => state.items);
  const total = cart.reduce((acc: number, item: any) => acc + item.producto.precioTransfer * item.cantidad + item.envio, 0);

  const precioFinal = metodo === 'alias' ? total : metodo === 'qr' ? total * 1.10 : total * 1.25;
  const precioLista = Math.round(total / 0.8);
  const ahorroAlias = precioLista - total;

  const titulo = 'Compra en Glamour Urquiza';
  const panelColor = metodo === 'alias' ? '#FFF0F1' : metodo === 'qr' ? '#ddfde5' : metodo === 'tarjeta' ? '#fff8de' : metodo === 'mp' ? '#d7edff' : K.surface;

  // ── Polling QR ──
  useEffect(() => {
    if (metodo !== 'qr') return;
    const generarQR = async () => {
      try {
        const res = await fetch('/api/create-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, precio: Math.round(precioFinal) }),
        });
        const data = await res.json();
        if (data.qr) {
          setQrUrl(data.qr);
          setOrderId(data.orderId);
        }
      } catch (e) { console.error('Error QR', e); }
    };
    generarQR();
  }, [metodo]);

  useEffect(() => {
    if (!qrUrl || !orderId || metodo !== 'qr') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?id=${orderId}`);
        const data = await res.json();
        if (data.paid) { setPagado(true); clearInterval(interval); }
      } catch (e) { console.error('Polling error', e); }
    }, 5000);
    return () => clearInterval(interval);
  }, [qrUrl, orderId, metodo]);

  // ── Bricks MercadoPago ──
  useEffect(() => {
    if (metodo !== 'tarjeta' && metodo !== 'mp') return;
    const containerId = metodo === 'tarjeta' ? 'brick-tarjeta' : 'brick-mp';
    const container = document.getElementById(containerId);
    if (!container || container.children.length > 0) return;

    const init = async () => {
      try {
        const res = await fetch('/api/create-preference', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titulo, price: Math.round(precioFinal), quantity: 1 }),
        });
        const data = await res.json();
        if (!window.MercadoPago) {
          await new Promise<void>(resolve => {
            const s = document.createElement('script'); s.src = 'https://sdk.mercadopago.com/js/v2';
            s.async = true; s.onload = () => resolve(); document.body.appendChild(s);
          });
        }
        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'es-AR' });
        await mp.bricks().create('payment', containerId, {
          initialization: { amount: Math.round(precioFinal), preferenceId: data.id },
          customization: { 
            paymentMethods: { 
              creditCard: metodo === 'tarjeta' ? 'all' : undefined, 
              debitCard: metodo === 'tarjeta' ? 'all' : undefined, 
              mercadoPago: metodo === 'mp' ? 'all' : undefined 
            } 
          },
          callbacks: {
            onReady: () => setLoading(false),
            onSubmit: async ({ formData }: any) => {
              const r = await fetch('/api/process-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
              const p = await r.json();
              if (p.status === 'approved') setPagado(true); else setError('Pago rechazado');
            },
          },
        });
      } catch (e: any) { setError(e.message); setLoading(false); }
    };
    init();
  }, [metodo]);

  const handleEnviarComprobante = async () => {
    if (!comprobante) return;
    setEnviando(true);
    const fd = new FormData();
    fd.append('archivo', comprobante);
    fd.append('titulo',  titulo);
    fd.append('precio',  String(Math.round(precioFinal)));
    try {
      const res = await fetch('/api/upload-comprobante', { method: 'POST', body: fd });
      if (res.ok) setEnviado(true); else setError('Error al enviar.');
    } catch { setError('Error de conexión.'); }
    finally { setEnviando(false); }
  };

  // ── Pantalla Éxito ──
  if (enviado || pagado) {
    return (
      <div style={{ minHeight: '100vh', background: K.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: 500, width: '100%', background: '#fff', borderRadius: 24, padding: '3rem', textAlign: 'center', border: `2px solid ${K.accent}` }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontWeight: 900, color: K.text, marginBottom: '1rem' }}>¡PEDIDO RECIBIDO!</h2>
          <p style={{ color: K.sub, marginBottom: '2rem' }}>{pagado ? 'Tu pago fue aprobado exitosamente.' : 'Recibimos tu comprobante. Lo verificaremos a la brevedad.'}</p>
          <button onClick={() => router.push('/')} style={{ width: '100%', padding: '1rem', borderRadius: 50, background: K.accent, color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>VOLVER AL INICIO</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: K.bg, padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <div style={{ background: panelColor, borderRadius: 16, padding: '1.5rem', border: `1px solid ${K.border}`, marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: K.muted, margin: '0 0 0.4rem' }}>Finalizar compra</p>
          <p style={{ fontSize: '0.9rem', color: K.sub, margin: '0 0 0.6rem', lineHeight: 1.4 }}>{titulo}</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: K.text, margin: 0 }}>$ {new Intl.NumberFormat('es-AR').format(Math.round(precioFinal))}</p>
          {metodo === 'alias' && <p style={{ marginTop: '0.45rem', fontSize: '0.88rem', fontWeight: 700, color: '#666' }}>Ahorrás ${new Intl.NumberFormat('es-AR').format(ahorroAlias)} pagando por transferencia</p>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: K.muted, margin: '0 0 0.6rem 0.25rem' }}>Elegí cómo pagar</p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {OPCIONES.map(op => <OpcionBtn key={op.id} op={op} activo={metodo === op.id} onClick={() => setMetodo(op.id)} />)}
          </div>
        </div>

        {/* ── PANEL DE MENSAJES CON TUS ICONOS PNG (RESTAURADO) ── */}
        {metodo !== 'otros' && (
          <div style={{
            background: panelColor, borderRadius: 12, padding: '0.9rem 1rem', marginBottom: '1rem',
            display: 'flex', gap: '0.75rem', alignItems: 'center', border: `1px solid ${K.border}`,
          }}>
            <img src={`/ico-ui/${metodo === 'alias' ? 'alias' : metodo === 'qr' ? 'qr' : metodo === 'tarjeta' ? 'tarjeta' : 'mp'}.png`}
              alt="icono" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#333', lineHeight: 1.35 }}>
              {metodo === 'alias' && 'PAGANDO POR TRANFERENCIA TENES 20% OFF!!. Transferí y luego subí el comprobante.'}
              {metodo === 'qr' && 'DESCUENTO 10%!! COMBINA PROMOS CON BANCOS Y BILLETERAS VIRTUALES.'}
              {metodo === 'tarjeta' && 'Pagá con crédito, débito o efectivo en Pago Fácil / Rapipago mediante Mercado Pago.'}
              {metodo === 'mp' && 'Ingresá a Mercado Pago y usá tu saldo disponible o tarjetas guardadas.'}
            </p>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: `1px solid ${K.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {metodo === 'alias' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: K.muted, display: 'block' }}>Alias Mercado Pago</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{ALIAS}</span>
                <span style={{ fontSize: '0.75rem', color: K.muted, display: 'block' }}>{CVU}</span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: K.muted, display: 'block' }}>Alias Banco BBVA</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{ALIAS_CBU}</span>
                <span style={{ fontSize: '0.75rem', color: K.muted, display: 'block' }}>{CBU}</span>
              </div>
              <input type="file" onChange={(e) => setComprobante(e.target.files?.[0] || null)} style={{ width: '100%', marginBottom: '1rem' }} />
              <button onClick={handleEnviarComprobante} disabled={!comprobante || enviando} style={{ width: '100%', padding: '0.9rem', borderRadius: 10, border: 'none', background: !comprobante || enviando ? K.border : '#FF0000', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                {enviando ? 'Enviando...' : 'Confirmar pedido →'}
              </button>
            </>
          )}

          {metodo === 'qr' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Escaneá con tu app bancaria</p>
              {qrUrl ? <img src={qrUrl} alt="QR" style={{ width: '100%', maxWidth: 260, borderRadius: 12, display: 'block', margin: '0 auto' }} /> : <p>Generando QR...</p>}
            </div>
          )}

          {metodo === 'tarjeta' && <div id="brick-tarjeta" />}
          {metodo === 'mp' && <div id="brick-mp" />}

         {metodo === 'otros' && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { n: 'Payway', i: 'payway' },
                { n: 'Apple Pay', i: 'a-pay' },
                { n: 'Google Pay', i: 'g-pay' },
                { n: 'PayPal', i: 'paypal' },
                { n: 'Cripto', i: 'cripto' },
                { n: 'Stripe', i: 'stripe' },
              ].map(p => (
                <div
                  key={p.n}
                  style={{
                    flex: '1 1 140px', // 👈 Esto asegura 3 por fila en desktop y 2 en mobile
                    maxWidth: '160px',
                    padding: '1.2rem 0.5rem',
                    borderRadius: 16,
                    border: `1.5px solid ${K.border}`,
                    textAlign: 'center',
                    background: '#fdfdfd'
                  }}
                >
                  <img
                    src={`/ico-ui/${p.i}.png`}
                    alt={p.n}
                    style={{
                      width: 35,     // 👈 Tamaño fijo para evitar distorsión
                      height: 35,    // 👈 Tamaño fijo
                      objectFit: 'contain', // 👈 Evita que se estiren
                      marginBottom: '0.6rem',
                      display: 'inline-block'
                    }}
                  />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: K.text }}>
                    {p.n}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#999', marginTop: '0.2rem' }}>
                    Próximamente
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="https://wa.me/5491167914366" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#FF0000', color: 'white', padding: '0.8rem 1.5rem', borderRadius: 50, textDecoration: 'none', fontWeight: 800 }}>
             CONSULTAR POR WHATSAPP
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={() => router.push('/')} style={{ color: K.muted, background: 'none', border: 'none', cursor: 'pointer' }}>← Volver a la tienda</button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}