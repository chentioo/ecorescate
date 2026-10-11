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
}: FoodCardProps) {
  const discount = originalPrice > 0 
    ? Math.round((1 - rescuePrice / originalPrice) * 100) 
    : 50;
  const isSoldOut = packsAvailable <= 0;

  return (
    <div className={`group glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:border-primary/20 bg-white ${
      isSoldOut ? "opacity-75 grayscale-[30%]" : ""
    }`}>
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <Image
          src={imageUrl}
          alt={packName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <span className="bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
            {distance || "En tu zona"}
          </span>
          {isSoldOut ? (
            <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Agotado hoy
            </span>
          ) : (
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Tag className="size-3" />
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">
              {restaurantName}
            </p>
            {!isSoldOut && packsAvailable <= 2 && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                ¡Solo quedan {packsAvailable}!
              </span>
            )}
          </div>

          <h3 className="font-bold text-lg leading-tight text-slate-900 mb-2 group-hover:text-primary transition-colors">
            {packName}
          </h3>
          <div className="flex items-center text-slate-600 text-sm mb-4">
            <Clock className="size-4 mr-1.5 opacity-70 text-primary" />
            <span>Recojo: <strong>{pickupTime}</strong></span>
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-slate-100 pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 line-through decoration-slate-300">
              S/ {originalPrice.toFixed(2)}
            </span>
            <span className="font-extrabold text-xl text-primary">
              S/ {rescuePrice.toFixed(2)}
            </span>
          </div>

          <span className={`font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm ${
            isSoldOut
              ? "bg-slate-100 text-slate-400"
              : "bg-primary text-white group-hover:bg-leaf-deep shadow-primary/20"
          }`}>
            {isSoldOut ? "Agotado" : "Reservar Pack"}
          </span>
        </div>
      </div>
    </div>
  );
}
