'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '../store/useCartStore';
import { MessageCircle, CreditCard, QrCode } from 'lucide-react';

declare global {
  interface Window { MercadoPago: any }
}

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
  green:     '#FF0000', 
  greenBg:   '#FFF0F1',
  mp:        '#009EE3',
  mpBg:      '#EDF7FD',
  warn:      '#7A5C00',
  warnBg:    '#FFF8E1',
} as const;

type Metodo = 'alias' | 'tarjeta' | 'mp' | 'otros' | 'qr';

const OPCIONES = [
  { id: 'alias', label: 'Transferencia', sub: '20% OFF directo', icon: '/ico-ui/alias.png', bg: '#FFF0F1' },
  { id: 'qr', label: 'QR Bancario', sub: 'Pagá con MODO o bancos', icon: '/ico-ui/qr.png', bg: '#F0F8F2' },
  { id: 'tarjeta', label: 'Tarjeta / Efectivo', sub: 'Crédito o Rapipago', icon: '/ico-ui/tarjeta.png', bg: '#FFF8E8' },
  { id: 'mp', label: 'Cuenta MP', sub: 'Saldo o tarjetas MP', icon: '/ico-ui/mp.png', bg: '#EEF8FF' },
  { id: 'otros', label: 'Otros métodos', sub: 'Payway y globales', icon: '/ico-ui/otros.png', bg: '#F6F6F6' },
] as const;

