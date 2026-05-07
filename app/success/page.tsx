'use client';

import { CheckCircle, Package, Mail } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-green-200 rounded-2xl shadow-md p-8">

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-green-600 mb-2">
          ¡Pago exitoso!
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Gracias por tu compra. Tu pedido fue confirmado.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
            <Package className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <p className="font-medium text-gray-800">Pedido en proceso</p>
              <p className="text-sm text-gray-500">
                Estamos preparando tu pedido para el envío.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
            <Mail className="w-5 h-5 text-green-500 shrink-0" />
            <div>
              <p className="font-medium text-gray-800">Email de confirmación</p>
              <p className="text-sm text-gray-500">
                Revisá tu casilla para ver los detalles del pedido.
              </p>
            </div>
          </div>
        </div>

        <Link href="/">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition">
            Seguir comprando
          </button>
        </Link>

      </div>
    </div>
  );
}