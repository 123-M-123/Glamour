'use client';
import { useEffect, useRef, useState } from 'react';

const THEME_COLOR = '#FF0000';

// 👈 Prop vendedorEmail agregada a la desestructuración
export default function BrickPanel({ metodo, precio, vendedorEmail, onPagoAprobado }: any) {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const brickController = useRef<any>(null);

  useEffect(() => {
    let isEffectActive = true; 

    const initMP = async () => {
      if (!containerRef.current) return;
      
      containerRef.current.innerHTML = "";
      setLoading(true);

      try {
        const res = await fetch('/api/create-preference', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          // 👈 Enviamos vendedorEmail para guardarlo en la metadata de la preferencia
          body: JSON.stringify({ 
            title: 'Glamour - Pago Seguro', 
            price: Math.round(precio), 
            quantity: 1,
            vendedorEmail 
          }) 
        });
        const pref = await res.json();

        if (!isEffectActive) return;

        if (!window.MercadoPago) {
          await new Promise<void>(r => {
            const s = document.createElement('script'); 
            s.src = 'https://sdk.mercadopago.com/js/v2';
            s.async = true; s.onload = () => r(); 
            document.body.appendChild(s);
          });
        }

        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: 'es-AR' });
        const bricksBuilder = mp.bricks();

        if (brickController.current) {
          await brickController.current.unmount();
          brickController.current = null;
        }

        if (containerRef.current) containerRef.current.innerHTML = "";

        brickController.current = await bricksBuilder.create('payment', 'brick-unique-id', {
          initialization: { amount: Math.round(precio), preferenceId: pref.id },
          customization: {
            visual: {
              style: { theme: 'default', customVariables: { colorPrimary: THEME_COLOR, borderRadius: '15px' } }
            },
            paymentMethods: {
              creditCard: metodo === 'tarjeta' ? 'all' : undefined,
              debitCard: metodo === 'tarjeta' ? 'all' : undefined,
              ticket: metodo === 'tarjeta' ? 'all' : undefined, 
              mercadoPago: metodo === 'mp' ? 'all' : undefined,
            },
          },
          callbacks: {
            onReady: () => { if (isEffectActive) setLoading(false); },
            onSubmit: async ({ formData }: any) => {
              // 👈 Incluimos vendedorEmail en el envío del pago procesado
              const r = await fetch('/api/process-payment', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ ...formData, vendedorEmail }) 
              });
              const p = await r.json();
              if (p.status === 'approved') onPagoAprobado();
            },
            onError: (err: any) => { console.error(err); setLoading(false); }
          },
        });
      } catch (e) { setLoading(false); }
    };

    initMP();

    return () => {
      isEffectActive = false;
      if (brickController.current) {
        const instance = brickController.current;
        brickController.current = null;
        instance.unmount();
      }
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [metodo, vendedorEmail]); // 👈 Dependencia agregada

  return (
    <div style={{ minHeight: '400px', width: '100%' }}>
      {loading && <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Cargando pasarela...</p>}
      <div 
        key={metodo} 
        id="brick-unique-id" 
        ref={containerRef} 
        style={{ width: '100%' }} 
      />
    </div>
  );
}