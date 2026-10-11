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
  PlusCircle,
  PackageOpen,
  ArrowRight,
  ExternalLink,
  Plus,
  Minus,
  Check,
  DollarSign,
  Tag
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { verifyOrderByCode, getOrderByCode } from "@/lib/orders";
import { Order } from "@/types";

const ALLIED_RESTAURANTS = [
  { id: "1", name: "La Lucha Sanguchería", logo: "/logos/LaluchaLogo.jpg", address: "Av. Diagonal 308, Miraflores", defaultImage: "/restaurants/LALUCHA.jpg", category: "Sándwiches y Criollo" },
  { id: "2", name: "Punto Azul", logo: "/logos/puntoazul_logo.png", address: "Calle San Martín 595, Miraflores", defaultImage: "/restaurants/PUNTOAZUL.jpg", category: "Pescados y Mariscos" },
  { id: "3", name: "Siete Sopas", logo: "/logos/Sietesopaslogo.png", address: "Av. Arequipa 2394, Lince", defaultImage: "/restaurants/SieteSopas.jpg", category: "Caldos y Sopas" },
  { id: "4", name: "Bodega Verde", logo: "/logos/bodegaverdelogo.jpg", address: "Jirón Sucre 335A, Barranco", defaultImage: "/restaurants/BodegaVerde.jpg", category: "Cafetería y Postres" },
  { id: "5", name: "La Mar", logo: "/logos/lamarlogo.jpg", address: "Av. La Mar 770, Miraflores", defaultImage: "/restaurants/LAMAR.jpg", category: "Cevichería" },
  { id: "6", name: "Roky's", logo: "/logos/rockyslogo.jpg", address: "Av. Benavides 2405, Miraflores", defaultImage: "/restaurants/Rockys.jpg", category: "Pollería y Brasas" },
  { id: "7", name: "Chifa Titi", logo: "/logos/chifatitilogo.jpg", address: "Av. Javier Prado Este 1212, San Borja", defaultImage: "/restaurants/ChifaTiti.jpg", category: "Comida Oriental" },
  { id: "8", name: "Hikari", logo: "/logos/hikarilogo.jpg", address: "Av. La Mar 2339, San Miguel", defaultImage: "/restaurants/Hikari.jpg", category: "Pollería y Chifa" },
];

const PRESET_FOOD_IMAGES = [
  { label: "Sándwiches / Criollo", url: "/restaurants/LALUCHA.jpg" },
  { label: "Ceviche / Pescados", url: "/restaurants/PUNTOAZUL.jpg" },
  { label: "Sopas / Caldos", url: "/restaurants/SieteSopas.jpg" },
  { label: "Cafetería / Dulces", url: "/restaurants/BodegaVerde.jpg" },
  { label: "Marino Gourmet", url: "/restaurants/LAMAR.jpg" },
  { label: "Pollo a la Brasa", url: "/restaurants/Rockys.jpg" },
  { label: "Chifa / Arroz Chaufa", url: "/restaurants/ChifaTiti.jpg" },
  { label: "Lomo Saltado", url: "/restaurants/Hikari.jpg" },
];

