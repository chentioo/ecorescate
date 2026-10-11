"use client";

import { 
  Leaf, 
  Award, 
  MapPin, 
  PackageOpen, 
  ChevronRight, 
  Settings, 
  CreditCard, 
  Salad, 
  Bell, 
  Shield, 
  Crown, 
  LogOut, 
  Loader2, 
  Mail, 
  Pencil, 
  Check, 
  Sparkles,
  QrCode,
  Clock,
  Store,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState, useEffect } from "react";
import { PRESET_AVATARS, DEFAULT_AVATAR, getCleanAvatar } from "@/lib/avatars";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserOrders, markOrderCompleted } from "@/lib/orders";
import { Order } from "@/types";

export default function ProfilePage() {
  const { user, profile, loading, logout, updateUserProfile } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingAvatar, setSavingAvatar] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estados para pedidos / órdenes del usuario
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderTab, setOrderTab] = useState<"active" | "history">("active");

  const displayName = profile?.name || user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const userEmail = profile?.email || user?.email || "";
  const photoURL = getCleanAvatar(profile?.photoURL || user?.photoURL);
  const isPrime = profile?.isPrime ?? false;

  // Cálculo de métricas agregadas desde órdenes y perfil
  const ordersTotalCo2 = orders.reduce((sum, o) => sum + (o.co2SavedKg || 0), 0);
  const ordersTotalMoney = orders.reduce((sum, o) => sum + (o.moneySaved || 0), 0);
  const ordersTotalPacks = orders.reduce((sum, o) => sum + (o.quantity || 1), 0);

  const co2Saved = Number(Math.max(profile?.co2SavedKg || 0, ordersTotalCo2).toFixed(1));
  const moneySaved = Number(Math.max(profile?.moneySaved || 0, ordersTotalMoney).toFixed(2));
  const rescuedCount = Math.max(profile?.rescuedCount || 0, ordersTotalPacks);

  // Cargar órdenes del usuario
  useEffect(() => {
    if (user?.uid) {
      getUserOrders(user.uid).then((res) => {
        setOrders(res);
        setLoadingOrders(false);
      });
    }
  }, [user?.uid]);

  // Sincronizar automáticamente hacia Firestore si las órdenes suman más que el perfil registrado
  useEffect(() => {
    if (user?.uid && orders.length > 0) {
      const calculatedCo2 = Number(orders.reduce((sum, o) => sum + (o.co2SavedKg || 0), 0).toFixed(1));
      const calculatedMoney = Number(orders.reduce((sum, o) => sum + (o.moneySaved || 0), 0).toFixed(2));
      const calculatedCount = orders.reduce((sum, o) => sum + (o.quantity || 1), 0);

      if (
        (profile?.co2SavedKg || 0) < calculatedCo2 ||
        (profile?.moneySaved || 0) < calculatedMoney ||
        (profile?.rescuedCount || 0) < calculatedCount
      ) {
        setDoc(
          doc(db, "users", user.uid),
          {
            co2SavedKg: calculatedCo2,
            moneySaved: calculatedMoney,
            rescuedCount: calculatedCount,
          },
          { merge: true }
        ).catch(() => {});
      }
    }
  }, [user?.uid, orders, profile]);

  // Reset error flag whenever photoURL changes
  useEffect(() => {
    setImgError(false);
  }, [photoURL]);

  useEffect(() => {
    if (displayName) {
      setNameInput(displayName);
    }
  }, [displayName]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-slate-50">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // El AuthProvider redirige automáticamente a /login
  }

  const handleSelectAvatar = async (avatarUrl: string, avatarId: string) => {
    setSavingAvatar(avatarId);
    setImgError(false);
    try {
      await updateUserProfile({ photoURL: avatarUrl });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error("Error al guardar avatar:", e);
    } finally {
      setSavingAvatar(null);
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    try {
      await updateUserProfile({ name: nameInput.trim() });
      setIsEditingName(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error("Error al guardar nombre:", e);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    if (!user?.uid) return;
    try {
      await markOrderCompleted(orderId, user.uid);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o))
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error("Error al completar rescate:", e);
    }
  };

  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const pastOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled");

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Mi Perfil</h1>
            <p className="text-slate-500 text-sm mt-0.5">Gestiona tu identidad y tus rescates ecológicos</p>
          </div>
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm animate-bounce">
              <Check className="size-3.5" />
              <span>¡Perfil actualizado!</span>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <div className="size-24 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md bg-slate-50 flex items-center justify-center">
              {!imgError ? (
                <img 
                  src={photoURL} 
                  alt={displayName} 
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <img 
                  src={DEFAULT_AVATAR} 
                  alt={displayName} 
                  className="w-full h-full object-cover" 
                />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow border border-slate-200">
              <Sparkles className="size-4 text-amber-500" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-1 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tu nombre..."
                  />
                  <button
                    onClick={handleSaveName}
                    className="bg-primary hover:bg-leaf-deep text-white px-3 py-1.5 rounded-xl text-xs font-bold transition"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    {displayName}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    title="Editar nombre"
                    className="text-slate-400 hover:text-primary transition p-1"
                  >
                    <Pencil className="size-4" />
                  </button>
                </>
              )}

              {isPrime && (
                <span className="bg-amber-100 text-amber-600 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-amber-200">
                  <Crown className="size-3" /> Prime
                </span>
              )}
            </div>

            <p className="text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1.5 text-sm">
              <Mail className="size-3.5 text-slate-400" /> {userEmail}
            </p>
            <p className="text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5 text-xs">
              <MapPin className="size-3.5" /> Lima, Perú
            </p>
          </div>
        </div>

        {/* Sección: Selector de Avatar Predeterminado */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Elige tu Avatar</span>
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-semibold">8 Predeterminados</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Selecciona el avatar que más te guste para representarte en EcoRescate</p>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {PRESET_AVATARS.map((avatar) => {
              const isSelected = photoURL === avatar.url;
              const isSaving = savingAvatar === avatar.id;

              return (
                <button
                  key={avatar.id}
                  onClick={() => handleSelectAvatar(avatar.url, avatar.id)}
                  disabled={isSaving}
                  title={avatar.label}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 group relative ${
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/20 ring-2 ring-primary/20" 
                      : "border-slate-100 hover:border-slate-300 bg-slate-50"
                  }`}
                >
                  <div className="size-12 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center border border-slate-200">
                    {isSaving ? (
                      <Loader2 className="size-5 animate-spin text-primary" />
                    ) : (
                      <img 
                        src={avatar.url} 
                        alt={avatar.label} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <span className="text-[10px] font-semibold text-slate-700 truncate max-w-full">
                    {avatar.label.split(" ")[0]}
                  </span>

                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 size-4 bg-primary text-white rounded-full flex items-center justify-center text-[10px] shadow">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN: MIS RESCATES DE COMIDA */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Mis Rescates de Comida</span>
                {activeOrders.length > 0 && (
                  <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    {activeOrders.length} {activeOrders.length === 1 ? "activo" : "activos"}
                  </span>
                )}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Packs reservados listos para recoger en el restaurante o entregados
              </p>
            </div>

            {/* Tabs Activos vs Historial */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setOrderTab("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  orderTab === "active"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Activos ({activeOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderTab("history")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  orderTab === "history"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Historial ({pastOrders.length})
              </button>
            </div>
          </div>

          {orderTab === "active" ? (
            activeOrders.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
                <PackageOpen className="size-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No tienes rescates activos en este momento</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Explora las ofertas cercanas en Lima para rescatar comida deliciosa a mitad de precio.
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 mt-4 bg-primary hover:bg-leaf-deep text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Explorar Ofertas
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="border border-emerald-100 bg-emerald-50/40 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="size-14 rounded-xl overflow-hidden bg-white border border-emerald-200 shrink-0">
                        <img
                          src={ord.packImageUrl || "/restaurants/LALUCHA.jpg"}
                          alt={ord.packName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            {ord.restaurantName}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {ord.orderCode}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                          {ord.packName} ({ord.quantity}x)
                        </h4>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <Clock className="size-3 text-primary" />
                          <span>Recojo: <strong>{ord.pickupTime}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-100">
                      <Link
                        href={`/order/${ord.id}?type=${ord.deliveryMethod}`}
                        className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <QrCode className="size-3.5 text-primary" />
                        <span>Ver QR</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleCompleteOrder(ord.id)}
                        className="flex items-center gap-1.5 bg-primary hover:bg-leaf-deep text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Recogido</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            pastOrders.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Aún no tienes rescates completados en tu historial.
              </div>
            ) : (
              <div className="space-y-3">
                {pastOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="border border-slate-200 bg-white rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={ord.packImageUrl || "/restaurants/LALUCHA.jpg"}
                          alt={ord.packName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{ord.packName} - {ord.restaurantName}</p>
                        <p className="text-slate-400 text-[11px]">Pagado: S/ {ord.totalPrice?.toFixed(2)} • Ahorraste S/ {ord.moneySaved?.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 border border-emerald-200">
                      <Check className="size-3" /> Rescate Completado
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Impact Stats */}
        <h3 className="text-lg font-bold text-slate-900 mb-4">Tu Impacto Ambiental</h3>
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-gradient-to-br from-primary to-leaf-deep rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <Leaf className="absolute -right-4 -bottom-4 size-24 opacity-20" />
            <p className="text-white/80 text-sm font-medium mb-1">CO2 Evitado</p>
            <p className="text-3xl font-extrabold">{co2Saved} <span className="text-lg font-semibold">kg</span></p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10" />
            <p className="text-slate-500 text-sm font-medium mb-1">Dinero Ahorrado</p>
            <p className="text-3xl font-extrabold text-slate-900">S/ {moneySaved}</p>
          </div>
        </div>

        {/* Rescues Count */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <PackageOpen className="size-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Packs Rescatados</h4>
              <p className="text-sm text-slate-500">{rescuedCount} paquetes salvados del desperdicio</p>
            </div>
          </div>
          <Link href="/explore" className="text-sm font-semibold text-primary hover:underline">
            Explorar ofertas
          </Link>
        </div>

        {/* Gamification / Badges */}
        <h3 className="text-lg font-bold text-slate-900 mb-4">Tus Insignias</h3>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-6 mb-10">
          <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200">
            <Award className="size-8 text-amber-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900">
              {rescuedCount >= 10 ? "Guardián de la Comida (Nivel 2)" : "Héroe EcoRescate (Nivel 1)"}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              {rescuedCount === 0 ? "¡Haz tu primer rescate para desbloquear tu nivel!" : `Has salvado ${rescuedCount} packs de comida.`}
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all" 
                style={{ width: `${Math.min(100, (rescuedCount / 10) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">{rescuedCount} / 10 para Nivel 2</p>
          </div>
        </div>

        {/* Settings Menu */}
        <h3 className="text-lg font-bold text-slate-900 mb-4">Configuración de Cuenta</h3>
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
            onClick={logout}
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
