'use client';
import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

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

      const { customerData } = useCartStore.getState();

      try {
        const res = await fetch('/api/create-preference', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            title: 'Pedido Glamour', 
            price: Math.round(precio), 
            quantity: 1, 
            vendedorEmail,
            clienteNombre: customerData.nombre,
            clienteWhatsapp: customerData.whatsapp,
            puntoEntrega: customerData.entrega
          }) 
        });
        const pref = await res.json();
        if (!isEffectActive) return;

        if (!window.window.MercadoPago) {
          await new Promise<void>(r => {
            const s = document.createElement('script'); 
            s.src = 'https://sdk.mercadopago.com/js/v2';
            s.async = true; s.onload = () => r(); 
            document.body.appendChild(s);
          });
        }

        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: 'es-AR' });
        
        brickController.current = await mp.bricks().create('payment', 'brick-unique-id', {
          initialization: { amount: Math.round(precio), preferenceId: pref.id },
          customization: {
            visual: { style: { theme: 'default', customVariables: { colorPrimary: '#FF0000', borderRadius: '15px' } } },
            paymentMethods: {
              creditCard: metodo === 'tarjeta' ? 'all' : undefined,
              debitCard: metodo === 'tarjeta' ? 'all' : undefined,
              ticket: metodo === 'tarjeta' ? 'all' : undefined,
              mercadoPago: metodo === 'mp' ? 'all' : undefined,
            },
          },
          callbacks: {
            onReady: () => { if (isEffectActive) setLoading(false); },
            onSubmit: async (param: any) => {
              const { customerData } = useCartStore.getState();
              const mpData = param.formData || param;

              if (metodo === 'mp' || mpData.payment_method_id === 'wallet_purchase') {
                return; 
              }

              const payload = { 
                ...mpData, 
                transaction_amount: Math.round(precio),
                vendedorEmail, 
                clienteNombre: customerData.nombre, 
                clienteWhatsapp: customerData.whatsapp, 
                puntoEntrega: customerData.entrega 
              };

              const r = await fetch('/api/process-payment', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
              });
              
              const p = await r.json();

              // ✅ CASO 1: Pago aprobado al instante (Tarjeta)
              if (p.status === 'approved') {
                onPagoAprobado();
              } 
              // 🎫 CASO 2: Pago pendiente (Pago Fácil / Rapipago)
              else if (p.status === 'pending') {
                const ticketUrl = p.transaction_details?.external_resource_url;
                if (ticketUrl) {
                  window.open(ticketUrl, '_blank'); // Abrimos el cupón para que el cliente lo pague
                }
                onPagoAprobado(); // Llamamos al éxito para que la web diga "¡Pedido Recibido!"
              }
            },
            onError: (err: any) => { console.error(err); setLoading(false); }
          },
        });
      } catch (e) { setLoading(false); }
    };
    initMP();
    return () => { isEffectActive = false; if (brickController.current) brickController.current.unmount(); };
  }, [metodo, precio, vendedorEmail, onPagoAprobado]);

  return (
    <div style={{ minHeight: '400px', width: '100%' }}>
      {loading && <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Cargando pasarela segura...</p>}
      <div id="brick-unique-id" ref={containerRef} style={{ width: '100%' }} />
    </div>
  );
}