'use client';
import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';

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
          body: JSON.stringify({ title: 'Pedido Glamour', price: Math.round(precio), quantity: 1, vendedorEmail }) 
        });
        const pref = await res.json();
        if (!isEffectActive) return;

        if (!window.MercadoPago) {
          await new Promise<void>(r => {
            const s = document.createElement('script'); s.src = 'https://sdk.mercadopago.com/js/v2';
            s.async = true; s.onload = () => r(); document.body.appendChild(s);
          });
        }

        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: 'es-AR' });
        brickController.current = await mp.bricks().create('payment', 'brick-unique-id', {
          initialization: { amount: Math.round(precio), preferenceId: pref.id },
          customization: {
            visual: { style: { theme: 'default', customVariables: { colorPrimary: '#FF0000', borderRadius: '15px' } } },
            paymentMethods: {
              creditCard: 'all', debitCard: 'all', ticket: 'all', mercadoPago: 'all',
            },
          },
          callbacks: {
            onReady: () => setLoading(false),
            onSubmit: async ({ formData }: any) => {
              const { customerData } = useCartStore.getState();
              const r = await fetch('/api/process-payment', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ ...formData, vendedorEmail, clienteNombre: customerData.nombre, clienteWhatsapp: customerData.whatsapp, puntoEntrega: customerData.entrega }) 
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
    return () => { isEffectActive = false; if (brickController.current) brickController.current.unmount(); };
  }, [metodo]);

  return (
    <div style={{ minHeight: '400px' }}>
      {loading && <p style={{ textAlign: 'center', color: '#999' }}>Cargando pasarela...</p>}
      <div id="brick-unique-id" ref={containerRef} />
    </div>
  );
}