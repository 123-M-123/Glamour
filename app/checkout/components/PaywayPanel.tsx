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
    const pk = process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY;
    console.log("🛠️ Diagnóstico Payway - Public Key:", pk ? `${pk.substring(0,6)}...` : "❌ NO DETECTADA");

    const scriptId = 'decidir-js-sdk-local';
    
    const initSDK = () => {
      // @ts-ignore
      if (window.Decidir) {
        console.log("✅ SDK Payway listo en window.Decidir");
        setSdkReady(true);
      } else {
        console.error("❌ window.Decidir no encontrado tras cargar script");
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
    script.onerror = () => setError("Error de red cargando el archivo de la pasarela.");
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
      setError("La pasarela aún no está lista. Aguardá un segundo."); 
      return; 
    }

    setLoading(true);
    setError(null);

    try {
      const parts = formData.expiry.split('/');
      if (parts.length !== 2) throw new Error("Fecha MM/AA requerida");

      const publicKey = process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY;
      if (!publicKey) throw new Error("API Key pública no configurada.");

      // ✅ FIX: usar "new" para instanciar la clase correctamente
      const decidir = new (window as any).Decidir(
        'https://developers.decidir.com/api/v2',
        true // true = sandbox
      );

      decidir.setPublishableKey(publicKey);

      const cardData = {
        card_number: formData.cardNumber.replace(/\s/g, ''),
        card_holder_name: formData.cardName,
        card_expiration_month: parts[0],
        card_expiration_year: `20${parts[1].slice(-2)}`,
        security_code: formData.cvv,
        card_holder_doc_type: 'dni',
        card_holder_doc_number: formData.dni,
      };

      console.log("🚀 Solicitando token con datos:", { ...cardData, card_number: '****' });

      decidir.createToken(cardData, async (status: number, response: any) => {
        console.log('📡 Decidir Status:', status, '| Response:', response);

        if (status !== 200 && status !== 201) {
          setLoading(false);
          const msg = response?.error?.[0]?.description || `Error en los datos bancarios. (Cod: ${status})`;
          setError(msg);
          return;
        }

        console.log("✅ Token obtenido:", response.id);

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
              lastFour: formData.cardNumber.replace(/\s/g, '').slice(-4)
            }
          })
        });

        if (res.ok) {
          onPagoExitoso();
        } else {
          const errData = await res.json();
          setLoading(false);
          setError(errData.error || 'La tarjeta fue rechazada.');
        }
      });

    } catch (err: any) {
      console.error("🔥 Error en handleSubmit:", err.message);
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
            id="user_card_number"
            type="text" 
            placeholder="Número de tarjeta" 
            value={formData.cardNumber} 
            onChange={handleCardNumber} 
            style={inputStyle} 
          />
          <CreditCard size={18} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: K.muted }} />
        </div>

        <input 
          required 
          id="user_card_name"
          type="text" 
          placeholder="Nombre en la tarjeta" 
          value={formData.cardName} 
          onChange={(e) => setFormData({ ...formData, cardName: e.target.value.toUpperCase() })} 
          style={inputStyle} 
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            required 
            id="user_card_expiry"
            type="text" 
            placeholder="MM/AA" 
            value={formData.expiry} 
            onChange={handleExpiry} 
            style={{ ...inputStyle, flex: 1 }} 
          />
          <input 
            required 
            id="user_card_cvv"
            type="password" 
            placeholder="CVV" 
            maxLength={4} 
            value={formData.cvv} 
            onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })} 
            style={{ ...inputStyle, flex: 1 }} 
          />
        </div>

        <input 
          required 
          id="user_card_dni"
          type="text" 
          placeholder="DNI del Titular" 
          value={formData.dni} 
          onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })} 
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

const inputStyle = { 
  width: '100%', 
  padding: '1rem', 
  borderRadius: '12px', 
  border: `1.5px solid #FFC9CB`, 
  background: '#FFF8F8', 
  outline: 'none', 
  fontSize: '0.95rem', 
  fontWeight: 600, 
  color: '#1C1B19'
};