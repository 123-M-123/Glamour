'use client';
import { useState } from 'react';

const ALIAS = 'glamour.urquiza';
const CVU   = '0000003100000550350075';
const ALIAS_CBU = 'villegasgladys';
const CBU   = '0170339740000064116107';

const K = {
  accent: '#FF0000',
  border: '#FFC9CB',
  bgInput: '#FFF8F8'
};

export default function TransferPanel({ total, vendedorEmail, onExito }: { total: number, vendedorEmail: string, onExito: () => void }) {
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // 📝 Nuevos campos de datos del cliente
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [entrega, setEntrega] = useState('');

  const handleEnviar = async () => {
    // Validación estricta
    if (!nombre || !whatsapp || !entrega) {
      setError('Por favor, completá tus datos de contacto y entrega.');
      return;
    }
    if (!comprobante) {
      setError('Por favor, subí el comprobante de transferencia.');
      return;
    }

    setEnviando(true);
    setError('');

    const fd = new FormData();
    fd.append('archivo', comprobante);
    fd.append('titulo', 'Pedido Glamour');
    fd.append('precio', String(total));
    fd.append('vendedorEmail', vendedorEmail);
    
    // 🚀 Enviamos los nuevos datos a la API
    fd.append('clienteNombre', nombre);
    fd.append('clienteWhatsapp', whatsapp);
    fd.append('puntoEntrega', entrega);

    try {
      const res = await fetch('/api/upload-comprobante', { method: 'POST', body: fd });
      if (res.ok) {
        onExito();
      } else {
        setError('Error al procesar el pedido. Intentalo de nuevo.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '12px',
    border: `1.5px solid ${K.border}`,
    background: K.bgInput,
    fontSize: '0.9rem',
    outline: 'none',
    marginBottom: '0.8rem'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Datos Bancarios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', border: `1px solid ${K.border}`, borderRadius: '15px' }}>
        <div>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#999', textTransform: 'uppercase' }}>MP ALIAS:</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, display: 'block', color: '#000' }}>{ALIAS}</span>
          <span style={{ fontSize: '0.75rem', color: '#999' }}>{CVU}</span>
        </div>
        <div style={{ borderTop: `1px solid ${K.border}`, paddingTop: '0.8rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#999', textTransform: 'uppercase' }}>BBVA ALIAS:</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, display: 'block', color: '#000' }}>{ALIAS_CBU}</span>
          <span style={{ fontSize: '0.75rem', color: '#999' }}>{CBU}</span>
        </div>
      </div>

      {/* Formulario de Datos del Cliente */}
      <div style={{ marginTop: '0.5rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: K.accent, marginBottom: '10px', textTransform: 'uppercase' }}>1. Tus Datos de Entrega:</p>
        <input 
          type="text" 
          placeholder="Nombre Completo" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          style={inputStyle}
        />
        <input 
          type="tel" 
          placeholder="WhatsApp (ej: 1123456789)" 
          value={whatsapp} 
          onChange={(e) => setWhatsapp(e.target.value)} 
          style={inputStyle}
        />
        <input 
          type="text" 
          placeholder="Punto de Entrega / Dirección" 
          value={entrega} 
          onChange={(e) => setEntrega(e.target.value)} 
          style={inputStyle}
        />
      </div>
      
      {/* Subida de Comprobante */}
      <div style={{ background: '#fcfcfc', padding: '1.2rem', borderRadius: 15, border: `1.5px dashed ${K.border}` }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '10px', textAlign: 'center' }}>2. Subí la captura del comprobante:</p>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setComprobante(e.target.files?.[0] || null)} 
          style={{ width: '100%', fontSize: '0.8rem' }} 
        />
      </div>

      {error && (
        <div style={{ background: '#FFF0F1', padding: '0.7rem', borderRadius: '10px', border: '1px solid #FF0000' }}>
          <p style={{ color: '#FF0000', fontSize: '0.75rem', fontWeight: 700, margin: 0, textAlign: 'center' }}>{error}</p>
        </div>
      )}

      <button 
        onClick={handleEnviar} 
        disabled={enviando}
        style={{ 
          width: '100%', padding: '1.1rem', borderRadius: 50, 
          background: enviando ? '#ccc' : K.accent, 
          color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer',
          fontSize: '1rem',
          boxShadow: '0 4px 15px rgba(255,0,0,0.2)',
          marginTop: '0.5rem'
        }}
      >
        {enviando ? 'PROCESANDO...' : 'CONFIRMAR PEDIDO →'}
      </button>

      <p style={{ fontSize: '0.65rem', color: '#999', textAlign: 'center', marginTop: '5px' }}>
        Al confirmar, enviaremos los detalles a la administración de Glamour.
      </p>
    </div>
  );
}