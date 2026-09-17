"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Truck, Store, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data (en producción, esto se obtiene de la API con el packId)
const MOCK_PACKS: Record<string, any> = {
  "1": {
    restaurantName: "La Lucha Sanguchería",
    packName: "Pack Criollo Especial",
    originalPrice: 45.0,
    rescuePrice: 20.0,
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60",
    pickupTime: "20:00 - 21:30",
    address: "Av. Diagonal 308, Miraflores",
  },
  "pack-1-1": {
    restaurantName: "La Lucha Sanguchería",
    packName: "Pack Especial Sorpresa",
    originalPrice: 45.0,
    rescuePrice: 20.0,
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60",
    pickupTime: "20:00 - 21:30",
    address: "Av. Diagonal 308, Miraflores",
  },
  "2": {
    restaurantName: "Punto Azul",
    packName: "Pack Marino",
    originalPrice: 55.0,
    rescuePrice: 25.0,
    imageUrl: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&auto=format&fit=crop&q=60",
    pickupTime: "16:00 - 17:00",
    address: "Calle San Martín 595, Miraflores",
  }
};

export default function CheckoutPage({ params }: { params: Promise<{ packId: string }> }) {
  const resolvedParams = use(params);
  const packId = resolvedParams.packId;
  const router = useRouter();
  
  // Default to pack 1 if not found for mock purposes
  const pack = MOCK_PACKS[packId] || MOCK_PACKS["1"];
  
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "yape">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPrime, setIsPrime] = useState(false); // Simulamos si el usuario es Prime
  
  const deliveryCost = isPrime ? 0 : 5.00;
  const total = pack.rescuePrice + (deliveryMethod === "delivery" ? deliveryCost : 0);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simular llamada a API de pagos
    setTimeout(() => {
      // Redirigir a página de éxito con el ID de orden generado
      const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
      router.push(`/order/${orderId}?type=${deliveryMethod}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center">
          <button onClick={() => router.back()} className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Finalizar Reserva</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Detalles y Formulario (2 columnas) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Método de Entrega */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                Opciones de Entrega
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    deliveryMethod === "pickup" 
                      ? "border-primary bg-primary/5" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Store className={`size-6 ${deliveryMethod === "pickup" ? "text-primary" : "text-slate-400"}`} />
                    {deliveryMethod === "pickup" && <CheckCircle2 className="size-5 text-primary" />}
                  </div>
                  <h3 className="font-bold text-slate-900">Recojo en Tienda</h3>
                  <p className="text-xs text-slate-500 mt-1">Gratis. Recógelo tú mismo y ayuda al planeta.</p>
                </button>

                <button
                  onClick={() => isPrime && setDeliveryMethod("delivery")}
                  disabled={!isPrime}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                    deliveryMethod === "delivery" 
                      ? "border-primary bg-primary/5" 
                      : !isPrime 
                        ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed" 
                        : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Truck className={`size-6 ${deliveryMethod === "delivery" ? "text-primary" : "text-slate-400"}`} />
                    {deliveryMethod === "delivery" && <CheckCircle2 className="size-5 text-primary" />}
                    {!isPrime && <div className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase">Exclusivo Prime</div>}
                  </div>
                  <h3 className="font-bold text-slate-900">Delivery Ecológico</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isPrime ? (
                      <span className="text-primary font-semibold">Gratis con Prime</span>
                    ) : (
                      <span className="text-amber-600 font-semibold text-xs">Requiere suscripción Prime</span>
                    )}
                  </p>
                </button>
              </div>

              {!isPrime && (
                <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">¿Quieres delivery gratis?</h4>
                    <p className="text-xs text-amber-700">Únete a EcoRescate Prime y ahorra en todos tus pedidos.</p>
                  </div>
                  <Link href="/prime" className="whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
                    Ver beneficios Prime
                  </Link>
                </div>
              )}
            </div>

            {/* Método de Pago */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4">Método de Pago</h2>
              
                <div>
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "card" ? "border-primary bg-primary/5 rounded-b-none" : "border-slate-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="accent-primary size-4" />
                      <span className="font-semibold text-slate-700">Tarjeta de Crédito / Débito</span>
                    </div>
                  </label>
                  {paymentMethod === "card" && (
                    <div className="p-4 border-2 border-t-0 border-primary rounded-b-xl bg-primary/5 space-y-3">
                      <input type="text" placeholder="Número de tarjeta" className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="MM/AA" className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                        <input type="text" placeholder="CVC" className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                      </div>
                      <input type="text" placeholder="Nombre en la tarjeta" className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                    </div>
                  )}
                </div>

                <div>
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "yape" ? "border-purple-500 bg-purple-50 rounded-b-none" : "border-slate-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === "yape"} onChange={() => setPaymentMethod("yape")} className="accent-purple-600 size-4" />
                      <span className="font-semibold text-slate-700">Yape / Plin</span>
                    </div>
                  </label>
                  {paymentMethod === "yape" && (
                    <div className="p-4 border-2 border-t-0 border-purple-500 rounded-b-xl bg-purple-50 flex flex-col items-center">
                      <div className="w-32 h-32 bg-white rounded-lg p-2 mb-3 shadow-sm border border-purple-100 flex items-center justify-center">
                         <div className="w-full h-full bg-slate-900 rounded-sm flex items-center justify-center text-white text-[10px] text-center p-2">QR Yape/Plin</div>
                      </div>
                      <p className="text-xs text-slate-600 text-center mb-3">Escanea el QR para pagar S/ {total.toFixed(2)}</p>
                      <input type="text" placeholder="Código de aprobación" className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                    </div>
                  )}
                </div>
            </div>

          </div>

          {/* Resumen de Orden (1 columna) */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Resumen de Orden</h2>
              
              <div className="flex gap-4 mb-6">
                <div className="relative size-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={pack.imageUrl} alt={pack.packName} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{pack.packName}</h3>
                  <p className="text-xs text-slate-500 mt-1">{pack.restaurantName}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm border-t border-slate-100 pt-4 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>S/ {pack.rescuePrice.toFixed(2)}</span>
                </div>
                {deliveryMethod === "delivery" && (
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery {isPrime && <span className="text-primary font-bold">(Prime)</span>}</span>
                    <span className={isPrime ? "text-primary" : ""}>{isPrime ? "Gratis" : `S/ ${deliveryCost.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-primary">S/ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 mb-6 flex gap-2">
                <ShieldCheck className="size-4 shrink-0 text-primary" />
                <p>Tu pago es 100% seguro y garantizado por EcoRescate.</p>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-leaf hover:bg-leaf-deep text-white font-bold py-3.5 rounded-xl shadow-lg shadow-leaf/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>Procesando pago...</>
                ) : (
                  <>Pagar S/ {total.toFixed(2)}</>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
