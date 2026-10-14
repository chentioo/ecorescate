"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Truck, 
  Store, 
  ShieldCheck, 
  CheckCircle2, 
  Leaf, 
  Sparkles, 
  CreditCard, 
  Wallet, 
  Banknote,
  Minus,
  Plus,
  Loader2,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createOrder } from "@/lib/orders";
import { 
  VisaLogo, 
  MastercardLogo, 
  AmexLogo, 
  YapeLogo, 
  PlinLogo, 
  YapePlinQR 
} from "@/components/ui/PaymentLogos";

const FALLBACK_PACKS: Record<string, any> = {
  "1": {
    restaurantId: "1",
    restaurantName: "La Lucha Sanguchería",
    packName: "Pack Criollo Especial",
    originalPrice: 38.90,
    rescuePrice: 14.90,
    imageUrl: "/restaurants/LALUCHA.jpg",
    pickupTime: "20:00 - 21:30",
    address: "Av. Diagonal 308, Miraflores",
    location: { lat: -12.122114, lng: -77.030999 },
    packsAvailable: 3,
  },
  "2": {
    restaurantId: "2",
    restaurantName: "Punto Azul",
    packName: "Pack Marino",
    originalPrice: 52.00,
    rescuePrice: 19.90,
    imageUrl: "/restaurants/PUNTOAZUL.jpg",
    pickupTime: "16:00 - 17:00",
    address: "Calle San Martín 595, Miraflores",
    location: { lat: -12.120563, lng: -77.027063 },
    packsAvailable: 5,
  },
  "3": {
    restaurantId: "3",
    restaurantName: "Siete Sopas",
    packName: "Pack Sopa Menestrón",
    originalPrice: 34.00,
    rescuePrice: 14.90,
    imageUrl: "/restaurants/SieteSopas.jpg",
    pickupTime: "22:00 - 23:30",
    address: "Av. Arequipa 2394, Lince",
    location: { lat: -12.096316, lng: -77.034503 },
    packsAvailable: 2,
  },
  "4": {
    restaurantId: "4",
    restaurantName: "Bodega Verde",
    packName: "Pack Desayuno Saludable",
    originalPrice: 28.50,
    rescuePrice: 12.90,
    imageUrl: "/restaurants/BodegaVerde.jpg",
    pickupTime: "11:30 - 12:30",
    address: "Jirón Sucre 335A, Barranco",
    location: { lat: -12.148152, lng: -77.021759 },
    packsAvailable: 2,
  },
  "5": {
    restaurantId: "5",
    restaurantName: "La Mar",
    packName: "Pack Ceviche Clásico",
    originalPrice: 79.00,
    rescuePrice: 29.90,
    imageUrl: "/restaurants/LAMAR.jpg",
    pickupTime: "15:00 - 16:30",
    address: "Av. La Mar 770, Miraflores",
    location: { lat: -12.1152, lng: -77.0425 },
    packsAvailable: 2,
  },
  "6": {
    restaurantId: "6",
    restaurantName: "Roky's",
    packName: "Pack 1/4 Pollo",
    originalPrice: 26.90,
    rescuePrice: 11.90,
    imageUrl: "/restaurants/Rockys.jpg",
    pickupTime: "21:30 - 23:00",
    address: "Av. Benavides 2405, Miraflores",
    location: { lat: -12.1264, lng: -77.0253 },
    packsAvailable: 4,
  },
  "7": {
    restaurantId: "7",
    restaurantName: "Chifa Titi",
    packName: "Pack Chaufa Salvaje",
    originalPrice: 59.00,
    rescuePrice: 22.90,
    imageUrl: "/restaurants/ChifaTiti.jpg",
    pickupTime: "19:00 - 20:30",
    address: "Av. Javier Prado Este 1212, San Borja",
    location: { lat: -12.0934, lng: -77.0051 },
    packsAvailable: 1,
  },
  "8": {
    restaurantId: "8",
    restaurantName: "Hikari",
    packName: "Pack Lomo Saltado",
    originalPrice: 44.90,
    rescuePrice: 17.90,
    imageUrl: "/restaurants/Hikari.jpg",
    pickupTime: "22:00 - 23:00",
    address: "Av. La Mar 2339, San Miguel",
    location: { lat: -12.0743, lng: -77.0821 },
    packsAvailable: 3,
  }
};

