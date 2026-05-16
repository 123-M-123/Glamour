'use client';
import { useEffect, useState } from 'react';

// 👈 Prop vendedorEmail agregada a la interfaz
export default function QrPanel({ precio, vendedorEmail, onPagoConfirmado }: { precio: number, vendedorEmail: string, onPagoConfirmado: () => void }) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const generar = async () => {
      try {
        const res = await fetch('/api/create-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // 👈 Enviamos el vendedorEmail a la API para que lo guarde en el pedido
          body: JSON.stringify({ titulo: 'Pedido Glamour', precio, vendedorEmail })
        });
        const data = await res.json();
        if (data.qr) {
          setQrUrl(data.qr);
          setOrderId(data.orderId);
        }
      } catch (e) { console.error(e); }
    };
    generar();
  }, [precio, vendedorEmail]); // 👈 Dependencia agregada

  useEffect(() => {
    if (!qrUrl || !orderId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?id=${orderId}`);
        const data = await res.json();
        if (data.paid) {
          onPagoConfirmado();
          clearInterval(interval);
        }
      } catch (e) { console.error(e); }
    }, 5000);
    return () => clearInterval(interval);
  }, [qrUrl, orderId, onPagoConfirmado]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center', 
      textAlign: 'center',
      width: '100%' 
    }}>
      <p style={{ fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        ESCANEA CON TU APP
      </p>
      
      {qrUrl ? (
        <div style={{ 
          background: 'white', 
          padding: '10px', 
          borderRadius: '20px', 
          border: '1px solid #eee',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          display: 'inline-block' 
        }}>
          <img 
            src={qrUrl} 
            alt="QR" 
            style={{ width: '100%', maxWidth: 280, display: 'block' }} 
          />
        </div>
      ) : (
        <div style={{ padding: '40px' }}>Generando QR seguro...</div>
      )}
      
      <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '1.5rem' }}>
        El revisor automático detectará tu pago al instante.
      </p>
    </div>
  );
}