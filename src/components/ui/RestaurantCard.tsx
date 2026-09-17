import { Star, MapPin, Package } from "lucide-react";

interface RestaurantCardProps {
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  packsAvailable: number;
}

export function RestaurantCard({
  name,
  category,
  rating,
  reviews,
  distance,
  packsAvailable,
}: RestaurantCardProps) {
  const hasPacks = packsAvailable > 0;

  return (
    <div className={`glass-card rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-md bg-white ${
      hasPacks ? 'hover:border-primary/20' : 'opacity-80 grayscale-[20%]'
    }`}>
      {/* Avatar / Initials */}
      <div className={`size-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 shadow-inner ${
        hasPacks ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'
      }`}>
        {name.substring(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 truncate">{name}</h3>
        <p className="text-xs text-slate-500 truncate">{category}</p>
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
        </div>
      </div>

      {/* Action / Status */}
      <div className="shrink-0 flex flex-col items-end justify-center">
        {hasPacks ? (
          <div className="flex flex-col items-center">
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md mb-1 flex items-center gap-1">
              <Package className="size-3" />
              {packsAvailable}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Packs</span>
          </div>
        ) : (
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
            Agotado
          </span>
        )}
      </div>
    </div>
  );
}
