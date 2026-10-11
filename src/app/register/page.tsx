"use client";

import { Leaf, ArrowRight, Loader2, AlertCircle, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { PRESET_AVATARS, DEFAULT_AVATAR } from "@/lib/avatars";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { registerWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();

  const currentAvatarObj = PRESET_AVATARS.find((a) => a.url === selectedAvatar) || PRESET_AVATARS[0];

  const getErrorMessage = (err: any) => {
    const code = err.code || "";
    if (code === "auth/email-already-in-use") {
      return "Este correo ya está registrado. Prueba iniciando sesión.";
    }
    if (code === "auth/weak-password") {
      return "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
    }
    if (code === "auth/invalid-email") {
      return "El formato del correo electrónico no es válido.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Se cerró la ventana de inicio de sesión con Google.";
    }
    if (code === "auth/unauthorized-domain") {
      return "Dominio no autorizado en Firebase. Agrega 'ecorescate-web.vercel.app' en Firebase Console (Authentication > Settings > Authorized Domains).";
    }
    return err.message || "Ocurrió un error al registrar la cuenta.";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor ingresa tu nombre completo.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await registerWithEmail(name.trim(), email.trim(), password, selectedAvatar);
      router.push("/");
    } catch (err: any) {
      console.error("Register error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err: any) {
      console.error("Google register error:", err);
      setError(getErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 pt-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100">
        
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-primary p-3 rounded-2xl shadow-md shadow-primary/20">
            <Leaf className="size-7 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 mb-1">Únete a EcoRescate</h1>
        <p className="text-center text-slate-500 text-sm mb-6">Salva comida deliciosa y rescata el planeta.</p>

        {/* Tabs: Iniciar Sesión / Registrarse */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
          <Link
            href="/login"
            className="text-center py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Iniciar Sesión
          </Link>
          <div className="text-center py-2 rounded-xl text-sm font-bold text-slate-900 bg-white shadow-sm">
            Crear Cuenta
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm animate-shake">
            <AlertCircle className="size-5 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* SECCIÓN DESTACADA: ELIGE TU AVATAR */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-emerald-600" />
              <label className="text-sm font-bold text-slate-800">
                1. Elige tu Avatar
              </label>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              {currentAvatarObj.label}
            </span>
          </div>

          {/* Preview del Avatar Activo */}
          <div className="flex items-center gap-3.5 mb-3 bg-white p-2.5 rounded-xl border border-emerald-100 shadow-sm">
            <div className="size-14 rounded-full overflow-hidden border-2 border-emerald-400 bg-emerald-50 shrink-0 shadow-sm">
              <img 
                src={selectedAvatar} 
                alt="Avatar elegido" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentAvatarObj.label}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Este avatar te representará en tu perfil y rescates. Podrás cambiarlo cuando quieras.
              </p>
            </div>
          </div>

          {/* Galería de 8 Avatares Predeterminados */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.url)}
                  title={avatar.label}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 relative bg-white ${
                    isSelected 
                      ? "border-primary shadow-sm ring-2 ring-primary/20 bg-emerald-50/50" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="size-10 rounded-full overflow-hidden flex items-center justify-center bg-slate-50">
                    <img 
                      src={avatar.url} 
                      alt={avatar.label} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 truncate max-w-full">
                    {avatar.label.split(" ")[0]}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 size-4 bg-primary text-white rounded-full flex items-center justify-center text-[9px] shadow">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario de Registro */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              2. Tus Datos Personales
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
              placeholder="Ej. Ana García"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-primary hover:bg-leaf-deep text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2 mt-5 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Creando tu cuenta...</span>
              </>
            ) : (
              <>
                <span>Registrarme con mi Avatar</span>
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>

        {/* Separador */}
        <div className="relative flex py-4 items-center my-2">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-slate-400 font-semibold">o también</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl border border-slate-200 shadow-sm transition hover:border-slate-300 disabled:opacity-60 text-sm"
        >
          {googleLoading ? (
            <Loader2 className="size-4 animate-spin text-slate-500" />
          ) : (
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continuar con Google</span>
        </button>
        
        <p className="text-center text-xs text-slate-500 mt-6">
          ¿Ya tienes cuenta? <Link href="/login" className="text-primary font-bold hover:underline">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
