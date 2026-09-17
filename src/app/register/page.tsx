"use client";

import { Leaf, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem("ecoRescateUser", JSON.stringify({ name: name.trim(), email }));
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-leaf p-3 rounded-2xl">
            <Leaf className="size-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2">Únete a EcoRescate</h1>
        <p className="text-center text-slate-500 mb-8">Salva comida deliciosa y cuida el planeta.</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf focus:border-transparent transition"
              placeholder="¿Cómo te llamas?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf focus:border-transparent transition"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-leaf hover:bg-leaf-deep text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-6"
          >
            Crear Cuenta <ArrowRight className="size-5" />
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-500 mt-8">
          ¿Ya tienes una cuenta? <Link href="/login" className="text-leaf font-bold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
