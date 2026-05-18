'use client';
import { useEffect, useState } from 'react';

export default function QrPanel({ precio, vendedorEmail, onPagoConfirmado }: any) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const generar = async () => {
      try {
        const res = await fetch('/api/create-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo: 'Pedido Glamour', precio, vendedorEmail })
        });
        const data = await res.json();
        if (data.qr) {
          setQrUrl(data.qr);
          setOrderId(data.orderId);
        }
      } catch (e) { console.error("Error QR:", e); }
    };
    generar();
  }, [precio, vendedorEmail]);

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
      } catch (e) { console.error("Error check pago:", e); }
    }, 5000);
    return () => clearInterval(interval);
  }, [qrUrl, orderId, onPagoConfirmado]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
      <p style={{ fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase' }}>ESCANEA CON TU APP</p>
      {qrUrl ? (
        <div style={{ background: 'white', padding: '10px', borderRadius: '20px', border: '1px solid #eee' }}>
          <img src={qrUrl} alt="QR" style={{ width: '100%', maxWidth: 280, display: 'block' }} />
        </div>
      ) : (
        <div style={{ padding: '40px', color: '#999' }}>Generando QR seguro...</div>
      )}
      <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '1.5rem' }}>El revisor automático detectará tu pago al instante.</p>
    </div>
  );
}