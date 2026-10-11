"use client";

import { Leaf, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loginWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();

  const getErrorMessage = (err: any) => {
    const code = err.code || "";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
      return "Correo o contraseña incorrectos.";
    }
    if (code === "auth/invalid-email") {
      return "El formato del correo electrónico no es válido.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Se cerró la ventana de inicio de sesión con Google.";
    }
    if (code === "auth/popup-blocked") {
      return "El navegador bloqueó la ventana emergente. Por favor habilítala.";
    }
    return err.message || "Ocurrió un error al iniciar sesión.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(getErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-primary p-3 rounded-2xl shadow-md shadow-primary/20">
            <Leaf className="size-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2">Iniciar Sesión</h1>
        <p className="text-center text-slate-500 mb-8">¡Qué bueno verte de nuevo en EcoRescate!</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm animate-shake">
            <AlertCircle className="size-5 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl border border-slate-200 shadow-sm transition hover:border-slate-300 disabled:opacity-60 mb-6"
        >
          {googleLoading ? (
            <Loader2 className="size-5 animate-spin text-slate-500" />
          ) : (
            <svg className="size-5" viewBox="0 0 24 24">
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

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-slate-400 font-semibold">o con tu correo</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-primary hover:bg-leaf-deep text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          ¿Aún no tienes cuenta? <Link href="/register" className="text-primary font-bold hover:underline">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
}
