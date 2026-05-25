'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { CreditCard, Lock, ShieldCheck, Loader2 } from 'lucide-react';

const K = { 
  bg: '#FFF8F8', 
  border: '#FFC9CB', 
  accent: '#FF0000', 
  text: '#1C1B19', 
  muted: '#9A9690' 
};

// ✅ SDK alojado localmente en /public/decidir-sdk.js
const SDK_URL = '/decidir-sdk.js';

export default function PaywayPanel({ precio, onPagoExitoso }: { precio: number, onPagoExitoso: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  
  const customerData = useCartStore((state) => state.customerData);
  const items = useCartStore((state) => state.items);

  // Estado para la UI visual
  const [cardNumberDisplay, setCardNumberDisplay] = useState('');
  const [expiryDisplay, setExpiryDisplay] = useState('');

  useEffect(() => {
    // 🛠️ Diagnóstico de Public Key
    const pk = process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY;
    console.log("🛠️ Diagnóstico Payway - Public Key:", pk ? `${pk.substring(0,6)}...` : "❌ NO DETECTADA");

    const scriptId = 'decidir-js-sdk-local';
    
    const initSDK = () => {
      // @ts-ignore
      if (window.Decidir) {
        console.log("✅ SDK Payway listo en el DOM");
        setSdkReady(true);
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.id = scriptId;
      script.async = true;
      script.onload = initSDK;
      script.onerror = () => setError("Error de red cargando el archivo de la pasarela.");
      document.body.appendChild(script);
    } else {
      initSDK();
    }
  }, []);

  // Sincronización manual con el DOM que el SDK espera
  const syncToHidden = (id: string, value: string) => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el) el.value = value;
  };

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumberDisplay(formatted);
    syncToHidden('card_number', digits);
  };

  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').substring(0, 4);
    const formatted = digits.length >= 2 ? digits.substring(0, 2) + '/' + digits.substring(2) : digits;
    setExpiryDisplay(formatted);
    
    const mes = digits.substring(0, 2);
    const año = digits.length === 4 ? `20${digits.substring(2)}` : '';
    syncToHidden('card_expiration_month', mes);
    syncToHidden('card_expiration_year', año);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pk = process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY;
    if (!sdkReady || !pk) { 
      setError("La pasarela no está lista o falta la Public Key en Vercel."); 
      return; 
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ INSTANCIACIÓN COMO CLASE (Requerido por el SDK)
      // @ts-ignore
      const decidir = new window.Decidir(
        'https://developers.decidir.com/api/v2',
        true // true = entorno de sandbox
      );

      decidir.setPublishableKey(pk);

      console.log("🚀 Solicitando token leyendo IDs del DOM...");

      // ✅ PASAMOS EL CONTENEDOR QUE TIENE LOS IDS (el div oculto)
      // @ts-ignore
      decidir.createToken(document.getElementById('payway-form-container'), async (status: number, response: any) => {
        console.log('📡 Decidir Status:', status, '| Response:', response);

        if (status !== 200 && status !== 201) {
          setLoading(false);
          const msg = response?.error?.[0]?.description || `Error bancario (Cod: ${status})`;
          setError(msg);
          return;
        }

        console.log("✅ Token obtenido con éxito");

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
              lastFour: (document.getElementById('card_number') as HTMLInputElement)?.value?.slice(-4)
            }
          })
        });

        const data = await res.json();

        if (res.ok) {
          onPagoExitoso();
        } else {
          setLoading(false);
          setError(data.error || 'La tarjeta fue rechazada.');
        }
      });

    } catch (err: any) {
      setLoading(false);
      setError('Error al procesar el pago.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* 
        🛡️ INPUTS OCULTOS (INDISPENSABLES)
        El SDK de Decidir busca estos IDs exactos con querySelectorAll
      */}
      <div id="payway-form-container" style={{ display: 'none' }} aria-hidden="true">
        <input id="card_number" type="text" />
        <input id="card_holder_name" type="text" />
        <input id="card_expiration_month" type="text" />
        <input id="card_expiration_year" type="text" />
        <input id="security_code" type="text" />
        <input id="card_holder_doc_type" type="text" defaultValue="dni" />
        <input id="card_holder_doc_number" type="text" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <img src="/ico-ui/payway-2.png" alt="Payway" style={{ height: 25 }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: K.text }}>Pago Bancario Seguro</span>
      </div>

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
            const val = e.target.value.toUpperCase();
            e.target.value = val;
            syncToHidden('card_holder_name', val);
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
            onChange={(e) => syncToHidden('security_code', e.target.value.replace(/\D/g, ''))}
            style={{ ...inputStyle, flex: 1 }} 
          />
        </div>

        <input 
          required 
          type="text" 
          placeholder="DNI del Titular" 
          onChange={(e) => syncToHidden('card_holder_doc_number', e.target.value.replace(/\D/g, ''))}
          style={inputStyle} 
        />

        {error && (
          <p style={{ color: K.accent, fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', background: '#FFF0F1', padding: '10px', borderRadius: '10px', border: `1px solid ${K.border}` }}>
            ✕ {error}
          </p>
        )}

        <button 
          type="submit" 
          disabled={loading || !sdkReady}
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