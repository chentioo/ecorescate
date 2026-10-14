"use client";

import { Star, MapPin, Package, Heart } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState, useEffect } from "react";

interface RestaurantCardProps {
  id?: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  packsAvailable: number;
  logoUrl?: string;
  supportsTupperware?: boolean;
}

export function RestaurantCard({
  id,
  name,
  category,
  rating,
  reviews,
  distance,
  packsAvailable,
  logoUrl,
  supportsTupperware = true,
}: RestaurantCardProps) {
  const { user, profile, updateUserProfile } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const hasPacks = packsAvailable > 0;

  useEffect(() => {
    if (!id) return;
    let favList: string[] = profile?.favoriteRestaurantIds || [];
    if (typeof window !== "undefined" && favList.length === 0) {
      try {
        favList = JSON.parse(localStorage.getItem("ecorescate_favorites") || "[]");
      } catch (e) {}
    }
    setIsFavorite(favList.includes(id));
  }, [id, profile?.favoriteRestaurantIds]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;

    let currentFavs: string[] = profile?.favoriteRestaurantIds || [];
    if (typeof window !== "undefined" && currentFavs.length === 0) {
      try {
        currentFavs = JSON.parse(localStorage.getItem("ecorescate_favorites") || "[]");
      } catch (e) {}
    }

    let nextFavs: string[];
    const nextState = !isFavorite;
    if (nextState) {
      nextFavs = [...currentFavs.filter((item) => item !== id), id];
    } else {
      nextFavs = currentFavs.filter((item) => item !== id);
    }

    setIsFavorite(nextState);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ecorescate_favorites", JSON.stringify(nextFavs));
      } catch (e) {}
    }

    if (user) {
      try {
        await updateUserProfile({ favoriteRestaurantIds: nextFavs });
      } catch (e) {
        console.error("Error al guardar favoritos:", e);
      }
    }
  };

  return (
    <div className={`apple-card rounded-2xl p-4 flex items-center gap-4 border border-slate-200/80 bg-white group transition-all duration-300 relative ${
      hasPacks ? 'hover:border-primary/40' : 'opacity-65 grayscale-[30%]'
    }`}>
      {/* Avatar / Initials */}
      <div className={`size-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 shadow-inner overflow-hidden transition-transform duration-500 ease-out group-hover:scale-[1.04] relative ${
        hasPacks ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'
      }`}>
        {logoUrl ? (
          <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          name.substring(0, 2).toUpperCase()
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 truncate tracking-tight">{name}</h3>
          {supportsTupperware && hasPacks && (
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md font-medium shrink-0">
              🌱 Táper
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">{category}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
          <div className="flex items-center">
            <Star className="size-3 text-amber-500 mr-1 fill-amber-500" />
            <span className="font-medium text-slate-700">{rating}</span>
            <span className="text-slate-400 ml-1">({reviews})</span>
          </div>
          <div className="flex items-center">
            <MapPin className="size-3 mr-1 opacity-70" />
            {distance}
          </div>
          {id && (
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`p-1 rounded-full transition-transform active:scale-90 hover:bg-slate-50 ${
                isFavorite ? "text-rose-500" : "text-slate-300 hover:text-slate-500"
              }`}
              title={isFavorite ? "Eliminar de favoritos" : "Guardar en favoritos"}
            >
              <Heart className={`size-3.5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Action / Status */}
      <div className="shrink-0 flex flex-col items-end justify-center">
        {packsAvailable === 1 && (
          <div className="flex flex-col items-end">
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1 flex items-center gap-1 animate-pulse">
              ¡Último pack!
            </span>
            <span className="text-[10px] font-semibold text-rose-500 uppercase">1 restante</span>
          </div>
        )}
        {packsAvailable === 2 && (
          <div className="flex flex-col items-end">
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1 flex items-center gap-1">
              ¡Solo quedan 2!
            </span>
            <span className="text-[10px] font-semibold text-amber-600 uppercase">2 disponibles</span>
          </div>
        )}
        {packsAvailable > 2 && (
          <div className="flex flex-col items-center">
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md mb-1 flex items-center gap-1">
              <Package className="size-3" />
              {packsAvailable}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Packs</span>
          </div>
        )}
        {packsAvailable <= 0 && (
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            Agotado por hoy
          </span>
        )}
      </div>
    </div>
  );
}
