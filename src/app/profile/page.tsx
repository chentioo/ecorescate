import { Leaf, Award, MapPin, PackageOpen, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
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
          <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
            S
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Santiago</h2>
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

      </div>
    </div>
  );
}
