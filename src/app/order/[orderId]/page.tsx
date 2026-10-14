"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Store, 
  Truck, 
  Leaf, 
  Sparkles, 
  ShieldCheck, 
  Navigation,
  User,
  ShoppingBag,
  CreditCard,
  Wallet,
  Banknote,
  Copy,
  Check
} from "lucide-react";
import { getOrderById } from "@/lib/orders";
import { Order } from "@/types";
import { OrderNotificationCard } from "@/components/notifications/OrderNotificationCard";

export default function OrderSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const searchParams = useSearchParams();
  const deliveryType = searchParams.get("type") || "pickup";
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // Cargar orden real
  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await getOrderById(orderId);
        if (data) {
          setOrder(data);
        }
      } catch (e) {
        console.error("Error loading order:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  // Efecto de Confeti al confirmar
  useEffect(() => {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 },
        colors: ['#16a34a', '#84cc16', '#f59e0b', '#10b981']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 },
        colors: ['#16a34a', '#84cc16', '#f59e0b', '#10b981']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Datos de fallback en caso de retraso en carga
  const displayRestaurant = order?.restaurantName || "La Lucha Sanguchería";
  const displayPack = order?.packName || "Pack Especial Sorpresa";
  const displayAddress = order?.restaurantAddress || "Av. Diagonal 308, Miraflores";
  const displayCode = order?.orderCode || `ECO-${orderId.slice(-4) || "8421"}`;
  const displayPickupTime = order?.pickupTime || "Hoy, 20:00 - 21:30";
  const displayTotal = order?.totalPrice ? `S/ ${order.totalPrice.toFixed(2)}` : "S/ 14.90";
  const displayCo2 = order?.co2SavedKg ? `${order.co2SavedKg} kg` : "2.5 kg";
  const displayMoneySaved = order?.moneySaved ? `S/ ${order.moneySaved.toFixed(2)}` : "S/ 24.00";
  const displayQuantity = order?.quantity || 1;
  const isDelivery = (order?.deliveryMethod || deliveryType) === "delivery";

  const googleMapsUrl = order?.restaurantLocation 
    ? `https://www.google.com/maps/dir/?api=1&destination=${order.restaurantLocation.lat},${order.restaurantLocation.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress + ", Lima")}`;

  return (
    <div className="min-h-screen bg-slate-900/90 py-16 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden pt-24 pb-20">
      
      {/* Luces de fondo decorativas */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Pase Digital estilo Apple Wallet */}
      <div className="max-w-md w-full shadow-2xl relative z-10 rounded-[32px] overflow-hidden border border-slate-700/50 bg-slate-900 transition-all duration-300">
        
        {/* Cabecera Superior del Pase (Dark Glassmorphism) */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 text-white relative">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <Leaf className="size-3.5 text-emerald-400" />
              Pase Digital de Recojo
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Apple Wallet
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Restaurante aliado
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {displayRestaurant}
            </h1>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Pack asignado</span>
              <span className="font-bold text-white text-sm">{displayPack}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px] block">Cantidad</span>
              <span className="font-bold text-emerald-400 text-sm">{displayQuantity}x unidad</span>
            </div>
          </div>
        </div>

        {/* Separador Dentado / Perforación Apple Wallet */}
        <div className="relative flex items-center bg-slate-950 py-1 overflow-hidden">
          <div className="absolute -left-3 size-6 rounded-full bg-slate-900 border border-slate-700/60" />
          <div className="w-full border-t-2 border-dashed border-slate-700/70 mx-5" />
          <div className="absolute -right-3 size-6 rounded-full bg-slate-900 border border-slate-700/60" />
        </div>

        {/* Cuerpo del Pase (Superficie Blanca Prístina) */}
        <div className="bg-white p-6 sm:p-7 space-y-6">
          
          {/* Sección Código QR Dinámico */}
          {!isDelivery ? (
            <div className="flex flex-col items-center bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">
                Escanea en el mostrador para retirar
              </span>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-center">
                <QRCode value={displayCode} size={160} fgColor="#0f172a" />
              </div>

              {/* Código de Recojo y Botón de Copiar */}
              <div className="mt-4 flex flex-col items-center gap-2 w-full">
                <div className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xs w-full max-w-xs">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Código:</span>
                  <span className="font-mono text-base font-extrabold text-emerald-400 tracking-wider">
                    {displayCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`ml-auto apple-btn px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      copied 
                        ? "bg-emerald-600 text-white shadow-xs" 
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    }`}
                    title="Copiar código de recojo"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3 stroke-[2.5]" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  ID: #{orderId.slice(-8)}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-center">
              <Truck className="size-10 text-amber-500 mx-auto mb-2" />
              <h3 className="font-bold text-amber-900 text-sm">Delivery Ecológico en Preparación</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Un repartidor en bicicleta eléctrica llevará tu pack en el horario indicado.
              </p>
            </div>
          )}

          {/* Sellos de Impacto Ecológico y Ahorro */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/90 rounded-2xl p-3 border border-emerald-100 flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Leaf className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">CO2 Evitado</p>
                <p className="text-sm font-extrabold text-emerald-950">{displayCo2}</p>
              </div>
            </div>

            <div className="bg-amber-50/90 rounded-2xl p-3 border border-amber-100 flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Dinero Ahorrado</p>
                <p className="text-sm font-extrabold text-amber-950">{displayMoneySaved}</p>
              </div>
            </div>
          </div>

          {/* Información del Local y Horario */}
          <div className="space-y-3.5 border-t border-slate-100 pt-5">
            <div className="flex gap-3.5 items-start">
              <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                <Store className="size-4" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Local & Pack</p>
                <p className="font-bold text-slate-900 text-sm">{displayRestaurant}</p>
                <p className="text-xs text-slate-600">{displayPack} ({displayQuantity}x) — <strong className="text-primary">{displayTotal}</strong></p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                <Clock className="size-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Horario de {isDelivery ? "Entrega" : "Recojo"}</p>
                <p className="font-bold text-slate-900 text-sm">{displayPickupTime}</p>
              </div>
            </div>

            {!isDelivery && (
              <div className="flex gap-3.5 items-start">
                <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                  <MapPin className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Dirección</p>
                  <p className="font-bold text-slate-900 text-xs leading-snug">{displayAddress}</p>
                  <a 
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-primary font-bold text-xs hover:underline"
                  >
                    <span>Abrir en Google Maps</span>
                    <ArrowRight className="size-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Comprobante de Pago y Transacción Bancaria */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700">
                {order?.paymentMethod === "yape" ? (
                  <Wallet className="size-4 text-purple-600" />
                ) : order?.paymentMethod === "cash" ? (
                  <Banknote className="size-4 text-emerald-600" />
                ) : (
                  <CreditCard className="size-4 text-primary" />
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {order?.paymentMethod === "yape" 
                    ? "Billetera Digital (Yape / Plin)" 
                    : order?.paymentMethod === "cash" 
                    ? "Pago en Local (Contraentrega)" 
                    : "Tarjeta Débito / Crédito"}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {order?.authorizationCode ? `Aut: ${order.authorizationCode}` : `Ref: ${displayCode}`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                order?.paymentMethod === "cash" 
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}>
                <CheckCircle2 className="size-3" />
                {order?.paymentMethod === "cash" ? "Pendiente en local" : "Pago Aprobado"}
              </span>
              <p className="text-slate-700 font-extrabold text-xs mt-0.5">{displayTotal}</p>
            </div>
          </div>

          {/* Comprobantes & Notificaciones (WhatsApp, Correo y Alertas) */}
          <OrderNotificationCard 
            order={order || { 
              id: orderId, 
              orderCode: displayCode, 
              restaurantName: displayRestaurant, 
              packName: displayPack, 
              pickupTime: displayPickupTime, 
              restaurantAddress: displayAddress, 
              totalPrice: 14.90, 
              moneySaved: 24.00, 
              co2SavedKg: 2.5, 
              quantity: displayQuantity, 
              bringOwnContainer: false 
            }} 
          />

          {/* Botones de Acción */}
          <div className="space-y-2.5 pt-2">
            <Link 
              href="/profile" 
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-leaf-deep text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary/20 transition-all text-sm"
            >
              <User className="size-4" />
              <span>Ver mis Rescates en Mi Perfil</span>
            </Link>

            <Link 
              href="/explore" 
              className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-xs"
            >
              Seguir explorando ofertas
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