export default function CheckoutPage({ params }: { params: Promise<{ packId: string }> }) {
  const resolvedParams = use(params);
  const packId = resolvedParams.packId;
  const router = useRouter();
  const { user, profile, refreshUserProfile } = useAuth();

  const [packData, setPackData] = useState<any>(FALLBACK_PACKS[packId] || FALLBACK_PACKS["1"]);
  const [loadingPack, setLoadingPack] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "yape" | "cash">("card");
  const [bringOwnContainer, setBringOwnContainer] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de Pasarela de Pago
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpDate, setCardExpDate] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("420");
  const [cardholderName, setCardholderName] = useState("");
  const [yapeOperationCode, setYapeOperationCode] = useState("847291");

  const isPrime = profile?.isPrime ?? false;

  // Si el usuario tiene configurado llevar su táper por defecto, preseleccionarlo
  useEffect(() => {
    if (profile?.defaultBringContainer) {
      setBringOwnContainer(true);
    }
  }, [profile?.defaultBringContainer]);

  // Cargar datos reales del pack desde Firestore
  useEffect(() => {
    async function fetchLivePack() {
      try {
        const docRef = doc(db, "packs", packId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const liveData = snap.data();
          // Cargar datos del restaurante asociado si existen
          let restAddress = liveData.address || "";
          let restLocation = liveData.location;
          if (liveData.restaurantId) {
            try {
              const rRef = doc(db, "restaurants", liveData.restaurantId);
              const rSnap = await getDoc(rRef);
              if (rSnap.exists()) {
                const rData = rSnap.data();
                restAddress = rData.address || restAddress;
                restLocation = rData.location || restLocation;
              }
            } catch (e) {}
          }

          setPackData({
            ...FALLBACK_PACKS[packId],
            ...liveData,
            address: restAddress || FALLBACK_PACKS[packId]?.address || "Lima, Perú",
            location: restLocation || FALLBACK_PACKS[packId]?.location || { lat: -12.122, lng: -77.031 },
          });
        }
      } catch (err) {
        console.warn("Using fallback pack data:", err);
      } finally {
        setLoadingPack(false);
      }
    }

    fetchLivePack();
  }, [packId]);

  const maxStock = Math.max(1, packData?.packsAvailable ?? 3);
  const unitPrice = packData?.rescuePrice || 14.90;
  const originalPrice = packData?.originalPrice || 35.00;
  const subtotal = unitPrice * quantity;
  const deliveryCost = deliveryMethod === "delivery" ? (isPrime ? 0 : 5.00) : 0;
  const total = Number((subtotal + deliveryCost).toFixed(2));
  const totalMoneySaved = Number(((originalPrice - unitPrice) * quantity).toFixed(2));
  const totalCo2Saved = Number((2.5 * quantity).toFixed(1));

  const handlePayment = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStep("Verificando disponibilidad de raciones...");

    try {
      // 1. Crear el pedido en el servidor con transacción atómica
      const order = await createOrder({
        userId: user.uid,
        userName: profile?.name || user.displayName || user.email?.split("@")[0] || "Usuario EcoRescate",
        userEmail: user.email || "",
        restaurantId: packData.restaurantId || "1",
        restaurantName: packData.restaurantName || "Restaurante Aliado",
        restaurantAddress: packData.address || "Lima, Perú",
        restaurantLocation: packData.location,
        packId,
        packName: packData.packName || "Pack Sorpresa",
        packImageUrl: packData.imageUrl || "/restaurants/LALUCHA.jpg",
        quantity,
        unitPrice,
        originalPrice,
        pickupTime: packData.pickupTime || "Hoy, 20:00 - 21:30",
        deliveryMethod,
        deliveryCost,
        paymentMethod,
        bringOwnContainer,
        notes: orderNotes,
      });

      // 2. Procesar pago a través de la pasarela segura
      setProcessingStep("Autorizando transacción con pasarela bancaria...");
      const paymentRes = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          userId: user.uid,
          amount: total,
          currency: "PEN",
          paymentMethod,
          cardInput: paymentMethod === "card" ? {
            cardNumber,
            expDate: cardExpDate,
            cvv: cardCvv,
            cardholderName: cardholderName || profile?.name || user.displayName || "Cliente EcoRescate",
          } : undefined,
          yapeOperationCode: paymentMethod === "yape" ? yapeOperationCode : undefined,
          customerEmail: user.email || "",
          customerName: profile?.name || user.displayName || "Cliente EcoRescate",
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok || !paymentData.success) {
        throw new Error(paymentData.error || "El pago no pudo ser autorizado por la pasarela.");
      }

      setProcessingStep("¡Pago aprobado! Generando comprobante y código QR...");

      // Actualizar perfil local reactivo inmediatamente
      try {
        await refreshUserProfile();
      } catch (e) {}

      router.push(`/order/${order.id}?type=${deliveryMethod}`);
    } catch (err: any) {
      console.error("Error al procesar reserva y pago:", err);
      setErrorMessage(err.message || "No se pudo procesar el pago. Por favor verifica tus datos e intenta de nuevo.");
      setIsProcessing(false);
      setProcessingStep(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header de Navegación */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-100 transition"
              title="Volver"
            >
              <ArrowLeft className="size-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Confirmar Reserva</h1>
              <p className="text-xs sm:text-sm text-slate-500">Último paso para rescatar este pack de comida</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <Leaf className="size-4 text-primary" />
            <span>Rescate Ecológico</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertTriangle className="size-5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Opciones y Pago (2 columnas) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card del Pack Rescatado y Cantidad */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex gap-4 items-center">
                  <div className="relative size-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                    <img 
                      src={packData.imageUrl} 
                      alt={packData.packName} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md">
                      {packData.restaurantName}
                    </span>
                    <h2 className="font-extrabold text-lg text-slate-900 mt-1">
                      {packData.packName}
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Clock className="size-3.5 text-primary" />
                      <span>Horario de recojo: <strong>{packData.pickupTime}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Selector de Cantidad */}
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="size-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="font-bold text-slate-900 px-2 text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    disabled={quantity >= maxStock}
                    className="size-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Impacto Positivo Inmediato */}
              <div className="pt-4 grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Leaf className="size-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-emerald-700 font-semibold">CO2 que evitas</p>
                    <p className="text-base font-extrabold text-emerald-900">{totalCo2Saved} kg</p>
                  </div>
                </div>

                <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-amber-700 font-semibold">Tu ahorro directo</p>
                    <p className="text-base font-extrabold text-amber-900">S/ {totalMoneySaved.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opciones de Entrega */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>Método de Entrega</span>
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Recojo en Tienda */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    deliveryMethod === "pickup" 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Store className={`size-6 ${deliveryMethod === "pickup" ? "text-primary" : "text-slate-400"}`} />
                    {deliveryMethod === "pickup" && <CheckCircle2 className="size-5 text-primary" />}
                  </div>
                  <h4 className="font-bold text-slate-900">Recojo en Local</h4>
                  <p className="text-xs text-slate-500 mt-1">Gratis. Muestras tu código QR en el mostrador.</p>
                  <p className="text-[11px] font-semibold text-primary mt-2">
                    📍 {packData.address}
                  </p>
                </button>

                {/* Delivery Ecológico */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                    deliveryMethod === "delivery" 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Truck className={`size-6 ${deliveryMethod === "delivery" ? "text-primary" : "text-slate-400"}`} />
                    {deliveryMethod === "delivery" && <CheckCircle2 className="size-5 text-primary" />}
                    {isPrime && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        Prime Gratis
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900">Delivery Ecológico</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Repartidores en bicicleta eléctrica sin emisiones.
                  </p>
                  <p className="text-[11px] font-bold mt-2">
                    {isPrime ? (
                      <span className="text-primary font-bold">S/ 0.00 (Incluido en Prime)</span>
                    ) : (
                      <span className="text-slate-700">+ S/ 5.00 de envío</span>
                    )}
                  </p>
                </button>
              </div>

              {!isPrime && (
                <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-center sm:text-left">
                    <h5 className="font-bold text-amber-900 text-xs">¿Quieres delivery gratis ilimitado?</h5>
                    <p className="text-[11px] text-amber-700">Con EcoRescate Prime tienes envíos ecológicos sin costo.</p>
                  </div>
                  <Link 
                    href="/prime" 
                    className="whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
                  >
                    Activar Prime
                  </Link>
                </div>
              )}
            </div>

            {/* Método de Pago */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Método de Pago</h3>
              
              <div className="space-y-3">
                {/* Opción 1: Tarjeta */}
                <div>
                  <label className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "card" ? "border-primary bg-primary/5 rounded-b-none" : "border-slate-200 hover:border-slate-300"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === "card"} 
                        onChange={() => setPaymentMethod("card")} 
                        className="accent-primary size-4" 
                      />
                      <CreditCard className="size-5 text-slate-600" />
                      <span className="font-semibold text-sm text-slate-800">Tarjeta Débito / Crédito</span>
                    </div>
                    {/* Logos Reales: Visa, MC, Amex */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <VisaLogo className="h-5 w-auto rounded shadow-xs" />
                      <MastercardLogo className="h-5 w-auto rounded shadow-xs" />
                      <AmexLogo className="h-5 w-auto rounded shadow-xs" />
                    </div>
                  </label>
                  {paymentMethod === "card" && (
                    <div className="p-4 border-2 border-t-0 border-primary rounded-b-2xl bg-primary/5 space-y-3 animate-fadeIn">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Número de Tarjeta (Visa, Mastercard o Amex):
                        </label>
                        <input 
                          type="text" 
                          placeholder="4242 4242 4242 4242" 
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                            const formatted = val.replace(/(.{4})/g, "$1 ").trim();
                            setCardNumber(formatted);
                          }}
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono bg-white font-semibold" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Expiración (MM/AA):
                          </label>
                          <input 
                            type="text" 
                            placeholder="MM/AA" 
                            value={cardExpDate}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                              if (val.length >= 3) {
                                val = `${val.slice(0, 2)}/${val.slice(2)}`;
                              }
                              setCardExpDate(val);
                            }}
                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono text-center bg-white font-semibold" 
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            CVV (Seguridad):
                          </label>
                          <input 
                            type="password" 
                            placeholder="•••" 
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            maxLength={4}
                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono text-center bg-white font-semibold" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Titular de la tarjeta:
                        </label>
                        <input 
                          type="text" 
                          placeholder="Nombre y Apellidos" 
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-xs bg-white" 
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                        <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                        <span>Encriptación SSL 256-bit y protocolo seguro 3D Secure activo.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Opción 2: Yape / Plin */}
                <div>
                  <label className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "yape" ? "border-purple-500 bg-purple-50/80 rounded-b-none" : "border-slate-200 hover:border-slate-300"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === "yape"} 
                        onChange={() => setPaymentMethod("yape")} 
                        className="accent-purple-600 size-4" 
                      />
                      <Wallet className="size-5 text-purple-600" />
                      <span className="font-semibold text-sm text-slate-800">Billeteras Digitales</span>
                    </div>
                    {/* Logos Reales: Yape, Plin */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <YapeLogo className="h-6 w-auto rounded shadow-xs" />
                      <PlinLogo className="h-6 w-auto rounded shadow-xs" />
                    </div>
                  </label>
                  {paymentMethod === "yape" && (
                    <div className="p-4 border-2 border-t-0 border-purple-500 rounded-b-2xl bg-purple-50/80 flex flex-col items-center animate-fadeIn">
                      <YapePlinQR amount={total} />
                      <div className="w-full max-w-xs mt-3">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1 text-center">
                          Ingresa los dígitos de la constancia (6-8 dígitos):
                        </label>
                        <input 
                          type="text" 
                          placeholder="N° Operación (ej. 847291)" 
                          value={yapeOperationCode}
                          onChange={(e) => setYapeOperationCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                          className="w-full p-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-center tracking-widest font-mono bg-white font-bold" 
                          maxLength={8} 
                        />
                        <p className="text-[10px] text-center text-purple-700/80 mt-1">
                          Verificación antifraude instantánea en pasarela.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Opción 3: Pago en Local */}
                <div>
                  <label className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === "cash"} 
                        onChange={() => setPaymentMethod("cash")} 
                        className="accent-primary size-4" 
                      />
                      <Banknote className="size-5 text-emerald-600" />
                      <span className="font-semibold text-sm text-slate-800">Pago en Tienda al Recoger</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Efectivo o tarjeta en local</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Compromiso Ecológico */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-3xl p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bringOwnContainer}
                  onChange={(e) => setBringOwnContainer(e.target.checked)}
                  className="size-5 rounded border-emerald-300 text-primary focus:ring-primary mt-0.5"
                />
                <div>
                  <p className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    🌱 Llevaré mi propio táper o bolsa reutilizable
                    <span className="text-[10px] bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">+25 Puntos Eco</span>
                  </p>
                  <p className="text-xs text-emerald-800/80 mt-0.5">
                    Ayúdanos a lograr una entrega 100% libre de plásticos de un solo uso.
                  </p>
                </div>
              </label>
            </div>

          </div>

          {/* Columna Derecha: Resumen de Orden y Botón Pagar (1 columna) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Resumen del Rescate</h3>
              
              <div className="space-y-3 text-sm text-slate-600 pb-4 border-b border-slate-100">
                <div className="flex justify-between">
                  <span>Precio Original ({quantity}x)</span>
                  <span className="line-through text-slate-400">S/ {(originalPrice * quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Subtotal Rescate ({quantity}x)</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                {deliveryMethod === "delivery" && (
                  <div className="flex justify-between items-center">
                    <span>Envío Ecológico</span>
                    {isPrime ? (
                      <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-0.5 rounded">Gratis (Prime)</span>
                    ) : (
                      <span>S/ {deliveryCost.toFixed(2)}</span>
                    )}
                  </div>
                )}
                {bringOwnContainer && (
                  <div className="flex justify-between text-emerald-700 font-medium text-xs">
                    <span>Bolsa / Táper Propio</span>
                    <span>+25 pts</span>
                  </div>
                )}
              </div>

              {/* Total y Ahorro */}
              <div className="py-4 border-b border-slate-100">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-base font-bold text-slate-900">Total a Pagar</span>
                  <span className="text-2xl font-extrabold text-primary">S/ {total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-emerald-700 font-semibold text-right">
                  🎉 Estás ahorrando S/ {totalMoneySaved.toFixed(2)}
                </p>
              </div>

              {/* Garantía */}
              <div className="bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-500 my-5 flex gap-2.5 items-center">
                <ShieldCheck className="size-4 shrink-0 text-primary" />
                <p>Tu comida está garantizada, fresca y lista en el horario indicado.</p>
              </div>

              {/* Botón Acción Principal */}
              <button 
                type="button"
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-leaf-deep text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 text-base"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-sm">{processingStep || "Procesando pago seguro..."}</span>
                  </>
                ) : (
                  <>
                    <span>Pagar y Rescatar Alimentos (S/ {total.toFixed(2)})</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400 mt-3">
                Al confirmar, se descontará el stock y recibirás tu código QR de recojo.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
