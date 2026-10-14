import { Clock, MapPin, Tag, Sparkles } from "lucide-react";
import Image from "next/image";

interface FoodCardProps {
  id?: string;
  restaurantName: string;
  packName: string;
  originalPrice: number;
  rescuePrice: number;
  imageUrl: string;
  pickupTime: string;
  distance?: string;
  packsAvailable?: number;
  supportsTupperware?: boolean;
}

export function FoodCard({
  restaurantName,
  packName,
  originalPrice,
  rescuePrice,
  imageUrl,
  pickupTime,
  distance = "En tu zona",
  packsAvailable = 3,
  supportsTupperware = true,
}: FoodCardProps) {
  const discount = originalPrice > 0 
    ? Math.max(1, Math.round(((originalPrice - rescuePrice) / originalPrice) * 100))
    : 50;
  const isSoldOut = packsAvailable <= 0;

  return (
    <div className={`group rounded-2xl overflow-hidden flex flex-col apple-card border border-slate-200/80 bg-white transition-all duration-300 relative ${
      isSoldOut ? "opacity-65 grayscale-[35%] cursor-not-allowed" : "hover:border-primary/40"
    }`}>
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <Image
          src={imageUrl}
          alt={packName}
          fill
          className={`object-cover transition-transform duration-500 ease-out will-change-transform ${
            isSoldOut ? "" : "group-hover:scale-[1.03]"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Floating Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center gap-2">
          {supportsTupperware && !isSoldOut && (
            <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="size-3 text-emerald-400" />
              Lleva tu táper 🌱
            </span>
          )}
          {packsAvailable === 1 && (
            <span className="ml-auto bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md animate-pulse">
              ¡Último pack!
            </span>
          )}
          {packsAvailable === 2 && (
            <span className="ml-auto bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
              ¡Solo quedan 2!
            </span>
          )}
        </div>

        {/* Bottom Distance & Discount */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <span className="bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
            {distance || "En tu zona"}
          </span>
          {isSoldOut ? (
            <span className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border border-white/20">
              Agotado por hoy
            </span>
          ) : (
            <span className="bg-primary text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1 tracking-tight">
              <Tag className="size-3" />
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {restaurantName}
            </p>
            {packsAvailable === 1 && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                ¡Último pack!
              </span>
            )}
            {packsAvailable === 2 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                ¡Solo quedan 2!
              </span>
            )}
            {isSoldOut && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Agotado por hoy
              </span>
            )}
          </div>

          <h3 className="font-bold text-lg leading-snug text-slate-900 mb-2 group-hover:text-primary transition-colors duration-200">
            {packName}
          </h3>
          
          <div className="flex items-center text-slate-600 text-xs mb-3">
            <Clock className="size-3.5 mr-1.5 opacity-70 text-primary" />
            <span>Recojo: <strong className="text-slate-800">{pickupTime}</strong></span>
          </div>

          {supportsTupperware && !isSoldOut && (
            <div className="mb-3 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-2.5 py-1">
              <span>🌱</span>
              <span><strong>Acepta táper:</strong> Llévate tu comida en tu propio recipiente ecológico.</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between border-t border-slate-100 pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 line-through decoration-slate-300">
              S/ {originalPrice.toFixed(2)}
            </span>
            <span className="font-extrabold text-xl text-primary tracking-tight">
              S/ {rescuePrice.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            disabled={isSoldOut}
            className={`font-bold px-4 py-2 rounded-xl text-xs transition-all duration-200 shadow-xs ${
              isSoldOut
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-primary text-white group-hover:bg-leaf-deep shadow-primary/20 group-hover:shadow-md apple-btn cursor-pointer"
            }`}
          >
            {isSoldOut ? "Agotado por hoy" : "Reservar Pack"}
          </button>
        </div>
      </div>
    </div>
  );
}
