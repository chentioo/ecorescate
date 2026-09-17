"use client";

import { CheckCircle2, ShieldCheck, Truck, Star, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export default function PrimePage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('ecoRescateUser');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.email && user.email.toLowerCase().endsWith('.edu.pe')) {
            setIsStudent(true);
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleSubscribe = () => {
    // Simular suscripción
    setIsSubscribed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecoRescatePrime', 'true');
    }
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#f59e0b', '#ffffff']
    });
  };

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 border-4 border-amber-200">
          <Star className="size-10 text-amber-500 fill-amber-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">¡Bienvenido a EcoRescate Prime!</h1>
        <p className="text-slate-600 max-w-md mx-auto mb-8">
          A partir de ahora, todos tus pedidos tendrán <strong>Delivery Gratuito Ecológico</strong>. Gracias por tu compromiso con el planeta.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/explore" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
            Ver packs disponibles <ArrowRight className="size-4" />
          </Link>
          <Link href="/profile" className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-8 py-3.5 rounded-xl shadow-sm transition flex items-center justify-center">
            Ir a mi perfil
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
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-bold border border-amber-500/30 mb-6">
            <Sparkles className="size-4" /> EcoRescate Prime
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Salva comida sin salir de casa.
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Únete a nuestra membresía premium y disfruta de <strong>Delivery Ecológico Ilimitado</strong>, prioridad en packs exclusivos y apoya directamente a la reforestación local.
          </p>
        </div>
      </section>

      {/* Pricing & Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Benefits */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-900">¿Por qué ser Prime?</h2>
            
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Truck className="size-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Delivery Gratis Ilimitado</h3>
                <p className="text-slate-600">No pagues más por envíos. Nuestros repartidores en bicicletas y vehículos eléctricos llevarán tu pack gratis.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="size-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Acceso Anticipado</h3>
                <p className="text-slate-600">Recibe notificaciones 30 minutos antes que los usuarios regulares sobre packs altamente demandados.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Star className="size-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Impacto Multiplicado</h3>
                <p className="text-slate-600">Por cada mes de tu suscripción, plantamos un árbol en la Amazonía Peruana en tu nombre.</p>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            
            <div className="flex justify-center mb-8">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 font-medium text-sm">
                <button 
                  onClick={() => setIsAnnual(false)}
                  className={`px-4 py-2 rounded-lg transition ${!isAnnual ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Mensual
                </button>
                <button 
                  onClick={() => setIsAnnual(true)}
                  className={`px-4 py-2 rounded-lg transition ${isAnnual ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Anual <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full ml-1">-20%</span>
                </button>
              </div>
            </div>

            <div className="text-center mb-8">
              {isStudent && (
                <div className="mb-3 inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                  <ShieldCheck className="size-3.5" /> Descuento Estudiante Activado (.edu.pe)
                </div>
              )}
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-5xl font-extrabold text-slate-900">
                  S/ {isStudent ? (isAnnual ? '7.90' : '9.90') : (isAnnual ? '15.90' : '19.90')}
                </span>
                <span className="text-slate-500 font-medium mb-1">/mes</span>
              </div>
              <p className="text-slate-500 text-sm">
                {isAnnual 
                  ? `Facturado anualmente (S/ ${isStudent ? '94.80' : '190.80'})` 
                  : 'Cancela en cualquier momento'}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="size-5 text-amber-500 shrink-0" /> Delivery Ecológico Gratis
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="size-5 text-amber-500 shrink-0" /> Acceso anticipado a packs
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="size-5 text-amber-500 shrink-0" /> Insignia Prime en tu perfil
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="size-5 text-amber-500 shrink-0" /> Soporte prioritario
              </li>
            </ul>

            <button 
              onClick={handleSubscribe}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition text-lg"
            >
              Comenzar prueba gratis de 14 días
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
              Te avisaremos 3 días antes de que termine tu prueba.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
