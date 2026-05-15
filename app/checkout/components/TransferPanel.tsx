'use client';
import { useState } from 'react';

const ALIAS = 'glamour.urquiza';
const CVU   = '0000003100000550350075';
const ALIAS_CBU = 'villegasgladys';
const CBU   = '0170339740000064116107';

export default function TransferPanel({ total, onExito }: { total: number, onExito: () => void }) {
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const handleEnviar = async () => {
    if (!comprobante) return;
    setEnviando(true);
    const fd = new FormData();
    fd.append('archivo', comprobante);
    fd.append('titulo', 'Pedido Glamour');
    fd.append('precio', String(total));

    try {
      const res = await fetch('/api/upload-comprobante', { method: 'POST', body: fd });
      if (res.ok) onExito();
      else setError('Error al subir comprobante.');
    } catch {
      setError('Error de conexión.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#999' }}>MP ALIAS:</span>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'block' }}>{ALIAS}</span>
        <span style={{ fontSize: '0.75rem', color: '#999' }}>{CVU}</span>
      </div>
      <div>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#999' }}>BBVA ALIAS:</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block' }}>{ALIAS_CBU}</span>
        <span style={{ fontSize: '0.75rem', color: '#999' }}>{CBU}</span>
      </div>
      
      <div style={{ background: '#f8f8f8', padding: '1rem', borderRadius: 10 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>Subí tu comprobante aquí:</p>
        <input type="file" onChange={(e) => setComprobante(e.target.files?.[0] || null)} style={{ width: '100%' }} />
      </div>

      {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}

      <button 
        onClick={handleEnviar} 
        disabled={!comprobante || enviando}
        style={{ 
          width: '100%', padding: '1rem', borderRadius: 50, 
          background: !comprobante || enviando ? '#ccc' : '#FF0000', 
          color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer' 
        }}
      >
        {enviando ? 'SUBIENDO...' : 'CONFIRMAR PEDIDO →'}
      </button>
    </div>
  );
}