import { Clock, MapPin, Tag } from "lucide-react";
import Image from "next/image";

interface FoodCardProps {
  restaurantName: string;
  packName: string;
  originalPrice: number;
  rescuePrice: number;
  imageUrl: string;
  pickupTime: string;
  distance: string;
}

export function FoodCard({
  restaurantName,
  packName,
  originalPrice,
  rescuePrice,
  imageUrl,
  pickupTime,
  distance,
}: FoodCardProps) {
  const discount = Math.round((1 - rescuePrice / originalPrice) * 100);

  return (
    <div className="group glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:border-primary/20 bg-white">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={packName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <span className="bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {distance}
          </span>
          <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Tag className="size-3" />
            -{discount}%
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            {restaurantName}
          </p>
          <h3 className="font-bold text-lg leading-tight text-slate-900 mb-2 group-hover:text-primary transition-colors">
            {packName}
          </h3>
          <div className="flex items-center text-slate-600 text-sm mb-4">
            <Clock className="size-4 mr-1.5 opacity-70 text-primary" />
            <span>Recojo hoy: <strong>{pickupTime}</strong></span>
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
          <button className="bg-slate-100 hover:bg-primary hover:text-white text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}
