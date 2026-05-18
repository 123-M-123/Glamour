'use client';

import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { CheckCircle2, ArrowLeft, X } from 'lucide-react';
import TransferPanel from './components/TransferPanel';
import QrPanel from './components/QrPanel';
import BrickPanel from './components/BrickPanel';

const K = {
  bg: '#FFF8F8',
  border: '#FFC9CB',
  accent: '#FF0000',
  text: '#1C1B19',
  muted: '#9A9690'
};

const VENDEDOR_EMAIL = "tiendadtiendas@gmail.com"; // 👈 PARA TUS PRUEBAS

const OPCIONES = [
  { id: 'alias', label: 'Transferencia', sub: '20% OFF directo', icon: '/ico-ui/alias.png', bg: '#FFF0F1' },
  { id: 'qr', label: 'QR Bancario', sub: 'MODO o bancos', icon: '/ico-ui/qr.png', bg: '#F0F8F2' },
  { id: 'tarjeta', label: 'Tarjeta / Efectivo', sub: 'Crédito o Rapipago', icon: '/ico-ui/tarjeta.png', bg: '#FFF8E8' },
  { id: 'mp', label: 'Cuenta MP', sub: 'Saldo o tarjetas MP', icon: '/ico-ui/mp.png', bg: '#EEF8FF' },
  { id: 'otros', label: 'Otros métodos', sub: 'Payway y globales', icon: '/ico-ui/otros.png', bg: '#F6F6F6' },
] as const;

