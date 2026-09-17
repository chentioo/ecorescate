"use client";

import { Leaf, Award, MapPin, PackageOpen, ChevronRight, Settings, CreditCard, Salad, Bell, Shield, Crown, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [isPrime, setIsPrime] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ecoRescateUser');
      localStorage.removeItem('ecoRescatePrime');
      router.push('/login');
    }
  };


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPrime(localStorage.getItem('ecoRescatePrime') === 'true');
      const userStr = localStorage.getItem('ecoRescateUser');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.name) setUserName(user.name);
        } catch (e) {}
      }
    }
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Mi Perfil</h1>
          <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition">
            <Settings className="size-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8 flex items-center gap-6">
          <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl uppercase">
            {userName.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {userName}
              {isPrime && (
                <span className="bg-amber-100 text-amber-600 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-amber-200">
                  <Crown className="size-3" /> Prime
                </span>
              )}
            </h2>
            <p className="text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="size-4" /> Lima, Perú
            </p>
          </div>
        </div>

        {/* Impact Stats */}
        <h3 className="text-lg font-bold text-slate-900 mb-4">Tu Impacto</h3>
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-gradient-to-br from-primary to-leaf-deep rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <Leaf className="absolute -right-4 -bottom-4 size-24 opacity-20" />
            <p className="text-white/80 text-sm font-medium mb-1">CO2 Evitado</p>
            <p className="text-3xl font-extrabold">12.5 <span className="text-lg font-semibold">kg</span></p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10" />
            <p className="text-slate-500 text-sm font-medium mb-1">Dinero Ahorrado</p>
            <p className="text-3xl font-extrabold text-slate-900">S/ 145</p>
          </div>
        </div>

        {/* History */}
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-slate-900">Rescates Recientes</h3>
          <button className="text-primary text-sm font-semibold hover:underline">Ver todos</button>
        </div>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition cursor-pointer">
              <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <PackageOpen className="size-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">{i === 1 ? 'Pack Criollo Especial' : 'Pack Desayuno Saludable'}</h4>
                <p className="text-sm text-slate-500">{i === 1 ? 'La Lucha Sanguchería' : 'Bodega Verde'} • Hace {i} días</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-primary">S/ {i === 1 ? '20.00' : '14.00'}</span>
                <ChevronRight className="size-4 text-slate-300 mt-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Gamification / Badges */}
        <h3 className="text-lg font-bold text-slate-900 mb-4 mt-10">Tus Insignias</h3>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
          <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200">
            <Award className="size-8 text-amber-500" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Héroe Local Nivel 1</h4>
            <p className="text-sm text-slate-500 mt-1">Has salvado 5 packs de comida. ¡Sigue así!</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3">
              <div className="bg-amber-500 h-2 rounded-full w-[50%]" />
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">5 / 10 para Nivel 2</p>
          </div>
        </div>

        {/* Settings Menu */}
        <h3 className="text-lg font-bold text-slate-900 mb-4 mt-10">Configuración de Cuenta</h3>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          
          <Link href="/prime" className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer group">
            <div className="size-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Crown className="size-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Suscripción Prime</h4>
              <p className="text-sm text-slate-500">{isPrime ? "Activa - Delivery Ecológico Ilimitado" : "Gestionar plan y beneficios"}</p>
            </div>
            <ChevronRight className="size-5 text-slate-300" />
          </Link>

          <div className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer group">
            <div className="size-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="size-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Métodos de Pago</h4>
              <p className="text-sm text-slate-500">Tarjetas, Yape y Plin</p>
            </div>
            <ChevronRight className="size-5 text-slate-300" />
          </div>

          <div className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer group">
            <div className="size-10 rounded-xl bg-leaf-soft text-leaf-deep flex items-center justify-center group-hover:scale-110 transition-transform">
              <Salad className="size-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Preferencias Alimenticias</h4>
              <p className="text-sm text-slate-500">Vegano, sin gluten, alergias</p>
            </div>
            <ChevronRight className="size-5 text-slate-300" />
          </div>

          <div className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer group">
            <div className="size-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="size-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Notificaciones</h4>
              <p className="text-sm text-slate-500">Alertas de rescate cercanas</p>
            </div>
            <ChevronRight className="size-5 text-slate-300" />
          </div>

          <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition cursor-pointer group">
            <div className="size-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="size-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Seguridad y Privacidad</h4>
              <p className="text-sm text-slate-500">Contraseña y datos personales</p>
            </div>
            <ChevronRight className="size-5 text-slate-300" />
          </div>

        </div>

        {/* Logout Button */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold px-6 py-3 rounded-xl hover:bg-red-50 transition"
          >
            <LogOut className="size-5" />
            Cerrar Sesión
          </button>
        </div>



      </div>
    </div>
  );
}
