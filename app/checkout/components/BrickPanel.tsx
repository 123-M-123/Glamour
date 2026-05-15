'use client';
import { useEffect, useRef, useState } from 'react';

const THEME_COLOR = '#FF0000'; // 🎨 Tu variable de color

export default function BrickPanel({ metodo, precio, onPagoAprobado }: any) {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const brickController = useRef<any>(null);

  useEffect(() => {
    // 1. Variable de control local para esta ejecución del efecto
    let isEffectActive = true; 

    const initMP = async () => {
      if (!containerRef.current) return;
      
      // Limpieza preventiva total
      containerRef.current.innerHTML = "";
      setLoading(true);

      try {
        const res = await fetch('/api/create-preference', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ title: 'Glamour - Pago Seguro', price: Math.round(precio), quantity: 1 }) 
        });
        const pref = await res.json();

        // Si mientras pedíamos la preferencia el componente se desmontó, cancelamos todo
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

        // 2. Si ya hay una instancia moviéndose, la matamos antes de seguir
        if (brickController.current) {
          await brickController.current.unmount();
          brickController.current = null;
        }

        // 3. Verificación final de limpieza de HTML
        if (containerRef.current) containerRef.current.innerHTML = "";

        // 4. CREACIÓN
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
              const r = await fetch('/api/process-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
              const p = await r.json();
              if (p.status === 'approved') onPagoAprobado();
            },
            onError: (err: any) => { console.error(err); setLoading(false); }
          },
        });
      } catch (e) { setLoading(false); }
    };

    initMP();

    // ── 🛡️ LIMPIEZA CRÍTICA ──
    return () => {
      isEffectActive = false; // Bloquea cualquier callback asíncrono que esté en camino
      if (brickController.current) {
        const instance = brickController.current;
        brickController.current = null;
        instance.unmount(); // Desmonta oficialmente de Mercado Pago
      }
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [metodo]); // Se reinicia SOLAMENTE si cambias de botón (Tarjeta <-> MP)

  return (
    <div style={{ minHeight: '400px', width: '100%' }}>
      {loading && <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Cargando pasarela...</p>}
      
      {/* 
          Usamos la prop KEY. Esto es un truco de Senior: 
          Al cambiar el método, React destruye el DIV viejo y crea uno nuevo 
          desde cero, lo que obliga a Mercado Pago a perder la referencia anterior.
      */}
      <div 
        key={metodo} 
        id="brick-unique-id" 
        ref={containerRef} 
        style={{ width: '100%' }} 
      />
    </div>
  );
}