export default function CheckoutContent() {
  const [metodo, setMetodo] = useState<any>('alias');
  const [completado, setCompletado] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const cart = useCartStore((state) => state.items);
  const customerData = useCartStore((state) => state.customerData);
  const setCustomerData = useCartStore((state) => state.setCustomerData);

  const total = cart.reduce((acc: number, item: any) => acc + item.producto.precioTransfer * item.cantidad + item.envio, 0);
  const precioLista = Math.round(total / 0.8);
  const ahorro = precioLista - total;
  const precioFinal = metodo === 'alias' ? total : metodo === 'qr' ? total * 1.10 : total * 1.25;
  const montoFormateado = new Intl.NumberFormat('es-AR').format(Math.round(precioFinal));

  const waMsg = encodeURIComponent(`Hola! Quiero solicitar un link de pago Payway por mi compra en Glamour Urquiza. Total: $${montoFormateado}`);
  const whatsappPayway = `https://wa.me/5491167914366?text=${waMsg}`;

  const tieneDatos = customerData.nombre && customerData.whatsapp && customerData.entrega;

  if (completado) {
    return (
      <div style={{ minHeight: '100vh', background: K.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 450, background: 'white', padding: '3rem', borderRadius: 30, textAlign: 'center', border: `2px solid ${K.accent}` }}>
          <CheckCircle2 size={80} color={K.accent} style={{ marginBottom: '20px' }} />
          <h1 style={{ fontWeight: 900 }}>¡PEDIDO RECIBIDO!</h1>
          <button onClick={() => window.location.href = '/'} style={{ width: '100%', padding: '1rem', borderRadius: 50, background: K.accent, color: 'white', border: 'none', cursor: 'pointer', marginTop: '20px' }}>VOLVER AL INICIO</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: K.bg, padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        
        <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', border: `2px solid ${K.border}`, marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: K.muted, marginBottom: '5px' }}>Finalizar compra en Glamour</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 950, margin: 0 }}>$ {montoFormateado}</p>
          {metodo === 'alias' && <p style={{ fontSize: '0.9rem', color: K.accent, fontWeight: 700, marginTop: '5px' }}>¡Ahorrás ${new Intl.NumberFormat('es-AR').format(ahorro)} pagando directo!</p>}
        </div>

        <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {OPCIONES.map(op => (
            <button key={op.id} onClick={() => { setMetodo(op.id); if (op.id !== 'alias' && op.id !== 'otros' && !tieneDatos) setShowModal(true); }} style={{ 
              flex: '1 1 140px', padding: '0.9rem', borderRadius: 18, cursor: 'pointer', textAlign: 'left', 
              border: `2px solid ${metodo === op.id ? K.accent : K.border}`, 
              background: metodo === op.id ? '#FFD1D3' : 'white', transition: '0.3s' 
            }}>
              <img src={op.icon} alt={op.label} style={{ width: 28, height: 28, marginBottom: '0.4rem', display: 'block', objectFit: 'contain' }} />
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: K.text }}>{op.label}</div>
              <div style={{ fontSize: '0.65rem', color: '#777' }}>{op.sub}</div>
            </button>
          ))}
        </div>

        <div style={{ background: '#FFF0F1', padding: '1.1rem', borderRadius: 15, marginBottom: '1.5rem', display: 'flex', gap: '15px', alignItems: 'center', border: `1px solid ${K.border}` }}>
          <img src={OPCIONES.find(o => o.id === metodo)?.icon} style={{ width: 34, height: 34, objectFit: 'contain' }} alt="icon" />
          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#333', lineHeight: 1.4 }}>
             {metodo === 'alias' && 'TRANSFERENCIA: 20% OFF aplicado. Transferí y subí el comprobante.'}
             {metodo === 'qr' && 'QR BANCARIO: 10% OFF aplicado. Pagá con MODO, Ualá o tu Banco.'}
             {metodo === 'tarjeta' && 'TARJETAS: Pagá en cuotas de forma segura vía Mercado Pago.'}
             {metodo === 'mp' && 'CUENTA MERCADO PAGO: Usá tu saldo o tarjetas guardadas.'}
             {metodo === 'otros' && 'OTROS MÉTODOS: Payway y medios de pago globales.'}
          </p>
        </div>

        <div style={{ background: 'white', padding: '1.8rem', borderRadius: 24, border: `2px solid ${K.border}` }}>
          {metodo === 'alias' && (
            <TransferPanel total={total} vendedorEmail={VENDEDOR_EMAIL} onExito={() => setCompletado(true)} />
          )}
          
          {metodo === 'qr' && tieneDatos && (
            <QrPanel precio={Math.round(precioFinal)} vendedorEmail={VENDEDOR_EMAIL} onPagoConfirmado={() => setCompletado(true)} />
          )}

          {(metodo === 'tarjeta' || metodo === 'mp') && tieneDatos && (
             <BrickPanel metodo={metodo} precio={precioFinal} vendedorEmail={VENDEDOR_EMAIL} onPagoAprobado={() => setCompletado(true)} />
          )}

          {metodo === 'otros' && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { n: 'Payway', i: 'payway' }, { n: 'Apple Pay', i: 'a-pay' }, { n: 'Google Pay', i: 'g-pay' },
                { n: 'PayPal', i: 'paypal' }, { n: 'Cripto', i: 'cripto' }, { n: 'Stripe', i: 'stripe' },
              ].map(p => (
                <div key={p.n} style={{ flex: '1 1 120px', maxWidth: '160px', padding: '1.2rem 0.5rem', borderRadius: 16, border: `1.5px solid ${K.border}`, textAlign: 'center', background: '#fdfdfd' }}>
                  <img src={`/ico-ui/${p.i}.png`} alt={p.n} style={{ width: 35, height: 35, objectFit: 'contain', marginBottom: '0.6rem', display: 'inline-block' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: K.text }}>{p.n}</div>
                  <div style={{ fontSize: '0.6rem', color: '#999' }}>Próximamente</div>
                </div>
              ))}
            </div>
          )}

          {metodo !== 'alias' && metodo !== 'otros' && !tieneDatos && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <button onClick={() => setShowModal(true)} style={{ background: K.accent, color: 'white', padding: '1rem 2rem', borderRadius: 50, border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                CONFIGURAR DATOS DE ENVÍO →
              </button>
            </div>
          )}
        </div>

        {/* 🔴 RESTAURADO BOTÓN PAYWAY */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a href={whatsappPayway} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', background: '#FF0000', color: 'white', padding: '0.8rem 2rem', borderRadius: 50, textDecoration: 'none', fontWeight: 800, fontSize: '1rem', boxShadow: '0 10px 25px rgba(255,0,0,0.2)' }}>
            <img src="/ico-ui/payway-2.png" alt="Payway" style={{ height: '36px' }} />
            <span>Solicitar Link de Pago Payway</span>
            <img src="/icons/whats-rojo.png" alt="WhatsApp" style={{ height: '30px' }} />
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => window.location.href = '/'} style={{ background: 'none', border: 'none', color: '#999', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <ArrowLeft size={16} /> Volver a la tienda
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: K.muted, marginTop: '1.5rem' }}>
          🔒 Tus datos están protegidos · Pagos procesados de forma segura
        </p>

      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '2.5rem', border: `2px solid ${K.accent}`, position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
            <h3 style={{ fontWeight: 950, textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.3rem' }}>DATOS DE ENVÍO</h3>
            <input type="text" placeholder="Nombre Completo" id="mn" defaultValue={customerData.nombre} style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1.5px solid ${K.border}`, marginBottom: '0.8rem' }} />
            <input type="tel" placeholder="WhatsApp" id="mw" defaultValue={customerData.whatsapp} style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1.5px solid ${K.border}`, marginBottom: '0.8rem' }} />
            <input type="text" placeholder="Dirección / Punto de Entrega" id="md" defaultValue={customerData.entrega} style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1.5px solid ${K.border}`, marginBottom: '1.5rem' }} />
            <button onClick={() => {
              const n = (document.getElementById('mn') as HTMLInputElement).value;
              const w = (document.getElementById('mw') as HTMLInputElement).value;
              const d = (document.getElementById('md') as HTMLInputElement).value;
              if(n && w && d) { setCustomerData({ nombre: n, whatsapp: w, entrega: d }); setShowModal(false); }
            }} style={{ width: '100%', padding: '1.1rem', borderRadius: 50, background: K.accent, color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer' }}>CONTINUAR Y PAGAR</button>
          </div>
        </div>
      )}
    </div>
  );
}