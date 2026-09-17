"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";
import confetti from "canvas-confetti";
import { CheckCircle2, MapPin, Clock, ArrowRight, Store, Truck } from "lucide-react";

export default function OrderSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const searchParams = useSearchParams();
  const deliveryType = searchParams.get("type") || "pickup";
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Disparar confeti al cargar la página de éxito
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#16a34a', '#f59e0b', '#ffffff']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#16a34a', '#f59e0b', '#ffffff']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  // Datos mockeados de la orden
  const orderData = {
    restaurantName: "La Lucha Sanguchería",
    packName: "Pack Especial Sorpresa",
    address: "Av. Diagonal 308, Miraflores",
    location: { lat: -12.122114, lng: -77.030999 },
    pickupTime: "20:00 - 21:30",
  };

  return (
    <div className="min-h-screen bg-leaf-deep py-12 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-300 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        <div className="bg-gradient-to-b from-green-50 to-white pt-8 pb-6 px-8 text-center border-b border-slate-100">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle2 className="size-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">¡Reserva Confirmada!</h1>
          <p className="text-slate-500 text-sm">
            Gracias por ayudar a reducir el desperdicio de alimentos.
          </p>
          <div className="mt-4 inline-block bg-slate-100 text-slate-600 font-mono font-bold px-4 py-1.5 rounded-lg text-sm">
            Orden #{orderId}
          </div>
        </div>

        <div className="p-8">
          {deliveryType === "pickup" ? (
            <div className="flex flex-col items-center mb-8">
              <p className="text-sm text-center text-slate-600 font-medium mb-4">
                Muestra este código QR en el local para recoger tu pack.
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-100">
                <QRCode value={orderId} size={160} fgColor="#0f172a" />
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-8">
              <Truck className="size-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-amber-900 mb-1">Tu delivery está en camino</h3>
              <p className="text-sm text-amber-700">Te notificaremos cuando el repartidor esté cerca a tu ubicación.</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Store className="size-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Local</p>
                <p className="font-bold text-slate-900">{orderData.restaurantName}</p>
                <p className="text-sm text-slate-600">{orderData.packName}</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Clock className="size-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Horario de {deliveryType === "pickup" ? "Recojo" : "Entrega"}</p>
                <p className="font-bold text-slate-900">Hoy, {orderData.pickupTime}</p>
              </div>
            </div>

            {deliveryType === "pickup" && (
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <MapPin className="size-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Dirección</p>
                  <p className="font-bold text-slate-900 text-sm leading-snug">{orderData.address}</p>
                  
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${orderData.location.lat},${orderData.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-primary font-bold text-xs hover:underline"
                  >
                    Abrir en Google Maps <ArrowRight className="size-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10">
            <Link 
              href="/explore" 
              className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Volver a explorar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
