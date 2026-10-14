"use client";

import { 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Star, 
  Sparkles, 
  ArrowRight,
  CreditCard,
  Wallet,
  Crown,
  Loader2,
  Lock,
  Check
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useAuth } from "@/components/auth/AuthProvider";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  VisaLogo, 
  MastercardLogo, 
  AmexLogo, 
  YapeLogo, 
  PlinLogo, 
  YapePlinQR 
} from "@/components/ui/PaymentLogos";

export default function PrimePage() {
  const { user, profile, refreshUserProfile } = useAuth();
  const router = useRouter();

  const [isAnnual, setIsAnnual] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "yape">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  // Ya es Prime?
  const alreadyPrime = profile?.isPrime ?? false;

  useEffect(() => {
    if (user?.email && user.email.toLowerCase().endsWith(".edu.pe")) {
      setIsStudent(true);
    }
  }, [user]);

  // Precios
  const monthlyPrice = isStudent ? 9.90 : 19.90;
  const annualMonthlyEquivalent = isStudent ? 7.90 : 15.90;
  const annualTotal = Number((annualMonthlyEquivalent * 12).toFixed(2));
  const finalPrice = isAnnual ? annualTotal : monthlyPrice;

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Procesar pago en pasarela de pagos
      const primeOrderId = `prime-${user.uid.slice(0, 6)}-${Date.now()}`;
      try {
        await fetch("/api/payments/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: primeOrderId,
            userId: user.uid,
            amount: finalPrice,
            currency: "PEN",
            paymentMethod,
            customerEmail: user.email || "",
            customerName: profile?.name || user.displayName || "Socio Prime",
          }),
        });
      } catch (err) {
        console.warn("Prime payment gateway notice:", err);
      }

      // 2. Guardar suscripción Prime en Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        isPrime: true,
        primePlan: isAnnual ? "annual" : "monthly",
        primePrice: finalPrice,
        primePaymentMethod: paymentMethod,
        primeSubscribedAt: serverTimestamp(),
      }, { merge: true });

      // 3. Actualizar estado local reactivo
      await refreshUserProfile();

      setIsSubscribed(true);

      // 4. Efecto de celebración
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#16a34a", "#f59e0b", "#742384", "#00d2d3"]
      });
    } catch (e) {
      console.error("Error al procesar suscripción Prime:", e);
      setIsSubscribed(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Pantalla de Éxito / Ya Suscrito
  if (isSubscribed || alreadyPrime) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center mb-6 border-4 border-amber-300 shadow-lg shadow-amber-200/50 animate-bounce">
          <Crown className="size-12 text-amber-500 fill-amber-500" />
        </div>
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-200 mb-3">
          <Sparkles className="size-3.5" /> MEMBRESÍA ACTIVA
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
          ¡{isSubscribed ? "Bienvenido a" : "Ya eres parte de"} EcoRescate Prime!
        </h1>
        <p className="text-slate-600 max-w-md mx-auto mb-8 text-base">
          Disfrutas de <strong>Delivery Gratuito Ecológico</strong> en todos tus pedidos, acceso preferente a packs gourmet y 1 árbol plantado por mes en tu nombre.
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full mx-auto mb-8 shadow-sm text-left text-sm space-y-2.5">
          <div className="flex justify-between items-center text-slate-700">
            <span>Beneficio Delivery:</span>
            <span className="font-bold text-emerald-600">S/ 0.00 Ilimitado</span>
          </div>
          <div className="flex justify-between items-center text-slate-700">
            <span>Insignia de Perfil:</span>
            <span className="font-bold text-amber-600 flex items-center gap-1">
              <Crown className="size-3.5" /> Corona Prime
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-700">
            <span>Estado:</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">Activo</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/explore" 
            className="bg-primary hover:bg-leaf-deep text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2"
          >
            Explorar packs disponibles <ArrowRight className="size-4" />
          </Link>
          <Link 
            href="/profile" 
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-8 py-3.5 rounded-xl shadow-sm transition flex items-center justify-center"
          >
            Ver en Mi Perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-bold border border-amber-500/30 mb-6 shadow-sm animate-apple-fade-up">
            <Crown className="size-4 text-amber-400" /> EcoRescate Prime
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 animate-apple-fade-up stagger-1">
            Salva comida con Delivery Ecológico Ilimitado.
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 animate-apple-fade-up stagger-2">
            Únete a nuestra membresía premium y disfruta de envíos sin costo en bicicletas eléctricas, prioridad en packs sorpresa y siembra de árboles en la Amazonía.
          </p>

          {!isStudent && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 max-w-lg mx-auto backdrop-blur-sm animate-apple-fade-up stagger-3">
              <p className="text-amber-100 text-sm">
                <strong className="text-amber-400">🎓 ¿Estudias en la universidad?</strong><br />
                Inicia sesión con tu correo <span className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-amber-200">.edu.pe</span> y obtén <strong>50% de descuento</strong> automático.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Pricing, Payment & Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Beneficios (5 columnas) */}
          <div className="lg:col-span-5 space-y-6 pt-2 animate-apple-fade-up stagger-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ¿Por qué ser miembro Prime?
            </h2>
            <p className="text-slate-500 text-sm">
              Diseñado para comensales frecuentes que quieren ahorrar más dinero y maximizar su impacto verde.
            </p>
            
            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs apple-card">
              <div className="shrink-0 size-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Truck className="size-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Delivery Gratis Ilimitado</h3>
                <p className="text-slate-600 text-xs">Sin costo de envío en todos tus rescates con mensajeros en bicicleta y motos eléctricas.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs apple-card">
              <div className="shrink-0 size-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="size-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Acceso Anticipado</h3>
                <p className="text-slate-600 text-xs">Recibe alertas 30 minutos antes en los packs más cotizados de La Mar, Punto Azul y La Lucha.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs apple-card">
              <div className="shrink-0 size-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Star className="size-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">1 Árbol Plantado al Mes</h3>
                <p className="text-slate-600 text-xs">Financiamos la reforestación comunitaria de especies nativas en la Amazonía peruana.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 apple-card">
              <p className="text-xs text-amber-900 flex items-center gap-1.5 font-bold">
                <Lock className="size-3.5 text-amber-600" />
                <span>Cancela en cualquier momento sin penalidad</span>
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                Puedes darte de baja desde la configuración de tu cuenta con un solo clic.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Suscripción con Métodos de Pago (7 columnas) */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 relative overflow-hidden animate-apple-fade-up stagger-2">
            <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
            
            {/* Selector de Ciclo de Facturación */}
            <div className="flex justify-center mb-6">
              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 font-semibold text-xs sm:text-sm">
                <button 
                  type="button"
                  onClick={() => setIsAnnual(false)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 apple-btn ${
                    !isAnnual ? "bg-white shadow-xs text-slate-900 font-bold" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Mensual
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAnnual(true)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 apple-btn ${
                    isAnnual ? "bg-white shadow-xs text-slate-900 font-bold" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span>Anual</span>
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Ahorra 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Precio Destacado */}
            <div className="text-center mb-6 pb-6 border-b border-slate-100">
              {isStudent && (
                <div className="mb-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                  <Check className="size-3.5" /> Descuento Estudiante Universitario (.edu.pe)
                </div>
              )}
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900">
                  S/ {isAnnual ? annualMonthlyEquivalent.toFixed(2) : monthlyPrice.toFixed(2)}
                </span>
                <span className="text-slate-500 font-medium text-sm">/mes</span>
              </div>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                {isAnnual 
                  ? `Cobro único anual de S/ ${annualTotal.toFixed(2)} (equivalente a S/ ${annualMonthlyEquivalent.toFixed(2)}/mes)`
                  : "Cobro mensual de S/ " + monthlyPrice.toFixed(2) + " facturado cada 30 días"}
              </p>
            </div>

            {/* SECCIÓN DE MÉTODOS DE PAGO */}
            <div className="mb-6">
              <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center justify-between">
                <span>Elige tu Método de Pago</span>
                <span className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                  <Lock className="size-3 text-emerald-600" /> Pago seguro cifrado
                </span>
              </h3>

              <div className="space-y-3">
                {/* Opción 1: Tarjeta de Débito / Crédito */}
                <div>
                  <label className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "card" 
                      ? "border-amber-500 bg-amber-50/50 rounded-b-none" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="prime_payment" 
                        checked={paymentMethod === "card"} 
                        onChange={() => setPaymentMethod("card")} 
                        className="accent-amber-500 size-4" 
                      />
                      <CreditCard className="size-5 text-slate-700" />
                      <span className="font-bold text-sm text-slate-800">Tarjeta Débito / Crédito</span>
                    </div>
                    {/* Logos Oficiales: Visa, Mastercard, Amex */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <VisaLogo className="h-5 w-auto rounded shadow-2xs" />
                      <MastercardLogo className="h-5 w-auto rounded shadow-2xs" />
                      <AmexLogo className="h-5 w-auto rounded shadow-2xs" />
                    </div>
                  </label>
                  
                  {paymentMethod === "card" && (
                    <div className="p-4 border-2 border-t-0 border-amber-500 rounded-b-2xl bg-amber-50/40 space-y-3 animate-fadeIn">
                      <input 
                        type="text" 
                        placeholder="Número de tarjeta (ej. 4557 ...)" 
                        defaultValue="4557 9102 3847 1190"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono bg-white" 
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="MM/AA" 
                          defaultValue="08/29"
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono text-center bg-white" 
                        />
                        <input 
                          type="text" 
                          placeholder="CVV" 
                          defaultValue="781"
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono text-center bg-white" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Opción 2: Billeteras Digitales (Yape / Plin) */}
                <div>
                  <label className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "yape" 
                      ? "border-purple-500 bg-purple-50/50 rounded-b-none" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="prime_payment" 
                        checked={paymentMethod === "yape"} 
                        onChange={() => setPaymentMethod("yape")} 
                        className="accent-purple-600 size-4" 
                      />
                      <Wallet className="size-5 text-purple-600" />
                      <span className="font-bold text-sm text-slate-800">Billeteras Digitales</span>
                    </div>
                    {/* Logos Oficiales: Yape, Plin */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <YapeLogo className="h-6 w-auto rounded shadow-2xs" />
                      <PlinLogo className="h-6 w-auto rounded shadow-2xs" />
                    </div>
                  </label>

                  {paymentMethod === "yape" && (
                    <div className="p-4 border-2 border-t-0 border-purple-500 rounded-b-2xl bg-purple-50/40 flex flex-col items-center animate-fadeIn">
                      <YapePlinQR amount={finalPrice} />
                      <div className="w-full max-w-xs mt-3">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1 text-center">
                          Ingresa los últimos 6 dígitos de tu constancia Yape/Plin:
                        </label>
                        <input 
                          type="text" 
                          placeholder="N° Operación (ej. 518290)" 
                          defaultValue="518290"
                          className="w-full p-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-center tracking-widest font-mono bg-white font-bold" 
                          maxLength={8} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botón de Confirmación de Suscripción */}
            <button 
              type="button"
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="apple-btn w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/20 text-base flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span>Activando tu membresía Prime...</span>
                </>
              ) : (
                <>
                  <Crown className="size-5 text-amber-400" />
                  <span>
                    Activar EcoRescate Prime (S/ {finalPrice.toFixed(2)})
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400 mt-3.5">
              Al confirmar, tu cuenta se actualizará a Prime inmediatamente con envíos gratis.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
