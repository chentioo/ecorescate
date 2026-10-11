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
  Banknote
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

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100">
        
        {/* Encabezado Éxito */}
        <div className="bg-gradient-to-b from-emerald-50 to-white pt-8 pb-6 px-6 sm:px-8 text-center border-b border-slate-100">
          <div className="mx-auto size-16 bg-emerald-100/80 rounded-full flex items-center justify-center mb-3 shadow-inner ring-4 ring-emerald-50">
            <CheckCircle2 className="size-9 text-emerald-600" />
          </div>
          
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            ¡Reserva Confirmada!
          </span>

          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            ¡Comida Rescatada!
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Tu pedido ya está registrado en el sistema del restaurante.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white font-mono font-bold px-4 py-1.5 rounded-xl text-sm shadow-sm">
            <span>Código de recojo:</span>
            <span className="text-emerald-400 tracking-wider text-base">{displayCode}</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Código QR para Recojo */}
          {!isDelivery ? (
            <div className="flex flex-col items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <p className="text-xs text-center text-slate-600 font-semibold mb-3">
                Muestra este código QR en el mostrador del restaurante
              </p>
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                <QRCode value={displayCode} size={150} fgColor="#0f172a" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                #{orderId}
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
              <Truck className="size-10 text-amber-500 mx-auto mb-2" />
              <h3 className="font-bold text-amber-900 text-sm">Delivery Ecológico en Preparación</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Un repartidor en bicicleta eléctrica llevará tu pack en el horario indicado.
              </p>
            </div>
          )}

          {/* Impacto Positivo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Leaf className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-700 font-semibold">CO2 Evitado</p>
                <p className="text-sm font-extrabold text-emerald-950">{displayCo2}</p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-amber-700 font-semibold">Dinero Ahorrado</p>
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
