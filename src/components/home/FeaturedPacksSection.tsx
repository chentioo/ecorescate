"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Check, SearchX, RotateCcw, Sparkles } from "lucide-react";
import { FoodCard } from "@/components/ui/FoodCard";

const CATEGORIES = ["Todos", "Criollo", "Mariscos", "Pollería", "Chifa", "Cafetería"] as const;
type Category = (typeof CATEGORIES)[number];

const FEATURED_PACKS = [
  {
    id: "1",
    restaurantId: "1",
    restaurantName: "La Lucha Sanguchería",
    packName: "Pack Criollo Especial",
    originalPrice: 38.90,
    rescuePrice: 14.90,
    imageUrl: "/restaurants/LALUCHA.jpg",
    pickupTime: "20:00 - 21:30",
    distance: "Miraflores · 0.8 km",
    packsAvailable: 3,
    status: "available",
    category: "Criollo",
    supportsTupperware: true
  },
  {
    id: "2",
    restaurantId: "2",
    restaurantName: "Punto Azul",
    packName: "Pack Marino",
    originalPrice: 52.00,
    rescuePrice: 19.90,
    imageUrl: "/restaurants/PUNTOAZUL.jpg",
    pickupTime: "16:00 - 17:30",
    distance: "Miraflores · 1.2 km",
    packsAvailable: 1,
    status: "available",
    category: "Mariscos",
    supportsTupperware: true
  },
  {
    id: "4",
    restaurantId: "4",
    restaurantName: "Bodega Verde",
    packName: "Pack Desayuno Saludable",
    originalPrice: 28.50,
    rescuePrice: 12.90,
    imageUrl: "/restaurants/BodegaVerde.jpg",
    pickupTime: "11:00 - 12:30",
    distance: "Barranco · 0.5 km",
    packsAvailable: 2,
    status: "available",
    category: "Cafetería",
    supportsTupperware: true
  },
  {
    id: "6",
    restaurantId: "6",
    restaurantName: "Roky's",
    packName: "Pack 1/4 Pollo a la Brasa",
    originalPrice: 26.90,
    rescuePrice: 11.90,
    imageUrl: "/restaurants/Rockys.jpg",
    pickupTime: "21:00 - 22:30",
    distance: "Surco · 1.0 km",
    packsAvailable: 5,
    status: "available",
    category: "Pollería",
    supportsTupperware: true
  },
  {
    id: "7",
    restaurantId: "7",
    restaurantName: "Chifa Titi",
    packName: "Pack Chaufa Salvaje",
    originalPrice: 59.00,
    rescuePrice: 22.90,
    imageUrl: "/restaurants/ChifaTiti.jpg",
    pickupTime: "21:30 - 23:00",
    distance: "San Borja · 3.4 km",
    packsAvailable: 2,
    status: "available",
    category: "Chifa",
    supportsTupperware: true
  },
  {
    id: "3",
    restaurantId: "3",
    restaurantName: "Siete Sopas",
    packName: "Pack Sopa Menestrón",
    originalPrice: 34.00,
    rescuePrice: 14.90,
    imageUrl: "/restaurants/SieteSopas.jpg",
    pickupTime: "21:30 - 23:00",
    distance: "Lince · 2.1 km",
    packsAvailable: 0,
    status: "sold_out",
    category: "Criollo",
    supportsTupperware: true
  }
];

function FoodCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white flex flex-col apple-card">
      <div className="relative h-48 w-full apple-shimmer" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="h-3 w-1/3 rounded-md apple-shimmer" />
          <div className="h-5 w-3/4 rounded-md apple-shimmer" />
          <div className="h-3 w-1/2 rounded-md apple-shimmer" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="h-6 w-20 rounded-md apple-shimmer" />
          <div className="h-8 w-28 rounded-xl apple-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedPacksSection() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("Todos");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [under15, setUnder15] = useState(false);

  const matchesCategory = (item: any, cat: Category) => {
    if (cat === "Todos") return true;
    const text = `${item.category || ""} ${item.packName || ""} ${item.restaurantName || ""}`.toLowerCase();
    if (cat === "Criollo") return text.includes("criollo") || text.includes("sopa") || text.includes("lucha");
    if (cat === "Mariscos") return text.includes("marisco") || text.includes("pescado") || text.includes("ceviche") || text.includes("marino");
    if (cat === "Pollería") return text.includes("pollo") || text.includes("pollería") || text.includes("polleria") || text.includes("roky");
    if (cat === "Chifa") return text.includes("chifa") || text.includes("oriental") || text.includes("chaufa");
    if (cat === "Cafetería") return text.includes("café") || text.includes("cafe") || text.includes("postre") || text.includes("verde") || text.includes("desayuno");
    return false;
  };

  const filteredPacks = useMemo(() => {
    return FEATURED_PACKS.filter((pack) => {
      if (!matchesCategory(pack, selectedCategory)) return false;
      if (onlyAvailable && pack.packsAvailable <= 0) return false;
      if (under15 && pack.rescuePrice >= 15) return false;
      return true;
    });
  }, [selectedCategory, onlyAvailable, under15]);

  const handleResetFilters = () => {
    setSelectedCategory("Todos");
    setOnlyAvailable(false);
    setUnder15(false);
  };

  return (
    <section className="py-20 bg-slate-50/70 border-b border-slate-200/60" id="restaurantes">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-100/80 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-emerald-200/80">
              <Sparkles className="size-3.5 text-emerald-600" />
              Packs disponibles hoy en Lima
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Rescata antes que se agoten
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Comida de primera calidad preparada hoy con descuentos de hasta 70%.
            </p>
          </div>

          <Link
            href="/explore"
            className="apple-btn inline-flex items-center gap-2 text-primary hover:text-leaf-deep font-bold text-sm bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-xs self-start md:self-auto"
          >
            Ver todos en el mapa
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Quick Filters Bar */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`apple-btn px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`apple-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyAvailable
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <div className={`size-3.5 rounded-md flex items-center justify-center text-[10px] ${
                onlyAvailable ? "bg-white/20 text-white" : "border border-slate-300"
              }`}>
                {onlyAvailable && <Check className="size-2.5 stroke-[3]" />}
              </div>
              Solo disponibles ahora
            </button>

            <button
              onClick={() => setUnder15(!under15)}
              className={`apple-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                under15
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <Flame className={`size-3.5 ${under15 ? "text-amber-200" : "text-amber-500"}`} />
              Menos de S/ 15
            </button>

            {(selectedCategory !== "Todos" || onlyAvailable || under15) && (
              <button
                onClick={handleResetFilters}
                className="apple-btn inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl font-medium"
              >
                <RotateCcw className="size-3" />
                Restablecer
              </button>
            )}

            <span className="text-xs text-slate-400 ml-auto hidden sm:inline">
              Mostrando {filteredPacks.length} de {FEATURED_PACKS.length} ofertas
            </span>
          </div>
        </div>

        {/* Packs Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPacks.length > 0 ? (
            filteredPacks.map((pack, idx) => (
              <Link
                key={pack.id}
                href={`/checkout/${pack.id}`}
                className="block group animate-apple-fade-up"
                style={{ animationDelay: `${Math.min(idx * 60, 360)}ms` }}
              >
                <FoodCard {...pack} />
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 px-6 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center animate-apple-fade-up">
              <div className="size-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <SearchX className="size-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No encontramos ofertas con estos filtros</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-6">
                Prueba cambiando de categoría o desactivando los filtros para ver todos los packs disponibles.
              </p>
              <button
                onClick={handleResetFilters}
                className="apple-btn inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                Restablecer filtros
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