export default function PartnerPortalPage() {
  const [activeTab, setActiveTab] = useState<"scanner" | "create" | "manage">("create");
  const [selectedRestaurant, setSelectedRestaurant] = useState(ALLIED_RESTAURANTS[0]);

  // Estados para Validar / Escáner QR
  const [inputCode, setInputCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validatedToday, setValidatedToday] = useState<Order[]>([]);

  // Estados para Publicar Nuevo Pack
  const [packName, setPackName] = useState("Pack Almuerzo Criollo");
  const [originalPrice, setOriginalPrice] = useState(38.00);
  const [rescuePrice, setRescuePrice] = useState(14.90);
  const [packsAvailable, setPacksAvailable] = useState(4);
  const [pickupTime, setPickupTime] = useState("Hoy, 20:30 - 22:00");
  const [selectedImage, setSelectedImage] = useState(ALLIED_RESTAURANTS[0].defaultImage);
  const [packDescription, setPackDescription] = useState("Porciones frescas preparadas durante el turno, perfectamente conservadas y listas para llevar.");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Estados para Mis Packs
  const [restaurantPacks, setRestaurantPacks] = useState<any[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(false);

  // Actualizar imagen por defecto al cambiar de restaurante
  useEffect(() => {
    setSelectedImage(selectedRestaurant.defaultImage);
  }, [selectedRestaurant]);

  // Cargar packs del restaurante seleccionado
  useEffect(() => {
    async function loadPacks() {
      setLoadingPacks(true);
      try {
        const res = await fetch(`/api/packs?restaurantId=${selectedRestaurant.id}`);
        const data = await res.json();
        if (data.success && data.packs) {
          setRestaurantPacks(data.packs);
        }
      } catch (e) {
        console.warn("Error loading packs:", e);
      } finally {
        setLoadingPacks(false);
      }
    }

    if (activeTab === "manage") {
      loadPacks();
    }
  }, [selectedRestaurant.id, activeTab]);

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
        
        // Notificar al cliente que su pedido fue completado
        if (result.order.id) {
          fetch("/api/notifications/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: result.order.id,
              email: result.order.userEmail,
              customerName: result.order.userName,
              type: "order_completed",
            }),
          }).catch((e) => console.warn("Completion notification error:", e));
        }

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

  // Publicar Nuevo Pack Sorpresa
  const handlePublishPack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishSuccess(null);
    setErrorStatus(null);

    try {
      const res = await fetch("/api/packs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: selectedRestaurant.id,
          restaurantName: selectedRestaurant.name,
          packName,
          originalPrice,
          rescuePrice,
          packsAvailable,
          pickupTime,
          imageUrl: selectedImage,
          category: selectedRestaurant.category,
          description: packDescription,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPublishSuccess(`¡"${packName}" publicado exitosamente con ${packsAvailable} packs disponibles!`);
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#16a34a", "#f59e0b", "#38bdf8"]
        });
        // Agregar a la lista local
        if (data.pack) {
          setRestaurantPacks((prev) => [data.pack, ...prev]);
        }
      } else {
        setErrorStatus(data.error || "No se pudo publicar el pack.");
      }
    } catch (err: any) {
      setErrorStatus(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsPublishing(false);
    }
  };

  const discountPercent = originalPrice > 0 
    ? Math.round(((originalPrice - rescuePrice) / originalPrice) * 100)
    : 50;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabecera del Portal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Store className="size-3.5" /> Portal de Restaurantes Aliados
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Panel del Restaurante
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Publica excedentes de comida y valida códigos QR en segundos.
            </p>
          </div>

          {/* Selector de Local */}
          <div className="bg-slate-800/90 p-2.5 rounded-2xl border border-slate-700 min-w-[220px]">
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

        {/* Selector de Pestañas: 1. Publicar Pack | 2. Validar QR | 3. Mis Packs */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-800/90 border border-slate-700 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab("create");
              setErrorStatus(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "create"
                ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PlusCircle className="size-4" />
            <span>Publicar Pack</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("scanner");
              setErrorStatus(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "scanner"
                ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <QrCode className="size-4" />
            <span>Validar QR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("manage");
              setErrorStatus(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "manage"
                ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PackageOpen className="size-4" />
            <span>Mis Packs Activos</span>
          </button>
        </div>

        {/* PESTAÑA 1: PUBLICAR NUEVO PACK */}
        {activeTab === "create" && (
          <div className="space-y-6">
            
            {publishSuccess && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-600 rounded-2xl flex items-center gap-3 text-emerald-200 text-sm animate-fadeIn">
                <CheckCircle2 className="size-6 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <p className="font-extrabold text-white text-base">{publishSuccess}</p>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    El pack ya está visible en el mapa y en la sección de ofertas para todos los comensales.
                  </p>
                </div>
                <Link
                  href="/explore"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap"
                >
                  Ver en Explore ➔
                </Link>
              </div>
            )}

            {errorStatus && (
              <div className="p-4 bg-red-950/70 border border-red-800 rounded-2xl flex items-start gap-3 text-red-200 text-sm">
                <AlertTriangle className="size-5 text-red-400 shrink-0 mt-0.5" />
                <p className="font-bold">{errorStatus}</p>
              </div>
            )}

            <form onSubmit={handlePublishPack} className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles className="size-5 text-amber-400" />
                    <span>Publicar Comida Sobrante del Día</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Salva raciones en buen estado que no se vendieron hoy en <strong>{selectedRestaurant.name}</strong>.
                  </p>
                </div>
                <div className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">
                  -{discountPercent}% OFF
                </div>
              </div>

              {/* Plantillas Rápidas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Atajo: Cargar Plantilla Rápida
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Pack Criollo Especial", normal: 38, rescue: 14.90, img: "/restaurants/LALUCHA.jpg" },
                    { name: "Pack Marino Ceviche & Causa", normal: 52, rescue: 19.90, img: "/restaurants/PUNTOAZUL.jpg" },
                    { name: "Pack 1/4 Pollo a la Brasa", normal: 26, rescue: 11.90, img: "/restaurants/Rockys.jpg" },
                    { name: "Pack Sopas Reconfortante", normal: 34, rescue: 14.90, img: "/restaurants/SieteSopas.jpg" },
                    { name: "Pack Chifa Aeropuerto Salvaje", normal: 42, rescue: 16.90, img: "/restaurants/ChifaTiti.jpg" },
                    { name: "Pack Café & Postres del Día", normal: 28, rescue: 12.50, img: "/restaurants/BodegaVerde.jpg" },
                  ].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPackName(preset.name);
                        setOriginalPrice(preset.normal);
                        setRescuePrice(preset.rescue);
                        setSelectedImage(preset.img);
                      }}
                      className="bg-slate-900/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre del Pack */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Nombre del Pack Sorpresa *
                </label>
                <input
                  type="text"
                  required
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="Ej. Pack Criollo con Guarnición"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Precios y Cantidad */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Precio Regular (S/) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-bold">S/</span>
                    <input
                      type="number"
                      step="0.10"
                      required
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                    Precio Rescate (S/) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs text-emerald-500 font-bold">S/</span>
                    <input
                      type="number"
                      step="0.10"
                      required
                      value={rescuePrice}
                      onChange={(e) => setRescuePrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl pl-9 pr-3 py-2.5 text-emerald-400 text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Raciones Disponibles *
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setPacksAvailable((c) => Math.max(1, c - 1))}
                      className="size-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="flex-1 text-center font-bold text-white text-sm">
                      {packsAvailable} packs
                    </span>
                    <button
                      type="button"
                      onClick={() => setPacksAvailable((c) => c + 1)}
                      className="size-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Horario de Recojo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Horario de Recojo en el Local *
                </label>
                <div className="grid sm:grid-cols-3 gap-2 mb-2">
                  {[
                    "Hoy, 15:30 - 17:00",
                    "Hoy, 20:30 - 22:00",
                    "Hoy, 22:00 - 23:30",
                  ].map((time, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPickupTime(time)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        pickupTime === time
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                          : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder="O escribe horario personalizado (ej. Mañana, 12:00 - 13:30)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Selector de Fotografía del Plato */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Fotografía de Presentación
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_FOOD_IMAGES.map((img, i) => {
                    const isSelected = selectedImage === img.url;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedImage(img.url)}
                        title={img.label}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                          isSelected
                            ? "border-emerald-400 ring-2 ring-emerald-500/30 scale-105"
                            : "border-slate-700 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 size-4 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 text-[10px] font-bold shadow">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón de Publicación */}
              <button
                type="submit"
                disabled={isPublishing}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 text-base disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Publicando en EcoRescate...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    <span>Publicar {packsAvailable} Packs (S/ {rescuePrice.toFixed(2)} c/u)</span>
                  </>
                )}
              </button>
            </form>

          </div>
        )}

        {/* PESTAÑA 2: VALIDAR / ESCÁNER QR */}
        {activeTab === "scanner" && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <QrCode className="absolute left-4 top-3.5 size-5 text-slate-400" />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Ingresa código del cliente (ej. ECO-5821)"
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
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="size-5" />
                      <span>Consultar Pedido</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Mensajes de Estado */}
            {errorStatus && (
              <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-start gap-3 text-red-200 text-sm animate-fadeIn">
                <AlertTriangle className="size-5 text-red-400 shrink-0 mt-0.5" />
                <p className="font-bold">{errorStatus}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-emerald-950/70 border border-emerald-700 rounded-2xl flex items-center gap-3 text-emerald-200 text-sm animate-fadeIn">
                <CheckCircle2 className="size-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-extrabold text-base text-white">{successMessage}</p>
                  <p className="text-xs text-emerald-300/90 mt-0.5">El pack fue registrado como entregado en la base de datos de EcoRescate.</p>
                </div>
              </div>
            )}

            {/* Ficha del Pedido Encontrado */}
            {searchedOrder && (
              <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
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
                      Monto Pagado
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
                      <Leaf className="size-3.5 text-emerald-400" /> Embalaje
                    </span>
                    {searchedOrder.bringOwnContainer ? (
                      <div className="bg-emerald-950/60 border border-emerald-600/40 p-2 rounded-xl text-emerald-300 text-xs font-bold">
                        🌱 Trae táper / bolsa propia (+25 pts)
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Envase regular del restaurante</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: MIS PACKS ACTIVOS */}
        {activeTab === "manage" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Packs Publicados en {selectedRestaurant.name}</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {restaurantPacks.length}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="size-3.5" />
                <span>Nuevo Pack</span>
              </button>
            </div>

            {loadingPacks ? (
              <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-emerald-400" />
                <span>Cargando packs del restaurante...</span>
              </div>
            ) : restaurantPacks.length === 0 ? (
              <div className="bg-slate-800/80 rounded-3xl p-10 border border-slate-700 text-center">
                <PackageOpen className="size-12 text-slate-500 mx-auto mb-3" />
                <p className="text-white font-bold text-sm">Aún no hay packs publicados para este restaurante</p>
                <p className="text-slate-400 text-xs mt-1">Haz clic en &ldquo;Publicar Pack&rdquo; para agregar comida sobrante del día.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("create")}
                  className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1"
                >
                  <Plus className="size-3.5" /> Publicar Primer Pack
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {restaurantPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                        <img src={pack.imageUrl || "/restaurants/LALUCHA.jpg"} alt={pack.packName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{pack.packName}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            (pack.packsAvailable ?? 0) > 0 
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}>
                            {(pack.packsAvailable ?? 0) > 0 ? `${pack.packsAvailable} disponibles` : "Agotado"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Recojo: <strong className="text-slate-200">{pack.pickupTime}</strong> • S/ {pack.rescuePrice?.toFixed(2)}{" "}
                          <span className="line-through text-slate-500 text-[11px]">S/ {pack.originalPrice?.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/checkout/${pack.id}`}
                      className="bg-slate-900 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-end sm:self-auto"
                    >
                      <span>Ver Checkout</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Enlace de regreso al marketplace */}
        <div className="mt-12 text-center">
          <Link href="/explore" className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1">
            <span>Ir al mapa y catálogo de comensales en EcoRescate</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

      </div>
    </div>
  );
}
