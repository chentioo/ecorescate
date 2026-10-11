"use client";

import Link from "next/link";
import { Menu, Leaf, User as UserIcon, LogOut, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getCleanAvatar, DEFAULT_AVATAR } from "@/lib/avatars";

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const pathname = usePathname();

  // En páginas de autenticación no mostramos el menú regular
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  const displayName = profile?.name || user?.displayName || user?.email?.split("@")[0] || "Mi Cuenta";
  const photoURL = getCleanAvatar(profile?.photoURL || user?.photoURL);

  useEffect(() => {
    setImgError(false);
  }, [photoURL]);

  if (isAuthRoute) {
    return (
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <Link href="/login" className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-xl">
                <Leaf className="size-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">EcoRescate</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-xl">
                <Leaf className="size-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">EcoRescate</span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-5 items-center">
            <Link href="/explore" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Explorar Ofertas
            </Link>
            
            <Link href="/prime" className="flex items-center gap-1.5 text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors border border-amber-200">
              <span>✨ Prime</span>
            </Link>
            
            {/* Perfil del usuario autenticado */}
            <Link 
              href="/profile" 
              className="flex items-center gap-2.5 text-sm font-medium bg-white hover:bg-slate-50 text-slate-800 pl-2 pr-4 py-1.5 rounded-full transition-all border border-slate-200 shadow-sm hover:border-primary/40 group"
            >
              <div className="size-7 rounded-full overflow-hidden border border-emerald-200 bg-emerald-50 flex items-center justify-center shrink-0 shadow-sm">
                <img 
                  src={imgError ? DEFAULT_AVATAR : photoURL} 
                  alt={displayName} 
                  onError={() => setImgError(true)}
                  className="size-full object-cover" 
                />
              </div>
              <span className="max-w-[120px] truncate group-hover:text-primary transition-colors font-semibold">{displayName}</span>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none transition"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <Link 
            href="/explore" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Explorar Ofertas
          </Link>
          <Link 
            href="/prime" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-bold text-amber-600 bg-amber-50"
          >
            ✨ EcoRescate Prime
          </Link>
          <Link 
            href="/profile" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-base font-medium text-slate-800 bg-slate-50"
          >
            <div className="size-7 rounded-full overflow-hidden border border-slate-200 bg-emerald-50 shrink-0">
              <img 
                src={imgError ? DEFAULT_AVATAR : photoURL} 
                alt={displayName} 
                className="size-full object-cover" 
              />
            </div>
            <span>Mi Perfil ({displayName})</span>
          </Link>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut className="size-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </nav>
  );
}
