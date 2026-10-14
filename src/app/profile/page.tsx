"use client";

import { 
  Leaf, 
  MapPin, 
  PackageOpen, 
  ChevronRight, 
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
  CheckCircle2,
  TreePine,
  Smartphone,
  Droplets,
  Sprout,
  Zap,
  RotateCcw,
  MessageCircle,
  Heart,
  Phone,
  Camera,
  X,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState, useEffect } from "react";
import { PRESET_AVATARS, DEFAULT_AVATAR, getCleanAvatar } from "@/lib/avatars";
import { doc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { getUserOrders, markOrderCompleted } from "@/lib/orders";
import { getWhatsAppShareUrl } from "@/lib/notifications";
import { Order } from "@/types";
import { FALLBACK_RESTAURANTS } from "@/app/explore/page";
import { RestaurantCard } from "@/components/ui/RestaurantCard";

// Switch reutilizable estilo iOS/Apple
function AppleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  id,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? "bg-emerald-500" : "bg-slate-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function ProfilePage() {
  const { user, profile, loading, logout, updateUserProfile } = useAuth();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  // Estados de Modales
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState(false);

  // Campos de edición de perfil
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDietary, setEditDietary] = useState("Sin restricciones");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Avatares
  const [savingAvatar, setSavingAvatar] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Seguridad / Recuperación de contraseña
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [passwordResetNotice, setPasswordResetNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Pedidos y Pestañas
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history" | "favorites">("active");

  const displayName = profile?.name || user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const userEmail = profile?.email || user?.email || "";
  const userPhone = profile?.phone || "No especificado";
  const userAddress = profile?.address || "Lima, Perú";
  const userDietary = profile?.dietaryPreference || "Sin restricciones";
  const photoURL = getCleanAvatar(profile?.photoURL || user?.photoURL);
  const isPrime = profile?.isPrime ?? false;

  // Favoritos
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    let favList: string[] = profile?.favoriteRestaurantIds || [];
    if (typeof window !== "undefined" && favList.length === 0) {
      try {
        favList = JSON.parse(localStorage.getItem("ecorescate_favorites") || "[]");
      } catch (e) {}
    }
    setFavoriteIds(favList);
  }, [profile?.favoriteRestaurantIds]);

  // Cargar valores iniciales en los formularios
  useEffect(() => {
    if (profile || user) {
      setEditName(profile?.name || user?.displayName || "");
      setEditPhone(profile?.phone || "");
      setEditAddress(profile?.address || "");
      setEditDietary(profile?.dietaryPreference || "Sin restricciones");
    }
  }, [profile, user]);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cálculo de métricas
  const ordersTotalCo2 = orders.reduce((sum, o) => sum + (o.co2SavedKg || 0), 0);
  const ordersTotalMoney = orders.reduce((sum, o) => sum + (o.moneySaved || 0), 0);
  const ordersTotalPacks = orders.reduce((sum, o) => sum + (o.quantity || 1), 0);

  const co2Saved = Number(Math.max(profile?.co2SavedKg || 0, ordersTotalCo2).toFixed(1));
  const moneySaved = Number(Math.max(profile?.moneySaved || 0, ordersTotalMoney).toFixed(2));
  const rescuedCount = Math.max(profile?.rescuedCount || 0, ordersTotalPacks);

  // Rango Ecológico
  let currentRank = "Semilla";
  let nextRank = "Brote Verde";
  let rankProgress = 0;
  let rankTarget = 4;
  let rankDescription = "Iniciando tu impacto positivo salvando comida fresca en Lima.";

  if (rescuedCount >= 10) {
    currentRank = "Guardián Amazónico";
    nextRank = "Rango Máximo";
    rankProgress = 100;
    rankTarget = 10;
    rankDescription = "¡Máximo nivel alcanzado! Eres un referente de sostenibilidad y protección de la Amazonía.";
  } else if (rescuedCount >= 4) {
    currentRank = "Brote Verde";
    nextRank = "Guardián Amazónico";
    rankProgress = Math.min(100, Math.round(((rescuedCount - 3) / (10 - 3)) * 100));
    rankTarget = 10;
    rankDescription = "Tu constancia está evitando activamente el desperdicio de alimentos cada semana.";
  } else {
    currentRank = "Semilla";
    nextRank = "Brote Verde";
    rankProgress = Math.min(100, Math.round((rescuedCount / 4) * 100));
    rankTarget = 4;
    rankDescription = "Iniciando tu impacto positivo salvando comida fresca en Lima.";
  }

  const treesMadreDeDios = (co2Saved > 0)
    ? Number((co2Saved / 10).toFixed(1))
    : Number((rescuedCount * 0.3).toFixed(1));

  const smartphoneCharges = (co2Saved > 0)
    ? Math.round(co2Saved * 165)
    : rescuedCount * 220;

  const waterSavedLiters = Math.round(rescuedCount * 850);

  // Cargar órdenes del usuario
  useEffect(() => {
    if (user?.uid) {
      getUserOrders(user.uid).then((res) => {
        setOrders(res);
        setLoadingOrders(false);
      });
    }
  }, [user?.uid]);

  // Sincronizar hacia Firestore si las órdenes suman más que el perfil registrado
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

  useEffect(() => {
    setImgError(false);
  }, [photoURL]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-slate-50">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // 1. Guardar Edición de Perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        dietaryPreference: editDietary,
      });
      setIsEditProfileOpen(false);
      showToast("¡Perfil guardado correctamente en tu cuenta!");
    } catch (err) {
      console.error("Error al guardar perfil:", err);
      showToast("Hubo un error al actualizar los datos.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 2. Seleccionar Avatar
  const handleSelectAvatar = async (avatarUrl: string, avatarId: string) => {
    setSavingAvatar(avatarId);
    setImgError(false);
    try {
      await updateUserProfile({ photoURL: avatarUrl });
      showToast("¡Avatar actualizado con éxito!");
      setIsAvatarModalOpen(false);
    } catch (e) {
      console.error("Error al guardar avatar:", e);
    } finally {
      setSavingAvatar(null);
    }
  };

  // 3. Toggle de Notificaciones por Correo
  const handleToggleEmail = async () => {
    const cur = profile?.emailNotifications ?? true;
    const nextVal = !cur;
    await updateUserProfile({ emailNotifications: nextVal });
    showToast(nextVal ? "Notificaciones por correo activadas" : "Notificaciones por correo desactivadas");
  };

  // 4. Toggle de Alertas por WhatsApp
  const handleToggleWhatsApp = async () => {
    const cur = profile?.whatsappNotifications ?? true;
    const nextVal = !cur;
    await updateUserProfile({ whatsappNotifications: nextVal });
    showToast(nextVal ? "Alertas por WhatsApp activadas" : "Alertas por WhatsApp desactivadas");
  };

  // 5. Toggle de Llevar Táper por Defecto
  const handleToggleDefaultContainer = async () => {
    const cur = profile?.defaultBringContainer ?? false;
    const nextVal = !cur;
    await updateUserProfile({ defaultBringContainer: nextVal });
    showToast(nextVal ? "¡Llevar táper propio activado por defecto! 🌱" : "Táper propio desactivado por defecto");
  };

  // 6. Cambiar Contraseña vía Correo
  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    setPasswordResetLoading(true);
    setPasswordResetNotice(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordResetNotice({
        type: "success",
        text: `¡Enlace enviado! Revisa tu bandeja de entrada en ${user.email} para actualizar tu contraseña.`,
      });
      showToast("Correo de restablecimiento enviado");
    } catch (err: any) {
      setPasswordResetNotice({
        type: "error",
        text: err.message || "No se pudo enviar el correo de recuperación.",
      });
    } finally {
      setPasswordResetLoading(false);
    }
  };

  // 7. Completar Orden
  const handleCompleteOrder = async (orderId: string) => {
    if (!user?.uid) return;
    try {
      await markOrderCompleted(orderId, user.uid);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o))
      );
      showToast("¡Rescate marcado como recogido!");
    } catch (e) {
      console.error("Error al completar rescate:", e);
    }
  };

  // 8. Compartir por WhatsApp
  const handleShareOrderWhatsApp = (ord: Order) => {
    const url = getWhatsAppShareUrl(ord);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // 9. Cerrar Sesión
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const pastOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled");
  const favoriteRestaurants = FALLBACK_RESTAURANTS.filter((r) => favoriteIds.includes(r.id));

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera y Toast */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mi Perfil</h1>
            <p className="text-slate-500 text-sm mt-0.5">Gestiona tu identidad, tus preferencias y tus rescates ecológicos</p>
          </div>
          {toastMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md animate-apple-fade-in">
              <Check className="size-4 text-emerald-600 stroke-[2.5]" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Tarjeta Principal de Usuario */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
          
          {/* Avatar con botón para abrir selector */}
          <div className="relative group shrink-0">
            <div className="size-24 sm:size-28 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md bg-slate-50 flex items-center justify-center">
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
            
            {/* Botón flotante para cambiar foto */}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute bottom-0 right-0 bg-primary hover:bg-leaf-deep text-white p-2 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110 cursor-pointer"
              title="Cambiar avatar"
            >
              <Camera className="size-4" />
            </button>
          </div>

          {/* Información del Usuario */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {displayName}
              </h2>

              {isPrime && (
                <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-amber-200 shadow-xs">
                  <Crown className="size-3.5 text-amber-500 fill-amber-500" /> Miembro Prime
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
              <p className="flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="size-3.5 text-slate-400" />
                <span className="truncate">{userEmail}</span>
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-1.5">
                <Phone className="size-3.5 text-slate-400" />
                <span>{userPhone}</span>
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="size-3.5 text-slate-400" />
                <span>{userAddress}</span>
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-1.5">
                <Salad className="size-3.5 text-slate-400" />
                <span>Dieta: <strong>{userDietary}</strong></span>
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Pencil className="size-3.5" />
                <span>Editar Perfil</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Sparkles className="size-3.5 text-amber-500" />
                <span>Elegir Avatar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Editar Perfil */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-apple-fade-in relative">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Pencil className="size-4 text-primary" />
                  <span>Editar Perfil</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Tu nombre y apellido"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Ej. +51 987 654 321"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Distrito / Dirección habitual</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Ej. Miraflores, Lima"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferencia Alimentaria</label>
                  <select
                    value={editDietary}
                    onChange={(e) => setEditDietary(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white font-medium"
                  >
                    <option value="Sin restricciones">Sin restricciones</option>
                    <option value="Vegetariano">Vegetariano</option>
                    <option value="Vegano">Vegano</option>
                    <option value="Sin gluten">Sin gluten / Celiaco</option>
                    <option value="Pescetariano">Pescetariano</option>
                    <option value="Bajo en calorías">Bajo en calorías</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 bg-primary hover:bg-leaf-deep text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="size-3.5 stroke-[2.5]" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Selector de Avatar (8 avatares predeterminados) */}
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-apple-fade-in relative">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" />
                    <span>Elige tu Avatar</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">8 avatares oficiales para tu perfil de EcoRescate</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 py-2">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = photoURL === avatar.url;
                  const isSaving = savingAvatar === avatar.id;

                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectAvatar(avatar.url, avatar.id)}
                      disabled={isSaving}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 group relative cursor-pointer ${
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20" 
                          : "border-slate-100 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <div className="size-14 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center border border-slate-200">
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
                      
                      <span className="text-[11px] font-bold text-slate-700 truncate max-w-full">
                        {avatar.label.split(" ")[0]}
                      </span>

                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 size-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Métodos de Pago Informativo */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-apple-fade-in relative">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <CreditCard className="size-5 text-blue-600" />
                  <span>Métodos de Pago</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3 py-2 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                    Y
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Yape & Plin</p>
                    <p className="text-[11px] text-slate-500">QR y confirmación bancaria inmediata en checkout</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Activo</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                    <CreditCard className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Tarjetas Visa / Mastercard / Amex</p>
                    <p className="text-[11px] text-slate-500">Procesamiento seguro con tokenización SSL</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Activo</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    💵
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Pago en Local (Contraentrega)</p>
                    <p className="text-[11px] text-slate-500">Pagas en el mostrador al retirar tu pack sorpresa</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Activo</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Modal: Preferencias Alimentarias */}
        {isDietaryModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-apple-fade-in relative">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Salad className="size-5 text-emerald-600" />
                  <span>Preferencia Alimentaria</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDietaryModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-2 py-1">
                {[
                  "Sin restricciones",
                  "Vegetariano",
                  "Vegano",
                  "Sin gluten",
                  "Pescetariano",
                  "Bajo en calorías"
                ].map((pref) => {
                  const isSelected = userDietary === pref;
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={async () => {
                        await updateUserProfile({ dietaryPreference: pref });
                        setIsDietaryModalOpen(false);
                        showToast(`Preferencia actualizada a: ${pref}`);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                        isSelected 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span>{pref}</span>
                      {isSelected && <Check className="size-4 text-primary stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN: MIS RESCATES Y FAVORITOS (3 TABS) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 mb-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Mis Rescates & Favoritos</span>
                {activeOrders.length > 0 && (
                  <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    {activeOrders.length} {activeOrders.length === 1 ? "activo" : "activos"}
                  </span>
                )}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Packs reservados listos para recoger, historial de compras y tus restaurantes favoritos
              </p>
            </div>

            {/* Selector de Pestañas: Activos, Historial, Mis Favoritos */}
            <div className="flex bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "active"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Activos ({activeOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "history"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Historial ({pastOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("favorites")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeTab === "favorites"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Heart className="size-3 text-rose-500 fill-rose-500" />
                <span>Favoritos ({favoriteIds.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ACTIVOS */}
          {activeTab === "active" && (
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
                    className="border border-emerald-100 bg-emerald-50/40 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="size-14 rounded-xl overflow-hidden bg-white border border-emerald-200 shrink-0 shadow-xs">
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

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-emerald-100">
                      {/* Ver Comprobante */}
                      <Link
                        href={`/order/${ord.id}?type=${ord.deliveryMethod || "pickup"}`}
                        className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        <QrCode className="size-3.5 text-primary" />
                        <span>Ver comprobante</span>
                      </Link>

                      {/* Repetir Pedido */}
                      <Link
                        href={`/checkout/${ord.packId}`}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Repetir</span>
                      </Link>

                      {/* Compartir WhatsApp */}
                      <button
                        type="button"
                        onClick={() => handleShareOrderWhatsApp(ord)}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        title="Compartir por WhatsApp"
                      >
                        <MessageCircle className="size-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Marcar Recogido */}
                      <button
                        type="button"
                        onClick={() => handleCompleteOrder(ord.id)}
                        className="flex items-center gap-1.5 bg-primary hover:bg-leaf-deep text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Recogido</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: HISTORIAL */}
          {activeTab === "history" && (
            pastOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Aún no tienes rescates completados en tu historial.
              </div>
            ) : (
              <div className="space-y-3">
                {pastOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="border border-slate-200 bg-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={ord.packImageUrl || "/restaurants/LALUCHA.jpg"}
                          alt={ord.packName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">{ord.packName} - {ord.restaurantName}</p>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            ord.status === "cancelled" 
                              ? "bg-rose-100 text-rose-800" 
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {ord.status === "cancelled" ? "Cancelado" : "Completado"}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Pagado: S/ {ord.totalPrice?.toFixed(2)} • Ahorro: S/ {ord.moneySaved?.toFixed(2)} • {ord.pickupTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Link
                        href={`/order/${ord.id}?type=${ord.deliveryMethod || "pickup"}`}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition text-[11px] flex items-center gap-1"
                      >
                        <QrCode className="size-3 text-primary" />
                        <span>Ver comprobante</span>
                      </Link>

                      <Link
                        href={`/checkout/${ord.packId}`}
                        className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-xl font-bold transition text-[11px] flex items-center gap-1"
                      >
                        <RotateCcw className="size-3" />
                        <span>Repetir</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleShareOrderWhatsApp(ord)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-xl font-bold transition text-[11px] flex items-center gap-1"
                      >
                        <MessageCircle className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 3: MIS FAVORITOS */}
          {activeTab === "favorites" && (
            favoriteRestaurants.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
                <Heart className="size-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Aún no tienes restaurantes favoritos guardados</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Toca el corazón en cualquier restaurante de EcoRescate para guardarlo aquí y acceder rápido a sus packs.
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 mt-4 bg-primary hover:bg-leaf-deep text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Explorar Restaurantes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    category={restaurant.category}
                    rating={restaurant.rating}
                    reviews={restaurant.reviews}
                    distance={restaurant.distance}
                    packsAvailable={restaurant.packsAvailable}
                    logoUrl={restaurant.logoUrl}
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* SECCIÓN GAMIFICACIÓN: RANGO ECOLÓGICO */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 mb-8 animate-apple-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="size-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-xs">
                {currentRank === "Guardián Amazónico" ? (
                  <TreePine className="size-7 text-emerald-600" />
                ) : currentRank === "Brote Verde" ? (
                  <Leaf className="size-7 text-emerald-600" />
                ) : (
                  <Sprout className="size-7 text-emerald-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    Rango Ecológico
                  </span>
                  {rescuedCount >= 10 && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="size-3" /> Nivel Máximo
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                  {currentRank}
                </h3>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 font-semibold block">Progreso de Rango</span>
              <span className="text-sm font-extrabold text-slate-800">
                {rescuedCount} / {rankTarget} packs
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
            {rankDescription}
          </p>

          {/* Barra de Progreso Fluida */}
          <div className="space-y-1.5 mb-6">
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-primary to-leaf-deep h-full rounded-full transition-all duration-700 ease-out shadow-xs" 
                style={{ width: `${Math.max(6, rankProgress)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>{rankProgress}% completado</span>
              {currentRank !== "Guardián Amazónico" ? (
                <span>Próximo rango: <strong className="text-slate-700">{nextRank}</strong></span>
              ) : (
                <span className="text-emerald-700 font-bold">¡Amazonía Protegida!</span>
              )}
            </div>
          </div>

          {/* Hitos de Rangos Ecológicos */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
            <div className={`p-2 rounded-xl transition-all ${
              currentRank === "Semilla" ? "bg-emerald-50/80 border border-emerald-200/80 font-bold text-emerald-900" : "text-slate-400"
            }`}>
              <span className="text-base block mb-0.5">🌱</span>
              <span className="text-xs block">Semilla</span>
              <span className="text-[10px] text-slate-400">1 - 3 packs</span>
            </div>

            <div className={`p-2 rounded-xl transition-all ${
              currentRank === "Brote Verde" ? "bg-emerald-50/80 border border-emerald-200/80 font-bold text-emerald-900" : "text-slate-400"
            }`}>
              <span className="text-base block mb-0.5">🌿</span>
              <span className="text-xs block">Brote Verde</span>
              <span className="text-[10px] text-slate-400">4 - 9 packs</span>
            </div>

            <div className={`p-2 rounded-xl transition-all ${
              currentRank === "Guardián Amazónico" ? "bg-emerald-50/80 border border-emerald-200/80 font-bold text-emerald-900" : "text-slate-400"
            }`}>
              <span className="text-base block mb-0.5">🌳</span>
              <span className="text-xs block">Guardián Amazónico</span>
              <span className="text-[10px] text-slate-400">10+ packs</span>
            </div>
          </div>
        </div>

        {/* Métricas Principales de Impacto */}
        <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Tu Impacto Acumulado</h3>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary to-leaf-deep rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
            <Leaf className="absolute -right-3 -bottom-3 size-20 opacity-15" />
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">CO2 Evitado</p>
            <p className="text-2xl sm:text-3xl font-black">{co2Saved} <span className="text-xs sm:text-sm font-semibold opacity-90">kg</span></p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Dinero Ahorrado</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">S/ {moneySaved}</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Packs Salvados</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700">{rescuedCount}</p>
          </div>
        </div>

        {/* Equivalencias Visuales en el Mundo Real */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 mb-10">
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full mb-1 border border-emerald-200/60">
              <Zap className="size-3 text-emerald-600" />
              Equivalencias en el mundo real
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">¿Qué significa tu CO2 evitado?</h4>
            <p className="text-xs text-slate-500">Traducción de tus kilogramos de CO2 no emitidos a indicadores tangibles:</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <TreePine className="size-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Árboles Nativos</span>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">
                  ~{treesMadreDeDios} <span className="text-xs font-bold text-emerald-600">árboles</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Equivalente a la absorción anual de árboles nativos protegidos en la selva de Madre de Dios.
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Smartphone className="size-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Cargas de Celular</span>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">
                  {smartphoneCharges.toLocaleString()} <span className="text-xs font-bold text-blue-600">recargas</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Energía limpia ahorrada equivalente a recargar tu smartphone al 100%.
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <Droplets className="size-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Agua Dulce</span>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">
                  {waterSavedLiters.toLocaleString()} <span className="text-xs font-bold text-cyan-600">Litros</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Huella hídrica agrícola preservada al evitar el descarte de comida ya cocinada.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SETTINGS MENU: PREFERENCIAS Y AJUSTES DE CUENTA TOTALMENTE FUNCIONALES */}
        <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Configuración de Cuenta & Preferencias</h3>
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100">
          
          {/* Switch 1: Notificaciones por correo */}
          <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 transition">
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Bell className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Notificaciones por Correo</h4>
                <p className="text-xs text-slate-500">Recibe confirmaciones de pedido y avisos de stock</p>
              </div>
            </div>
            <AppleSwitch
              checked={profile?.emailNotifications ?? true}
              onChange={handleToggleEmail}
              label="Notificaciones por Correo"
              id="switch-email-notifications"
            />
          </div>

          {/* Switch 2: Alertas por WhatsApp */}
          <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 transition">
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Alertas por WhatsApp</h4>
                <p className="text-xs text-slate-500">Comprobantes y recordatorios directos a tu teléfono</p>
              </div>
            </div>
            <AppleSwitch
              checked={profile?.whatsappNotifications ?? true}
              onChange={handleToggleWhatsApp}
              label="Alertas por WhatsApp"
              id="switch-whatsapp-notifications"
            />
          </div>

          {/* Switch 3: Llevar mi propio táper ecológico por defecto */}
          <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 transition">
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-leaf-soft text-leaf-deep flex items-center justify-center">
                <Leaf className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Llevar mi propio táper ecológico 🌱</h4>
                <p className="text-xs text-slate-500">Marcar automáticamente esta opción en todos tus checkouts</p>
              </div>
            </div>
            <AppleSwitch
              checked={profile?.defaultBringContainer ?? false}
              onChange={handleToggleDefaultContainer}
              label="Llevar mi propio táper por defecto"
              id="switch-default-container"
            />
          </div>

          {/* Fila: Preferencias Alimentarias */}
          <div 
            onClick={() => setIsDietaryModalOpen(true)}
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Salad className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Preferencia Alimentaria</h4>
                <p className="text-xs text-slate-500">Actual: <strong className="text-slate-800">{userDietary}</strong></p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-primary transition-colors">
              <span>Modificar</span>
              <ChevronRight className="size-4" />
            </div>
          </div>

          {/* Fila: Suscripción Prime */}
          <Link 
            href="/prime" 
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Crown className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Membresía EcoRescate Prime</h4>
                <p className="text-xs text-slate-500">
                  {isPrime 
                    ? `Activa (${profile?.primePlan === "annual" ? "Plan Anual" : "Plan Mensual"}) - Delivery Gratis` 
                    : "Obtén entregas ecológicas ilimitadas y descuentos"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-primary transition-colors">
              <span>{isPrime ? "Gestionar" : "Suscribirse"}</span>
              <ChevronRight className="size-4" />
            </div>
          </Link>

          {/* Fila: Métodos de Pago */}
          <div 
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Métodos de Pago</h4>
                <p className="text-xs text-slate-500">Yape, Plin, Tarjetas y Pago en local</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-primary transition-colors">
              <span>Consultar</span>
              <ChevronRight className="size-4" />
            </div>
          </div>

          {/* Fila: Seguridad de Cuenta - Cambiar Contraseña */}
          <div className="p-4 sm:p-5 hover:bg-slate-50/60 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Seguridad de la Cuenta</h4>
                  <p className="text-xs text-slate-500">Restablece tu contraseña mediante correo electrónico</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={passwordResetLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {passwordResetLoading ? (
                  <>
                    <Loader2 className="size-3 animate-spin text-slate-600" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Lock className="size-3 text-slate-500" />
                    <span>Cambiar contraseña</span>
                  </>
                )}
              </button>
            </div>

            {passwordResetNotice && (
              <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                passwordResetNotice.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}>
                {passwordResetNotice.type === "success" ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="size-4 text-rose-600 shrink-0" />
                )}
                <span>{passwordResetNotice.text}</span>
              </div>
            )}
          </div>

        </div>

        {/* Botón de Cerrar Sesión */}
        <div className="mt-8 flex justify-center">
          <button 
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-bold px-6 py-3 rounded-2xl hover:bg-rose-50 border border-rose-200/80 transition-colors shadow-xs cursor-pointer text-sm"
          >
            <LogOut className="size-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </div>
    </div>
  );
}
