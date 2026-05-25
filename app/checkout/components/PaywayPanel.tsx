'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { CreditCard, Lock, ShieldCheck, Loader2 } from 'lucide-react';

const K = { bg: '#FFF8F8', border: '#FFC9CB', accent: '#FF0000', text: '#1C1B19', muted: '#9A9690' };

interface PaywayPanelProps {
  precio: number;
  onPagoExitoso: () => void;
}

export default function PaywayPanel({ precio, onPagoExitoso }: PaywayPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const customerData = useCartStore((state) => state.customerData);
  const items = useCartStore((state) => state.items);

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    dni: ''
  });

  // Formateador de tarjeta
  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData({ ...formData, cardNumber: v });
  };

  // Formateador de vencimiento (MM/YY)
  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
    setFormData({ ...formData, expiry: v });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulación de validación y delay de red para feedback de UI
      // En el siguiente paso integraremos el SDK real de Decidir
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí llamaremos a tu API route: /api/process-payment
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo: 'payway',
          monto: precio,
          customer: customerData,
          items: items,
          paymentDetail: {
             lastFour: formData.cardNumber.slice(-4),
             dni: formData.dni
          }
        })
      });

      if (response.ok) {
        onPagoExitoso();
      } else {
        throw new Error('Error al procesar el pago bancario.');
      }
    } catch (err: any) {
      setError(err.message || 'Hubo un problema con la tarjeta.');
    } finally {
      setLoading(false);
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
            type="text"
            placeholder="Número de tarjeta"
            value={formData.cardNumber}
            onChange={handleCardNumber}
            style={inputStyle}
          />
          <CreditCard size={18} style={iconInInput} />
        </div>

        <input
          required
          type="text"
          placeholder="Nombre como figura en la tarjeta"
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
          <p style={{ color: K.accent, fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', margin: '5px 0' }}>
            ✕ {error}
          </p>
        )}

        <button
          disabled={loading}
          type="submit"
          style={{
            width: '100%',
            padding: '1.2rem',
            borderRadius: 50,
            background: loading ? K.muted : K.accent,
            color: 'white',
            fontWeight: 900,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '1rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: '0.3s'
          }}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Lock size={18} />}
          {loading ? 'PROCESANDO...' : `PAGAR $${new Intl.NumberFormat('es-AR').format(precio)}`}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <ShieldCheck size={16} color="#22c55e" />
          <span style={{ fontSize: '0.7rem', color: K.muted, fontWeight: 600 }}>Encriptación SSL de 256 bits</span>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '1rem',
  paddingLeft: '1rem',
  borderRadius: '12px',
  border: `1.5px solid ${K.border}`,
  background: K.bg,
  outline: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: K.text,
};

const iconInInput = {
  position: 'absolute' as 'absolute',
  right: '15px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: K.muted
};