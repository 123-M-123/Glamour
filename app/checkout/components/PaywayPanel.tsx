'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { CreditCard, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import Script from 'next/script';

const K = { bg: '#FFF8F8', border: '#FFC9CB', accent: '#FF0000', text: '#1C1B19', muted: '#9A9690' };

export default function PaywayPanel({ precio, onPagoExitoso }: { precio: number, onPagoExitoso: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const customerData = useCartStore((state) => state.customerData);
  const items = useCartStore((state) => state.items);

  const [formData, setFormData] = useState({
    cardNumber: '', cardName: '', expiry: '', cvv: '', dni: '', email: 'cliente@tienda.com'
  });

  const handleCardNumber = (e: any) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData({ ...formData, cardNumber: v });
  };

  const handleExpiry = (e: any) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
    setFormData({ ...formData, expiry: v });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdkReady) return;
    setLoading(true);
    setError(null);

    try {
      const [month, year] = formData.expiry.split('/');
      const cardData = {
        card_number: formData.cardNumber.replace(/\s/g, ''),
        card_holder_name: formData.cardName,
        card_expiration_month: month,
        card_expiration_year: year,
        security_code: formData.cvv,
        card_holder_doc_type: 'dni',
        card_holder_doc_number: formData.dni
      };

      // @ts-ignore (Decidir SDK)
      window.Decidir.setPublishableKey(process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY);
      // @ts-ignore
      window.Decidir.createToken(cardData, async (status: number, response: any) => {
        if (status !== 200 && status !== 201) {
          setLoading(false);
          setError('Datos de tarjeta inválidos. Verifique y reintente.');
          return;
        }

        const res = await fetch('/api/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metodo: 'payway',
            monto: precio,
            customer: customerData,
            items: items,
            paymentDetail: { token: response.id, lastFour: formData.cardNumber.slice(-4) }
          })
        });

        if (res.ok) onPagoExitoso();
        else {
          setLoading(false);
          setError('El banco rechazó la transacción.');
        }
      });
    } catch (err) {
      setLoading(false);
      setError('Error de conexión con la pasarela.');
    }
  };

  return (
    <>
      <Script 
        src="https://libs.decidir.com/sdk/v2/index.js" 
        onLoad={() => setSdkReady(true)} 
      />
      
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', justifyContent: 'center' }}>
          <img src="/ico-ui/payway-2.png" alt="Payway" style={{ height: 25 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: K.text }}>Pago Bancario Seguro</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input required type="text" placeholder="Número de tarjeta" value={formData.cardNumber} onChange={handleCardNumber} style={inputStyle} />
          <input required type="text" placeholder="Nombre en la tarjeta" value={formData.cardName} onChange={(e) => setFormData({ ...formData, cardName: e.target.value.toUpperCase() })} style={inputStyle} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input required type="text" placeholder="MM/AA" value={formData.expiry} onChange={handleExpiry} style={{ ...inputStyle, flex: 1 }} />
            <input required type="password" placeholder="CVV" maxLength={4} value={formData.cvv} onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <input required type="text" placeholder="DNI del Titular" value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })} style={inputStyle} />

          {error && <p style={{ color: K.accent, fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>✕ {error}</p>}

          <button disabled={loading || !sdkReady} type="submit" style={{ width: '100%', padding: '1.2rem', borderRadius: 50, background: loading ? K.muted : K.accent, color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {loading ? <Loader2 className="animate-spin" /> : <Lock size={18} />}
            {loading ? 'PROCESANDO...' : `PAGAR $${new Intl.NumberFormat('es-AR').format(precio)}`}
          </button>
        </form>
      </div>
    </>
  );
}

const inputStyle = { width: '100%', padding: '1rem', borderRadius: '12px', border: `1.5px solid ${K.border}`, background: K.bg, outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: K.text };