'use client';
import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '../../store/useCartStore'; // 👈 IMPORTACIÓN AGREGADA

const THEME_COLOR = '#FF0000';

export default function BrickPanel({ metodo, precio, vendedorEmail, onPagoAprobado, onBeforeSubmit }: any) {
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
            onSubmit: ({ formData }: any) => {
              // 🚀 INTERCEPCIÓN LÓGICA
              return new Promise<void>((resolve, reject) => {
                onBeforeSubmit(() => {
                  // Capturamos los datos del cliente guardados en el modal
                  const { customerData } = useCartStore.getState();

                  fetch('/api/process-payment', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ 
                      ...formData, 
                      vendedorEmail,
                      clienteNombre: customerData.nombre,
                      clienteWhatsapp: customerData.whatsapp,
                      puntoEntrega: customerData.entrega
                    }) 
                  })
                  .then(r => r.json())
                  .then(p => {
                    if (p.status === 'approved') onPagoAprobado();
                    resolve();
                  })
                  .catch(err => {
                    console.error(err);
                    reject(err);
                  });
                });
              });
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
        brickController.current.unmount();
      }
    };
  }, [metodo, vendedorEmail, precio, onBeforeSubmit, onPagoAprobado]); 

  return (
    <div style={{ minHeight: '400px', width: '100%' }}>
      {loading && <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Cargando pasarela...</p>}
      <div key={metodo} id="brick-unique-id" ref={containerRef} style={{ width: '100%' }} />
    </div>
  );
}