function OpcionBtn({ op, activo, onClick }: { op: typeof OPCIONES[number], activo: boolean, onClick: () => void }) {
  const activeBg = op.id === 'alias' ? '#FFD1D3' : op.id === 'qr' ? '#ddfde5' : op.id === 'tarjeta' ? '#fff8de' : op.id === 'mp' ? '#dff3ff' : '#f3f3f3';
  return (
    <button onClick={onClick} style={{ flex: '1 1 140px', padding: '0.9rem', borderRadius: 14, cursor: 'pointer', textAlign: 'left', border: `2px solid ${activo ? K.accent : K.border}`, background: activo ? activeBg : op.bg, transition: '0.2s' }}>
      <img src={op.icon} alt={op.label} style={{ width: 28, height: 28, marginBottom: '0.45rem', display: 'block' }} />
      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1C1B19' }}>{op.label}</div>
      <div style={{ fontSize: '0.68rem', color: '#777', marginTop: '0.25rem' }}>{op.sub}</div>
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

  const precioLista = Math.round(total / 0.8);
  const ahorroAlias = precioLista - total;
  const titulo = 'Compra en Glamour Urquiza';
  const precioFinal = metodo === 'alias' ? total : metodo === 'qr' ? total * 1.10 : total * 1.25;
  const precioRender = Math.round(precioFinal);

  const panelColor = metodo === 'alias' ? '#FFF0F1' : metodo === 'qr' ? '#ddfde5' : metodo === 'tarjeta' ? '#fff8de' : metodo === 'mp' ? '#d7edff' : K.surface;

  // ── Polling QR ──
  useEffect(() => {
    if (metodo !== 'qr') return;
    const generarQR = async () => {
      try {
        const res = await fetch('/api/create-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, precio: precioRender }),
        });
        const data = await res.json();
        if (data.qr && data.orderId) {
          setQrUrl(data.qr);
          setOrderId(data.orderId);
        }
      } catch (e) { console.error('Error QR', e); }
    };
    generarQR();
  }, [metodo]);

  useEffect(() => {
    if (!qrUrl || !orderId || metodo !== 'qr' || pagado) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?id=${orderId}`);
        const data = await res.json();
        if (data.paid) { setPagado(true); clearInterval(interval); }
      } catch (e) { console.error('Polling error', e); }
    }, 5000);
    return () => clearInterval(interval);
  }, [qrUrl, orderId, metodo, pagado]);

  // ── Brick Tarjeta (Restaurado) ──
  useEffect(() => {
    if (metodo !== 'tarjeta') return;
    const container = document.getElementById('brick-tarjeta');
    if (!container || container.children.length > 0) return;
    const init = async () => {
      try {
        const res = await fetch('/api/create-preference', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titulo, price: precioRender, quantity: 1 }),
        });
        const data = await res.json();
        if (!window.MercadoPago) {
          await new Promise<void>(resolve => {
            const s = document.createElement('script'); s.src = 'https://sdk.mercadopago.com/js/v2';
            s.async = true; s.onload = () => resolve(); document.body.appendChild(s);
          });
        }
        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'es-AR' });
        await mp.bricks().create('payment', 'brick-tarjeta', {
          initialization: { amount: precioRender, preferenceId: data.id },
          customization: { paymentMethods: { creditCard: 'all', debitCard: 'all', ticket: 'all' } },
          callbacks: {
            onReady: () => setLoading(false),
            onSubmit: async ({ formData }: any) => {
              const r = await fetch('/api/process-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
              const p = await r.json();
              window.location.href = p.status === 'approved' ? '/success' : p.status === 'pending' ? '/pending' : '/failure';
            },
          },
        });
      } catch (e: any) { setError(e.message); setLoading(false); }
    };
    init();
  }, [metodo]);

  // ── Brick Cuenta MP (Restaurado) ──
  useEffect(() => {
    if (metodo !== 'mp') return;
    const container = document.getElementById('brick-mp');
    if (!container || container.children.length > 0) return;
    const init = async () => {
      try {
        const res = await fetch('/api/create-preference', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titulo, price: precioRender, quantity: 1 }),
        });
        const data = await res.json();
        if (!window.MercadoPago) {
          await new Promise<void>(resolve => {
            const s = document.createElement('script'); s.src = 'https://sdk.mercadopago.com/js/v2';
            s.async = true; s.onload = () => resolve(); document.body.appendChild(s);
          });
        }
        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'es-AR' });
        await mp.bricks().create('payment', 'brick-mp', {
          initialization: { amount: precioRender, preferenceId: data.id },
          customization: { paymentMethods: { mercadoPago: 'all' } },
          callbacks: {
            onReady: () => setLoading(false),
            onSubmit: async ({ formData }: any) => {
              const r = await fetch('/api/process-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
              const p = await r.json();
              window.location.href = p.status === 'approved' ? '/success' : p.status === 'pending' ? '/pending' : '/failure';
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
    fd.append('precio',  String(precioRender));
    try {
      const res = await fetch('/api/upload-comprobante', { method: 'POST', body: fd });
      if (res.ok) setEnviado(true);
      else setError('Error al subir. Verificá el Refresh Token.');
    } catch { setError('Error de conexión.'); }
    finally { setEnviando(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: K.bg, padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* HEADER DE PRECIOS */}
        <div style={{ background: panelColor, borderRadius: 20, padding: '1.8rem', border: `2px solid ${K.border}`, marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: K.accent, margin: '0 0 0.5rem' }}>Finalizar Compra — Glamour Urquiza</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: K.text, margin: 0 }}>$ {new Intl.NumberFormat('es-AR').format(precioRender)}</p>
          {metodo === 'alias' && <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: K.accent }}>Ahorrás ${new Intl.NumberFormat('es-AR').format(ahorroAlias)} pagando directo</p>}
        </div>

        {/* SELECTOR DE MÉTODOS */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {OPCIONES.map(op => <OpcionBtn key={op.id} op={op} activo={metodo === op.id} onClick={() => setMetodo(op.id)} />)}
        </div>

        {/* MENSAJES INFORMATIVOS DE CADA BOTÓN (Restaurado) */}
        <div style={{ background: panelColor, borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', border: `1px solid ${K.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
           <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#333', lineHeight: 1.4 }}>
             {metodo === 'alias' && '🎁 20% OFF APLICADO. Transferí a las cuentas debajo y subí el comprobante.'}
             {metodo === 'qr' && '💸 10% OFF CON QR. Escaneá con MODO, Cuenta DNI o tu App Bancaria.'}
             {metodo === 'tarjeta' && '💳 Pagá en cuotas con crédito o débito mediante Mercado Pago.'}
             {metodo === 'mp' && '📱 Usá el dinero disponible en tu cuenta o tus tarjetas guardadas.'}
             {metodo === 'otros' && '🚀 Próximamente: Payway, Apple Pay y más medios globales.'}
           </p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', border: `2px solid ${K.border}` }}>
          
          {metodo === 'alias' && !enviado && (
            <>
              <div style={{ marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: K.muted }}>MERCADO PAGO ALIAS:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'block' }}>{ALIAS}</span>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: K.muted }}>BBVA CBU ALIAS:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'block' }}>{ALIAS_CBU}</span>
              </div>
              <input type="file" onChange={(e) => setComprobante(e.target.files?.[0] || null)} style={{ width: '100%', marginBottom: '1rem' }} />
              <button onClick={handleEnviarComprobante} disabled={!comprobante || enviando} style={{ width: '100%', padding: '1rem', borderRadius: 50, background: !comprobante || enviando ? '#ccc' : K.accent, color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                {enviando ? 'Subiendo...' : 'CONFIRMAR PEDIDO →'}
              </button>
            </>
          )}

          {metodo === 'qr' && (
            <div style={{ textAlign: 'center' }}>
              {pagado ? <div style={{ background: '#e6f9ec', padding: '2rem', borderRadius: 15, color: '#1a7f37', fontWeight: 800 }}>✅ PAGO CONFIRMADO</div> : qrUrl ? <img src={qrUrl} alt="QR" style={{ width: '100%', maxWidth: 250, borderRadius: 15 }} /> : <p>Generando QR...</p>}
            </div>
          )}

          {/* BRICKS (Restaurados) */}
          {metodo === 'tarjeta' && <div id="brick-tarjeta" />}
          {metodo === 'mp' && <div id="brick-mp" />}

          {metodo === 'otros' && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Payway', 'Apple Pay', 'Google Pay', 'PayPal'].map(n => (
                  <div key={n} style={{ padding: '1rem', border: `1px solid #eee`, borderRadius: 15, minWidth: '100px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem' }}>{n}</span>
                    <span style={{ fontSize: '0.6rem', color: '#999' }}>Próximamente</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="https://wa.me/5491167914366" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#FF0000', color: 'white', padding: '0.8rem 1.5rem', borderRadius: 50, textDecoration: 'none', fontWeight: 800 }}>
            <MessageCircle size={22} /> CONSULTAR POR WHATSAPP
          </a>
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