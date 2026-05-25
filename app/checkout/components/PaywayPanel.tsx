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

// ✅ URL local para evitar errores de DNS
const SDK_URL = '/decidir-sdk.js';

// ✅ Endpoint correcto para Sandbox
const DECIDIR_URL_SANDBOX = 'https://developers.decidir.com/api/v2';

export default function PaywayPanel({ precio, onPagoExitoso }: { precio: number, onPagoExitoso: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  
  const customerData = useCartStore((state) => state.customerData);
  const items = useCartStore((state) => state.items);

  const [formData, setFormData] = useState({
    cardNumber: '', 
    cardName: '', 
    expiry: '', 
    cvv: '', 
    dni: ''
  });

  useEffect(() => {
    const scriptId = 'decidir-js-sdk-local';

    const initSDK = () => {
      // @ts-ignore
      if (window.Decidir) {
        console.log("✅ SDK Payway cargado desde /public");
        setSdkReady(true);
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
    script.onerror = () => {
      console.error("❌ Error cargando /public/decidir-sdk.js");
      setError("Error interno: No se encontró el archivo de la pasarela.");
    };
    document.body.appendChild(script);
  }, []);

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
    
    if (!sdkReady) {
      setError("La pasarela se está iniciando. Reintentá en un segundo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parts = formData.expiry.split('/');
      if (parts.length !== 2) throw new Error("Fecha MM/AA requerida");

      // ✅ Instanciación correcta para Sandbox
      // @ts-ignore
      const decidir = new window.Decidir(DECIDIR_URL_SANDBOX);
      decidir.setPublishableKey(process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY);
      
      const cardData = {
        card_number: formData.cardNumber.replace(/\s/g, ''),
        card_holder_name: formData.cardName,
        card_expiration_month: parts[0],
        card_expiration_year: parts[1].length === 2 ? `20${parts[1]}` : parts[1],
        security_code: formData.cvv,
        card_holder_doc_type: 'dni',
        card_holder_doc_number: formData.dni
      };

      console.log("🚀 Iniciando tokenización Payway...");

      decidir.createToken(cardData, async (status: number, response: any) => {
        if (status !== 200 && status !== 201) {
          console.error("❌ Error SDK:", response);
          setLoading(false);
          setError(response.error?.[0]?.description || 'Datos de tarjeta inválidos.');
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
            paymentDetail: { 
              token: response.id, 
              lastFour: formData.cardNumber.slice(-4) 
            }
          })
        });

        if (res.ok) {
          onPagoExitoso();
        } else {
          const errData = await res.json();
          setLoading(false);
          setError(errData.error || 'Pago rechazado por el banco.');
        }
      });

    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error al validar el formulario.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <img src="/ico-ui/payway-2.png" alt="Payway" style={{ height: 25 }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: K.text }}>Pago Bancario Seguro</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        <div style={{ position: 'relative' }}>
          <input 
            required 
            id="cc-number"
            name="cc-number"
            type="text" 
            autoComplete="cc-number"
            placeholder="Número de tarjeta" 
            value={formData.cardNumber} 
            onChange={handleCardNumber} 
            style={inputStyle} 
          />
          <CreditCard size={18} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: K.muted }} />
        </div>

        <input 
          required 
          id="cc-name"
          name="cc-name"
          type="text" 
          autoComplete="cc-name"
          placeholder="Nombre en la tarjeta" 
          value={formData.cardName} 
          onChange={(e) => setFormData({ ...formData, cardName: e.target.value.toUpperCase() })} 
          style={inputStyle} 
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            required 
            id="cc-exp"
            name="cc-exp"
            type="text" 
            autoComplete="cc-exp"
            placeholder="MM/AA" 
            value={formData.expiry} 
            onChange={handleExpiry} 
            style={{ ...inputStyle, flex: 1 }} 
          />
          <input 
            required 
            id="cc-csc"
            name="cc-csc"
            type="password" 
            autoComplete="cc-csc"
            placeholder="CVV" 
            maxLength={4} 
            value={formData.cvv} 
            onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })} 
            style={{ ...inputStyle, flex: 1 }} 
          />
        </div>

        <input 
          required 
          id="billing-dni"
          name="billing-dni"
          type="text" 
          placeholder="DNI del Titular" 
          value={formData.dni} 
          onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })} 
          style={inputStyle} 
        />

        {error && (
          <p style={{ color: K.accent, fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', background: '#FFF0F1', padding: '10px', borderRadius: '10px' }}>
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

const inputStyle = { 
  width: '100%', 
  padding: '1rem', 
  borderRadius: '12px', 
  border: `1.5px solid ${K.border}`, 
  background: K.bg, 
  outline: 'none', 
  fontSize: '0.95rem', 
  fontWeight: 600, 
  color: K.text 
};