"use client";

import { useState, useEffect } from "react";
import { 
  Store, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Leaf, 
  QrCode, 
  Sparkles, 
  Loader2, 
  PackageCheck,
  ShieldCheck,
  UtensilsCrossed,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { verifyOrderByCode, getOrderByCode } from "@/lib/orders";
import { Order } from "@/types";

const ALLIED_RESTAURANTS = [
  { id: "1", name: "La Lucha Sanguchería", logo: "/logos/LaluchaLogo.jpg", address: "Av. Diagonal 308, Miraflores" },
  { id: "2", name: "Punto Azul", logo: "/logos/puntoazul_logo.png", address: "Calle San Martín 595, Miraflores" },
  { id: "3", name: "Siete Sopas", logo: "/logos/Sietesopaslogo.png", address: "Av. Arequipa 2394, Lince" },
  { id: "4", name: "Bodega Verde", logo: "/logos/bodegaverdelogo.jpg", address: "Jirón Sucre 335A, Barranco" },
  { id: "5", name: "La Mar", logo: "/logos/lamarlogo.jpg", address: "Av. La Mar 770, Miraflores" },
  { id: "6", name: "Roky's", logo: "/logos/rockyslogo.jpg", address: "Av. Benavides 2405, Miraflores" },
  { id: "7", name: "Chifa Titi", logo: "/logos/chifatitilogo.jpg", address: "Av. Javier Prado Este 1212, San Borja" },
  { id: "8", name: "Hikari", logo: "/logos/hikarilogo.jpg", address: "Av. La Mar 2339, San Miguel" },
];

export default function PartnerValidationPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(ALLIED_RESTAURANTS[0]);
  const [inputCode, setInputCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validatedToday, setValidatedToday] = useState<Order[]>([]);

  // Buscar pedido por código
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputCode.trim()) return;

    setIsSearching(true);
    setErrorStatus(null);
    setSuccessMessage(null);
    setSearchedOrder(null);

    try {
      const order = await getOrderByCode(inputCode.trim());
      if (order) {
        setSearchedOrder(order);
        if (order.status === "completed") {
          setErrorStatus(`⚠️ Este pedido (${order.orderCode}) ya fue entregado anteriormente.`);
        }
      } else {
        setErrorStatus(`No se encontró ningún pedido con el código "${inputCode.trim().toUpperCase()}". Verifica con el cliente.`);
      }
    } catch (err: any) {
      setErrorStatus(err.message || "Error al buscar el pedido en el servidor.");
    } finally {
      setIsSearching(false);
    }
  };

  // Validar y marcar como entregado
  const handleConfirmRedeem = async () => {
    if (!searchedOrder) return;

    setIsSubmitting(true);
    setErrorStatus(null);
    setSuccessMessage(null);

    try {
      const result = await verifyOrderByCode(searchedOrder.orderCode, selectedRestaurant.name);
      
      if (result.success && result.order) {
        setSearchedOrder(result.order);
        setSuccessMessage(`¡Pedido ${result.order.orderCode} verificado y entregado con éxito!`);
        setValidatedToday((prev) => [result.order!, ...prev.filter((o) => o.id !== result.order!.id)]);
        
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#16a34a", "#22c55e", "#f59e0b"]
        });
      } else if (result.alreadyCompleted) {
        setErrorStatus(result.error || "Este pedido ya fue entregado anteriormente.");
        if (result.order) setSearchedOrder(result.order);
      } else {
        setErrorStatus(result.error || "No se pudo validar el pedido.");
      }
    } catch (err: any) {
      setErrorStatus(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabecera del Portal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Store className="size-3.5" /> Portal de Restaurantes Aliados
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Validación y Canje de Pedidos
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Escanea o ingresa el código <strong className="text-emerald-400">ECO-XXXX</strong> presentado por el cliente.
            </p>
          </div>

          {/* Selector de Restaurante */}
          <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
              Local en atención:
            </label>
            <select
              value={selectedRestaurant.id}
              onChange={(e) => {
                const rest = ALLIED_RESTAURANTS.find((r) => r.id === e.target.value);
                if (rest) setSelectedRestaurant(rest);
              }}
              className="bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
            >
              {ALLIED_RESTAURANTS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buscador / Validador de Código */}
        <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <QrCode className="absolute left-4 top-3.5 size-5 text-slate-400" />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ingresa código (ej. ECO-5821 o ID)"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-base sm:text-lg font-mono font-bold tracking-wider text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !inputCode.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm sm:text-base shrink-0 shadow-lg shadow-emerald-500/20"
            >
              {isSearching ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Search className="size-5" />
                  <span>Consultar Pedido</span>
                </>
              )}
            </button>
          </form>

          {/* Atajos de prueba rápida */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">¿Quieres probar rápido?</span>
            <span className="text-slate-400">Escribe cualquier código generado en el checkout como</span>
            <button
              type="button"
              onClick={() => {
                setInputCode("ECO-1234");
              }}
              className="bg-slate-900 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-slate-700 hover:border-emerald-500 transition"
            >
              ECO-1234
            </button>
          </div>
        </div>

        {/* Mensajes de Estado */}
        {errorStatus && (
          <div className="mb-8 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-start gap-3 text-red-200 text-sm animate-fadeIn">
            <AlertTriangle className="size-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">{errorStatus}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-8 p-4 bg-emerald-950/70 border border-emerald-700 rounded-2xl flex items-center gap-3 text-emerald-200 text-sm animate-fadeIn shadow-lg shadow-emerald-900/30">
            <CheckCircle2 className="size-6 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <p className="font-extrabold text-base text-white">{successMessage}</p>
              <p className="text-xs text-emerald-300/90 mt-0.5">El pack fue registrado como entregado en la base de datos de EcoRescate.</p>
            </div>
          </div>
        )}

        {/* Ficha del Pedido Encontrado */}
        {searchedOrder && (
          <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl mb-8 animate-fadeIn">
            <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400 bg-slate-950 px-3 py-1 rounded-xl border border-emerald-500/30">
                    {searchedOrder.orderCode}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    searchedOrder.status === "completed" 
                      ? "bg-slate-700 text-slate-300 border border-slate-600" 
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                  }`}>
                    {searchedOrder.status === "completed" ? "Entregado" : "Pendiente de Recojo"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-2">
                  {searchedOrder.packName} ({searchedOrder.quantity}x)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-emerald-400" />
                  <span>Horario pactado: <strong className="text-white">{searchedOrder.pickupTime}</strong></span>
                </p>
              </div>

              {/* Botón de Confirmación de Entrega */}
              {searchedOrder.status !== "completed" ? (
                <button
                  type="button"
                  onClick={handleConfirmRedeem}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/30 transition flex items-center justify-center gap-2 text-base shrink-0 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      <span>Validando...</span>
                    </>
                  ) : (
                    <>
                      <PackageCheck className="size-6" />
                      <span>Validar y Entregar Comida</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-slate-700/60 border border-slate-600 px-4 py-2.5 rounded-2xl text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="size-5 text-emerald-400" />
                  <span>Pedido ya canjeado</span>
                </div>
              )}
            </div>

            {/* Detalles del Cliente y Embalaje */}
            <div className="p-6 sm:p-8 grid sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="size-3.5" /> Cliente
                </span>
                <p className="font-extrabold text-white text-base">{searchedOrder.userName}</p>
                <p className="text-xs text-slate-400">{searchedOrder.userEmail || "No especificado"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Pago y Total
                </span>
                <p className="font-extrabold text-emerald-400 text-base">
                  S/ {searchedOrder.totalPrice?.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  Método: {searchedOrder.paymentMethod === "card" ? "Tarjeta" : searchedOrder.paymentMethod === "yape" ? "Yape/Plin" : "En Local"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Leaf className="size-3.5 text-emerald-400" /> Embalaje Ecológico
                </span>
                {searchedOrder.bringOwnContainer ? (
                  <div className="bg-emerald-950/60 border border-emerald-600/40 p-2 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <span>🌱 Trae su propio táper / bolsa</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Envase regular del restaurante</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Historial de Validaciones Recientes */}
        {validatedToday.length > 0 && (
          <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Rescates Entregados Hoy en este Local ({validatedToday.length})</span>
            </h3>
            <div className="space-y-2.5">
              {validatedToday.map((ord) => (
                <div key={ord.id} className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded">
                      {ord.orderCode}
                    </span>
                    <span className="text-white font-semibold">{ord.packName} ({ord.quantity}x)</span>
                    <span className="text-slate-400">• {ord.userName}</span>
                  </div>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    ✓ Entregado
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enlace de navegación de regreso */}
        <div className="mt-12 text-center">
          <Link href="/explore" className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1">
            <span>Volver a la App Principal de EcoRescate</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

      </div>
    </div>
  );
}
