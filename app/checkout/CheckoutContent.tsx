'use client';

import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { CheckCircle2, ArrowLeft, X, ShieldCheck } from 'lucide-react';
import TransferPanel from './components/TransferPanel';
import QrPanel from './components/QrPanel';
import BrickPanel from './components/BrickPanel';
import PaywayPanel from './components/PaywayPanel';

const K = { bg: '#FFF8F8', border: '#FFC9CB', accent: '#FF0000', text: '#1C1B19', muted: '#9A9690' };
const VENDEDOR_EMAIL = "tiendadtiendas@gmail.com"; 

const OPCIONES = [
  { id: 'alias', label: 'Transferencia', sub: '20% OFF directo', icon: '/ico-ui/alias.png' },
  { id: 'qr', label: 'QR MP', sub: 'MercadoPago', icon: '/ico-ui/qr.png' },
  { id: 'tarjeta', label: 'Tarjeta / Efectivo', sub: 'Crédito o Rapipago', icon: '/ico-ui/tarjeta.png' },
  { id: 'mp', label: 'Cuenta MP', sub: 'Saldo o tarjetas MP', icon: '/ico-ui/mp.png' },
  { id: 'payway', label: 'Tarjeta Bancaria', sub: 'Débito o Crédito', icon: '/ico-ui/payway.png' },
  { id: 'otros', label: 'Otros métodos', sub: 'Payway y globales', icon: '/ico-ui/otros.png' },
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
  
  const tieneDatos = customerData.nombre && customerData.whatsapp && customerData.entrega;

  const handleSelectMetodo = (id: string) => {
    setMetodo(id);
    if (id !== 'alias' && id !== 'otros' && !tieneDatos) {
      setShowModal(true);
    }
  };

  if (completado) return (
    <div style={{ minHeight: '100vh', background: K.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 450, background: 'white', padding: '3rem', borderRadius: 30, textAlign: 'center', border: `2px solid ${K.accent}` }}>
        <CheckCircle2 size={80} color={K.accent} style={{ marginBottom: '20px' }} />
        <h1 style={{ fontWeight: 900 }}>¡PEDIDO RECIBIDO!</h1>
        <button onClick={() => window.location.href = '/'} style={{ width: '100%', padding: '1rem', borderRadius: 50, background: K.accent, color: 'white', border: 'none', cursor: 'pointer', marginTop: '20px' }}>VOLVER AL INICIO</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: K.bg, padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        
        {/* Widget de Precio */}
        <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', border: `2px solid ${K.border}`, marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: K.muted, marginBottom: '5px' }}>Finalizar compra en Glamour</p>
          <p style={{ fontSize: '2.2rem', fontWeight: 950, margin: 0 }}>$ {montoFormateado}</p>
          {metodo === 'alias' && <p style={{ fontSize: '0.9rem', color: K.accent, fontWeight: 700, marginTop: '5px' }}>¡Ahorrás ${new Intl.NumberFormat('es-AR').format(ahorro)}!</p>}
        </div>

        {/* Selector de Métodos */}
        <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {OPCIONES.map(op => (
            <button key={op.id} onClick={() => handleSelectMetodo(op.id)} style={{ 
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

        {/* Banner Informativo Original */}
        <div style={{ background: '#FFF0F1', padding: '1.1rem', borderRadius: 15, marginBottom: '1.5rem', display: 'flex', gap: '15px', alignItems: 'center', border: `1px solid ${K.border}` }}>
          <img src={OPCIONES.find(o => o.id === metodo)?.icon} style={{ width: 34, height: 34, objectFit: 'contain' }} alt="icon" />
          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#333', lineHeight: 1.4 }}>
             {metodo === 'alias' && 'TRANSFERENCIA: 20% OFF aplicado. Transferí y subí el comprobante.'}
             {metodo === 'qr' && 'QR MercadoPago: 10% OFF aplicado. Pagá con MercadoPago'}
             {metodo === 'tarjeta' && 'TARJETAS: Pagá en cuotas de forma segura vía Mercado Pago.'}
             {metodo === 'mp' && 'CUENTA MERCADO PAGO: Usá tu saldo o tarjetas guardadas.'}
             {metodo === 'payway' && 'TARJETA BANCARIA: Pagá con débito o crédito mediante Payway.'}
             {metodo === 'otros' && 'OTROS MÉTODOS: Payway y globales.'}
          </p>
        </div>

        {/* Paneles Dinámicos */}
        <div style={{ background: 'white', padding: '1.8rem', borderRadius: 24, border: `2px solid ${K.border}` }}>
          {metodo === 'alias' && (
            <TransferPanel total={total} vendedorEmail={VENDEDOR_EMAIL} onExito={() => setCompletado(true)} />
          )}
          
          {metodo === 'qr' && (tieneDatos ? 
             <QrPanel precio={Math.round(precioFinal)} vendedorEmail={VENDEDOR_EMAIL} onPagoConfirmado={() => setCompletado(true)} />
             : <DataPrompt onClick={()=>setShowModal(true)} />
          )}

          {(metodo === 'tarjeta' || metodo === 'mp') && (tieneDatos ? 
             <BrickPanel metodo={metodo} precio={precioFinal} vendedorEmail={VENDEDOR_EMAIL} onPagoAprobado={() => setCompletado(true)} />
             : <DataPrompt onClick={()=>setShowModal(true)} />
          )}

          {metodo === 'payway' && (tieneDatos ? 
             <PaywayPanel precio={precioFinal} onPagoExitoso={() => setCompletado(true)} />
             : <DataPrompt onClick={()=>setShowModal(true)} />
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
        </div>

        {/* Botón WhatsApp Original */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a href={`https://wa.me/5491167914366?text=Link Payway $${montoFormateado}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', background: '#FF0000', color: 'white', padding: '0.8rem 2rem', borderRadius: 50, textDecoration: 'none', fontWeight: 800, fontSize: '1rem', boxShadow: '0 10px 25px rgba(255,0,0,0.2)' }}>
            <img src="/ico-ui/payway-2.png" alt="Payway" style={{ height: '36px' }} />
            <span>Solicitar Link Payway</span>
            <img src="/icons/whats.png" alt="WhatsApp" style={{ height: '40px' }} />
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => window.location.href = '/'} style={{ background: 'none', border: 'none', color: '#999', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <ArrowLeft size={16} /> Volver a la tienda
          </button>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '2.5rem', border: `2px solid ${K.accent}`, position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'none', cursor: 'pointer', color: K.muted }}><X size={24}/></button>
            <h3 style={{ fontWeight: 950, textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.4rem', color: K.text }}>DATOS DE ENVÍO</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
              <input type="text" placeholder="Nombre Completo" id="mn" defaultValue={customerData.nombre} style={modalInputStyle} />
              <input type="tel" placeholder="WhatsApp (ej: 1123456789)" id="mw" defaultValue={customerData.whatsapp} style={modalInputStyle} />
              <input type="text" placeholder="Dirección / Punto de Entrega" id="md" defaultValue={customerData.entrega} style={modalInputStyle} />
            </div>
            <button onClick={() => {
              const n = (document.getElementById('mn') as HTMLInputElement).value;
              const w = (document.getElementById('mw') as HTMLInputElement).value;
              const d = (document.getElementById('md') as HTMLInputElement).value;
              if(n && w && d) { 
                setCustomerData({ nombre: n, whatsapp: w, entrega: d }); 
                setShowModal(false); 
              }
            }} style={{ width: '100%', padding: '1.2rem', borderRadius: 50, background: K.accent, color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer', marginTop: '1.5rem' }}>
              CONFIRMAR Y CONTINUAR →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DataPrompt({ onClick }: { onClick: () => void }) {
  return (
    <div style={{textAlign:'center', padding:'2rem'}}>
      <ShieldCheck size={40} color={K.border} style={{marginBottom:10}}/>
      <p style={{fontSize:'0.9rem', color:K.muted}}>Confirmá tus datos para habilitar la pasarela de pago.</p>
      <button onClick={onClick} style={{background:K.accent, color:'white', border:'none', padding:'0.8rem 1.5rem', borderRadius:50, fontWeight:800, cursor:'pointer', marginTop:10}}>CARGAR DATOS</button>
    </div>
  );
}

const modalInputStyle = { width: '100%', padding: '1rem', borderRadius: '12px', border: `1.5px solid ${K.border}`, background: K.bg, outline: 'none' };