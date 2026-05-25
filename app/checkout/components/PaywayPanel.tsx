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

// ✅ URL local para evitar errores de DNS
const SDK_URL = '/decidir-sdk.js';

// ✅ URL correcta para sandbox de Decidir
const DECIDIR_URL_SANDBOX = 'https://developers.decidir.com/api/v2';

export default function PaywayPanel({ precio, onPagoExitoso }: { precio: number, onPagoExitoso: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  
  // Referencia al formulario oculto para el SDK
  const hiddenFormRef = useRef<HTMLFormElement>(null);
  
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
    if (document.getElementById(scriptId)) {
        setSdkReady(true);
        return;
    }

    const script = document.createElement('script');
    script.src = SDK_URL;
    script.id = scriptId;
    script.async = true;
    script.onload = () => {
      console.log("✅ SDK Payway cargado correctamente");
      setSdkReady(true);
    };
    script.onerror = () => setError("Error cargando pasarela.");
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
    if (!sdkReady) return;

    setLoading(true);
    setError(null);

    try {
      const parts = formData.expiry.split('/');
      
      // ✅ Instanciamos el SDK
      // @ts-ignore
      const decidir = new window.Decidir(DECIDIR_URL_SANDBOX);
      decidir.setPublishableKey(process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY);

      // ✅ Usamos el formulario oculto para evitar el error "querySelectorAll"
      // El SDK leerá los campos por los atributos data-decidir
      // @ts-ignore
      decidir.createToken(hiddenFormRef.current, async (status: number, response: any) => {
        if (status !== 200 && status !== 201) {
          console.error("❌ Error SDK:", response);
          setLoading(false);
          setError(response.error?.[0]?.description || 'Datos de tarjeta inválidos.');
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
              lastFour: formData.cardNumber.slice(-4) 
            }
          })
        });

        if (res.ok) {
          onPagoExitoso();
        } else {
          const errData = await res.json();
          setLoading(false);
          setError(errData.error || 'Pago rechazado.');
        }
      });

    } catch (err: any) {
      setLoading(false);
      setError("Error al procesar el formulario.");
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* 🛡️ FORMULARIO OCULTO (Para que el SDK no crashee) */}
      <form ref={hiddenFormRef} style={{ display: 'none' }}>
        <input data-decidir="card_number" defaultValue={formData.cardNumber.replace(/\s/g, '')} />
        <input data-decidir="card_holder_name" defaultValue={formData.cardName} />
        <input data-decidir="card_expiration_month" defaultValue={formData.expiry.split('/')[0]} />
        <input data-decidir="card_expiration_year" defaultValue={formData.expiry.split('/')[1]} />
        <input data-decidir="security_code" defaultValue={formData.cvv} />
        <input data-decidir="card_holder_doc_type" defaultValue="dni" />
        <input data-decidir="card_holder_doc_number" defaultValue={formData.dni} />
      </form>

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
            value={formData.cardNumber} 
            onChange={handleCardNumber} 
            style={inputStyle} 
          />
          <CreditCard size={18} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: K.muted }} />
        </div>

        <input 
          required 
          type="text" 
          placeholder="Nombre en la tarjeta" 
          value={formData.cardName} 
          onChange={(e) => setFormData({ ...formData, cardName: e.target.value.toUpperCase() })} 
          style={inputStyle} 
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            required 
            type="text" 
            placeholder="MM/AA" 
            value={formData.expiry} 
            onChange={handleExpiry} 
            style={{ ...inputStyle, flex: 1 }} 
          />
          <input 
            required 
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