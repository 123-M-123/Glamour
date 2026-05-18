'use client';
import { useEffect, useState } from 'react';

export default function QrPanel({ precio, vendedorEmail, onPagoConfirmado, onBeforeSubmit }: any) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [datosConfirmados, setDatosConfirmados] = useState(false);

  useEffect(() => {
    // 🚀 INTERCEPCIÓN: Pedimos datos antes de generar el QR
    if (!datosConfirmados) {
      onBeforeSubmit(() => {
        setDatosConfirmados(true);
      });
      return;
    }

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
      } catch (e) { console.error(e); }
    };
    generar();
  }, [precio, vendedorEmail, datosConfirmados]);

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

  if (!datosConfirmados) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontWeight: 700, color: '#666' }}>Cargando datos de seguridad...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
      <p style={{ fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ESCANEA CON TU APP</p>
      {qrUrl ? (
        <div style={{ background: 'white', padding: '10px', borderRadius: '20px', border: '1px solid #eee', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'inline-block' }}>
          <img src={qrUrl} alt="QR" style={{ width: '100%', maxWidth: 280, display: 'block' }} />
        </div>
      ) : (
        <div style={{ padding: '40px' }}>Generando QR seguro...</div>
      )}
      <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '1.5rem' }}>El revisor automático detectará tu pago al instante.</p>
    </div>
  );
}