'use client';
import { useState, useRef } from 'react';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';

const ALIAS = 'glamour.urquiza';
const CVU   = '0000003100000550350075';
const ALIAS_CBU = 'villegasgladys';
const CBU   = '0170339740000064116107';

const K = {
  accent: '#FF0000',
  border: '#FFC9CB',
  bgInput: '#FFF8F8',
  grayBtn: '#F1F5F9', // Gris tipo Windows/Moderno
  textMuted: '#64748b'
};

export default function TransferPanel({ total, vendedorEmail, onExito }: { total: number, vendedorEmail: string, onExito: () => void }) {
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Estados para datos del cliente
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [entrega, setEntrega] = useState('');

  // Referencia para el input oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEnviar = async () => {
    if (!nombre || !whatsapp || !entrega) {
      setError('Por favor, completá tus datos de entrega.');
      return;
    }
    if (!comprobante) {
      setError('Por favor, subí el comprobante de pago.');
      return;
    }

    setEnviando(true);
    setError('');

    const fd = new FormData();
    fd.append('archivo', comprobante);
    fd.append('titulo', 'Pedido Glamour');
    fd.append('precio', String(total));
    fd.append('vendedorEmail', vendedorEmail);
    fd.append('clienteNombre', nombre);
    fd.append('clienteWhatsapp', whatsapp);
    fd.append('puntoEntrega', entrega);

    try {
      const res = await fetch('/api/upload-comprobante', { method: 'POST', body: fd });
      if (res.ok) onExito();
      else {
        const d = await res.json();
        setError(d.error || 'Error al procesar el pedido.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.85rem',
    borderRadius: '12px',
    border: `1.5px solid ${K.border}`,
    outline: 'none',
    background: K.bgInput,
    fontSize: '0.9rem',
    transition: '0.2s'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      
      {/* Datos Bancarios */}
      <div style={{ padding: '1.2rem', border: `1px solid ${K.border}`, borderRadius: 18, background: 'white' }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#999', textTransform: 'uppercase' }}>MP ALIAS:</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, display: 'block', color: '#000' }}>{ALIAS}</span>
          <span style={{ fontSize: '0.75rem', color: '#999' }}>{CVU}</span>
        </div>
        <div style={{ borderTop: `1px solid #f5f5f5`, paddingTop: '10px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#999', textTransform: 'uppercase' }}>BBVA ALIAS:</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'block', color: '#000' }}>{ALIAS_CBU}</span>
          <span style={{ fontSize: '0.75rem', color: '#999' }}>{CBU}</span>
        </div>
      </div>

      {/* 1. Datos de Entrega */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 900, color: K.accent, letterSpacing: '0.5px' }}>1. DATOS DE ENTREGA:</p>
        <input 
          type="text" 
          placeholder="Nombre Completo" 
          value={nombre} 
          onChange={(e)=>setNombre(e.target.value)} 
          style={inputStyle} 
        />
        <input 
          type="tel" 
          placeholder="WhatsApp (con código de área)" 
          value={whatsapp} 
          onChange={(e)=>setWhatsapp(e.target.value)} 
          style={inputStyle} 
        />
        <input 
          type="text" 
          placeholder="Dirección o Punto de Entrega" 
          value={entrega} 
          onChange={(e)=>setEntrega(e.target.value)} 
          style={inputStyle} 
        />
      </div>
      
      {/* 2. Subida de Comprobante (Botón Estilizado) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 900, color: K.accent, letterSpacing: '0.5px' }}>2. COMPROBANTE DE PAGO:</p>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={(e) => setComprobante(e.target.files?.[0] || null)} 
          style={{ display: 'none' }} 
          accept="image/*,.pdf"
        />

        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '1.5rem',
            borderRadius: '15px',
            border: `2px dashed ${comprobante ? '#25D366' : '#cbd5e1'}`,
            background: comprobante ? '#F0FDF4' : K.grayBtn,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            transition: '0.3s'
          }}
        >
          {comprobante ? (
            <>
              <FileCheck size={28} color="#25D366" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>{comprobante.name}</span>
              <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>Click para cambiar archivo</span>
            </>
          ) : (
            <>
              <Upload size={28} color={K.textMuted} />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#475569' }}>Seleccionar Comprobante</span>
              <span style={{ fontSize: '0.7rem', color: K.textMuted }}>Captura de pantalla o PDF</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', padding: '0.8rem', borderRadius: 12, border: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} color="#B91C1C" />
          <p style={{ color: '#B91C1C', fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>{error}</p>
        </div>
      )}

      <button 
        onClick={handleEnviar} 
        disabled={enviando}
        style={{ 
          width: '100%', padding: '1.2rem', borderRadius: 50, 
          background: enviando ? '#e2e8f0' : K.accent, 
          color: enviando ? '#94a3b8' : 'white', 
          fontWeight: 900, border: 'none', cursor: 'pointer',
          fontSize: '1rem',
          boxShadow: enviando ? 'none' : '0 10px 20px rgba(255,0,0,0.15)',
          marginTop: '0.5rem'
        }}
      >
        {enviando ? 'ENVIANDO PEDIDO...' : 'CONFIRMAR PEDIDO →'}
      </button>
      
      <p style={{ fontSize: '0.65rem', color: '#999', textAlign: 'center' }}>
        Tus datos se procesan de forma segura por Tienda de Tiendas.
      </p>
    </div>
  );
}