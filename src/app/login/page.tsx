"use client";

import { Leaf, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular inicio de sesión (usaremos el nombre de la parte del correo para el prototipo si no hay usuario guardado)
    const existingUser = localStorage.getItem("ecoRescateUser");
    if (!existingUser && email) {
      const name = email.split("@")[0];
      localStorage.setItem("ecoRescateUser", JSON.stringify({ name: name, email }));
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-leaf p-3 rounded-2xl">
            <Leaf className="size-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2">Iniciar Sesión</h1>
        <p className="text-center text-slate-500 mb-8">¡Qué bueno verte de nuevo!</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
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
          
          <div className="flex justify-end">
            <button type="button" className="text-sm text-slate-500 hover:text-leaf">¿Olvidaste tu contraseña?</button>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-leaf hover:bg-leaf-deep text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-6"
          >
            Entrar <ArrowRight className="size-5" />
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-500 mt-8">
          ¿Aún no tienes cuenta? <Link href="/register" className="text-leaf font-bold hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
