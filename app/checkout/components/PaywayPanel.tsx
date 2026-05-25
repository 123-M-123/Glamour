'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { CreditCard, Lock, ShieldCheck, Loader2 } from 'lucide-react';

const K = { 
  bg: '#FFF8F8', 
  border: '#FFC9CB', 
  accent: '#FF0000', 
  text: '#1C1B19', 
  muted: '#9A9690' 
};

const SDK_URL = '/decidir-sdk.js';

export default function PaywayPanel({ precio, onPagoExitoso }: { precio: number, onPagoExitoso: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [cardNumberDisplay, setCardNumberDisplay] = useState('');
  const [expiryDisplay, setExpiryDisplay] = useState('');

  const customerData = useCartStore((state) => state.customerData);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY;
    console.log("🛠️ Public Key:", pk ? `${pk.substring(0,6)}...` : "❌ NO DETECTADA");

    const scriptId = 'decidir-js-sdk-local';

    const initSDK = () => {
      // @ts-ignore
      if (window.Decidir) {
        console.log("✅ SDK Payway listo");
        setSdkReady(true);
      } else {
        setError("Error interno del SDK. Recargá la página.");
      }
    };

    if (document.getElementById(scriptId)) {
      initSDK();
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_URL;
    script.id = scriptId;
    script.async = true;
    script.onload = initSDK;
    script.onerror = () => setError("Error cargando la pasarela de pago.");
    document.body.appendChild(script);
  }, []);

  // Helpers para sincronizar inputs visuales → inputs ocultos data-decidir
  const setHidden = (attr: string, value: string) => {
    const el = document.querySelector(`[data-decidir="${attr}"]`) as HTMLInputElement;
    if (el) el.value = value;
  };

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').substring(0, 16);
    setCardNumberDisplay(digits.replace(/(\d{4})(?=\d)/g, '$1 '));
    setHidden('card_number', digits);
  };

  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').substring(0, 4);
    setExpiryDisplay(digits.length >= 2 ? digits.substring(0, 2) + '/' + digits.substring(2) : digits);
    setHidden('card_expiration_month', digits.substring(0, 2));
    setHidden('card_expiration_year', digits.length === 4 ? `20${digits.substring(2)}` : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdkReady) { setError("La pasarela aún no está lista. Aguardá un segundo."); return; }

    setLoading(true);
    setError(null);

    try {
      const publicKey = process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY;
      if (!publicKey) throw new Error("API Key pública no configurada.");

      // ✅ Verificación antes de enviar
      const nombre = (document.querySelector('[data-decidir="card_holder_name"]') as HTMLInputElement)?.value;
      const numero = (document.querySelector('[data-decidir="card_number"]') as HTMLInputElement)?.value;
      console.log("🔍 Verificando campos data-decidir:", { nombre, numero: numero ? '****' + numero.slice(-4) : 'vacío' });

      const decidir = new (window as any).Decidir(
        'https://developers.decidir.com/api/v2',
        true
      );
      decidir.setPublishableKey(publicKey);

      console.log("🚀 Llamando createToken con data-decidir...");

      decidir.createToken(
        document.getElementById('payway-form'),
        async (status: number, response: any) => {
          console.log('📡 Decidir Status:', status, '| Response:', response);

          if (status !== 200 && status !== 201) {
            setLoading(false);
            const msg = response?.error?.[0]?.error?.message 
              || response?.error?.[0]?.description 
              || `Error en los datos bancarios. (Cod: ${status})`;
            setError(msg);
            return;
          }

          console.log("✅ Token obtenido:", response.id);

          const lastFour = (document.querySelector('[data-decidir="card_number"]') as HTMLInputElement)?.value?.slice(-4);

          const res = await fetch('/api/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              metodo: 'payway',
              monto: precio,
              customer: customerData,
              items,
              paymentDetail: { token: response.id, lastFour }
            })
          });

          if (res.ok) {
            onPagoExitoso();
          } else {
            const errData = await res.json();
            setLoading(false);
            setError(errData.error || 'La tarjeta fue rechazada.');
          }
        }
      );

    } catch (err: any) {
      console.error("🔥 Error:", err.message);
      setLoading(false);
      setError(err.message || 'Error al procesar el pago.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <img src="/ico-ui/payway-2.png" alt="Payway" style={{ height: 25 }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: K.text }}>Pago Bancario Seguro</span>
      </div>

      {/* 
        ✅ INPUTS OCULTOS con atributo data-decidir
        El SDK de Decidir busca inputs por data-decidir, NO por id
      */}
      <div id="payway-form" style={{ display: 'none' }}>
        <input data-decidir="card_number" type="text" readOnly />
        <input data-decidir="card_holder_name" type="text" readOnly />
        <input data-decidir="card_expiration_month" type="text" readOnly />
        <input data-decidir="card_expiration_year" type="text" readOnly />
        <input data-decidir="security_code" type="text" readOnly />
        <input data-decidir="card_holder_doc_type" type="text" defaultValue="dni" readOnly />
        <input data-decidir="card_holder_doc_number" type="text" readOnly />
      </div>

      {/* Formulario visual */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div style={{ position: 'relative' }}>
          <input
            required
            type="text"
            placeholder="Número de tarjeta"
            value={cardNumberDisplay}
            onChange={handleCardNumber}
            style={inputStyle}
          />
          <CreditCard size={18} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: K.muted }} />
        </div>

        <input
          required
          type="text"
          placeholder="Nombre en la tarjeta"
          onChange={(e) => {
            // Sin toUpperCase — Decidir valida el formato
            setHidden('card_holder_name', e.target.value);
          }}
          style={inputStyle}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            required
            type="text"
            placeholder="MM/AA"
            value={expiryDisplay}
            onChange={handleExpiry}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            required
            type="password"
            placeholder="CVV"
            maxLength={4}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              e.target.value = val;
              setHidden('security_code', val);
            }}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <input
          required
          type="text"
          placeholder="DNI del Titular"
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            e.target.value = val;
            setHidden('card_holder_doc_number', val);
          }}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: K.accent, fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', background: '#FFF0F1', padding: '10px', borderRadius: '10px', border: `1px solid ${K.border}` }}>
            ✕ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '1.2rem',
            borderRadius: 50,
            background: loading ? K.muted : K.accent,
            color: 'white',
            fontWeight: 900,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '1rem'
          }}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Lock size={18} />}
          {loading ? 'PROCESANDO...' : `PAGAR $${new Intl.NumberFormat('es-AR').format(precio)}`}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <ShieldCheck size={16} color="#22c55e" />
          <span style={{ fontSize: '0.7rem', color: K.muted, fontWeight: 600 }}>Protección Bancaria de 256 bits</span>
        </div>

      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem',
  borderRadius: '12px',
  border: '1.5px solid #FFC9CB',
  background: '#FFF8F8',
  outline: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#1C1B19',
  boxSizing: 'border-box'
};