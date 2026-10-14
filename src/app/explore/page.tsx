"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, Sparkles, RotateCcw, SearchX, Check, Flame } from "lucide-react";
import { FoodCard } from "@/components/ui/FoodCard";
import { RestaurantCard } from "@/components/ui/RestaurantCard";
import { ExploreMap } from "@/components/map/ExploreMap";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const CATEGORIES = ["Todos", "Criollo", "Mariscos", "Pollería", "Chifa", "Cafetería"] as const;
type Category = (typeof CATEGORIES)[number];

const FALLBACK_PACKS = [
  {
    id: "1",
    restaurantId: "1",
    restaurantName: "La Lucha Sanguchería",
    packName: "Pack Criollo Especial",
    originalPrice: 38.90,
    rescuePrice: 14.90,
    imageUrl: "/restaurants/LALUCHA.jpg",
    pickupTime: "20:00 - 21:30",
    distance: "0.8 km",
    packsAvailable: 3,
    status: "available",
    category: "Criollo"
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
    distance: "1.2 km",
    packsAvailable: 1,
    status: "available",
    category: "Mariscos"
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
    distance: "2.1 km",
    packsAvailable: 0,
    status: "sold_out",
    category: "Criollo"
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
    distance: "0.5 km",
    packsAvailable: 2,
    status: "available",
    category: "Cafetería"
  },
  {
    id: "5",
    restaurantId: "5",
    restaurantName: "La Mar Cevichería",
    packName: "Pack Ceviche Clásico",
    originalPrice: 79.00,
    rescuePrice: 29.90,
    imageUrl: "/restaurants/LAMAR.jpg",
    pickupTime: "16:30 - 17:45",
    distance: "1.5 km",
    packsAvailable: 4,
    status: "available",
    category: "Mariscos"
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
    distance: "1.0 km",
    packsAvailable: 5,
    status: "available",
    category: "Pollería"
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
    distance: "3.4 km",
    packsAvailable: 2,
    status: "available",
    category: "Chifa"
  },
  {
    id: "8",
    restaurantId: "8",
    restaurantName: "Hikari",
    packName: "Pack Lomo Saltado Criollo",
    originalPrice: 44.90,
    rescuePrice: 17.90,
    imageUrl: "/restaurants/Hikari.jpg",
    pickupTime: "20:30 - 22:00",
    distance: "2.8 km",
    packsAvailable: 3,
    status: "available",
    category: "Pollería"
  }
];

export const FALLBACK_RESTAURANTS = [
  { id: "1", name: "La Lucha Sanguchería", category: "Sándwiches y Criollo", rating: 4.8, reviews: 2150, distance: "0.8 km", packsAvailable: 3, logoUrl: "/restaurants/LALUCHA.jpg", location: { lat: -12.122114, lng: -77.030999 } },
  { id: "2", name: "Punto Azul", category: "Pescados y Mariscos", rating: 4.7, reviews: 1840, distance: "1.2 km", packsAvailable: 1, logoUrl: "/restaurants/PUNTOAZUL.jpg", location: { lat: -12.120563, lng: -77.027063 } },
  { id: "3", name: "Siete Sopas", category: "Caldos y Sopas", rating: 4.6, reviews: 3200, distance: "2.1 km", packsAvailable: 0, logoUrl: "/restaurants/SieteSopas.jpg", location: { lat: -12.086316, lng: -77.034503 } },
  { id: "4", name: "Bodega Verde", category: "Cafetería y Postres", rating: 4.8, reviews: 950, distance: "0.5 km", packsAvailable: 2, logoUrl: "/restaurants/BodegaVerde.jpg", location: { lat: -12.148152, lng: -77.021759 } },
  { id: "5", name: "La Mar", category: "Cevichería", rating: 4.9, reviews: 4500, distance: "1.5 km", packsAvailable: 4, logoUrl: "/restaurants/LAMAR.jpg", location: { lat: -12.1152, lng: -77.0425 } },
  { id: "6", name: "Roky's", category: "Pollería", rating: 4.3, reviews: 1200, distance: "1.0 km", packsAvailable: 5, logoUrl: "/restaurants/Rockys.jpg", location: { lat: -12.1264, lng: -77.0253 } },
  { id: "7", name: "Chifa Titi", category: "Comida Oriental", rating: 4.8, reviews: 2100, distance: "3.4 km", packsAvailable: 2, logoUrl: "/restaurants/ChifaTiti.jpg", location: { lat: -12.0934, lng: -77.0051 } },
  { id: "8", name: "Hikari", category: "Pollería y Chifa", rating: 4.5, reviews: 1800, distance: "2.8 km", packsAvailable: 3, logoUrl: "/restaurants/Hikari.jpg", location: { lat: -12.0743, lng: -77.0821 } }
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

function RestaurantCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-4 border border-slate-200/80 bg-white">
      <div className="size-14 rounded-xl apple-shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded-md apple-shimmer" />
        <div className="h-3 w-1/2 rounded-md apple-shimmer" />
        <div className="h-3 w-1/3 rounded-md apple-shimmer" />
      </div>
      <div className="h-8 w-16 rounded-lg apple-shimmer shrink-0" />
    </div>
  );
}

export default function ExplorePage() {
  const [packs, setPacks] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros rápidos
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Todos");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [under15, setUnder15] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const packsSnapshot = await getDocs(collection(db, "packs"));
        const packsData = packsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const restsSnapshot = await getDocs(collection(db, "restaurants"));
        const restsData = restsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setPacks(packsData.length > 0 ? packsData : FALLBACK_PACKS);
        setRestaurants(restsData.length > 0 ? restsData : FALLBACK_RESTAURANTS);
      } catch (error) {
        console.error("Error fetching data, using fallbacks:", error);
        setPacks(FALLBACK_PACKS);
        setRestaurants(FALLBACK_RESTAURANTS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const matchesCategory = (item: any, cat: Category) => {
    if (cat === "Todos") return true;
    const text = `${item.category || ""} ${item.packName || ""} ${item.restaurantName || ""} ${item.name || ""}`.toLowerCase();
    if (cat === "Criollo") return text.includes("criollo") || text.includes("sopa") || text.includes("lucha");
    if (cat === "Mariscos") return text.includes("marisco") || text.includes("pescado") || text.includes("ceviche") || text.includes("marino");
    if (cat === "Pollería") return text.includes("pollo") || text.includes("pollería") || text.includes("polleria") || text.includes("roky") || text.includes("hikari");
    if (cat === "Chifa") return text.includes("chifa") || text.includes("oriental") || text.includes("chaufa") || text.includes("titi");
    if (cat === "Cafetería") return text.includes("café") || text.includes("cafe") || text.includes("postre") || text.includes("verde") || text.includes("desayuno");
    return false;
  };

  // Filtrado reactivo de packs
  const filteredPacks = useMemo(() => {
    return packs.filter((pack) => {
      // Búsqueda por texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const packText = `${pack.packName || ""} ${pack.restaurantName || ""} ${pack.category || ""}`.toLowerCase();
        if (!packText.includes(query)) return false;
      }

      // Filtro de categoría
      if (!matchesCategory(pack, selectedCategory)) {
        return false;
      }

      // Solo disponibles ahora
      if (onlyAvailable && Number(pack.packsAvailable ?? 0) <= 0) {
        return false;
      }

      // Menos de S/ 15
      if (under15 && Number(pack.rescuePrice ?? 0) >= 15) {
        return false;
      }

      return true;
    });
  }, [packs, searchQuery, selectedCategory, onlyAvailable, under15]);

  // Filtrado reactivo de restaurantes
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((rest) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const restText = `${rest.name || ""} ${rest.category || ""}`.toLowerCase();
        if (!restText.includes(query)) return false;
      }

      if (!matchesCategory(rest, selectedCategory)) {
        return false;
      }

      if (onlyAvailable && Number(rest.packsAvailable ?? 0) <= 0) {
        return false;
      }

      return true;
    });
  }, [restaurants, searchQuery, selectedCategory, onlyAvailable]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todos");
    setOnlyAvailable(false);
    setUnder15(false);
  };

  const hasActiveFilters = searchQuery.trim() !== "" || selectedCategory !== "Todos" || onlyAvailable || under15;

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6 animate-apple-fade-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Ofertas cerca de ti</h1>
            <p className="text-slate-600 mt-1.5 text-sm sm:text-base">
              Encuentra packs de rescate en tus locales favoritos de Lima con hasta 70% de descuento.
            </p>
          </div>
          
          <div className="w-full md:w-auto flex gap-2">
            <div className="flex-1 md:w-80 flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:ring-2 ring-primary/40 focus-within:border-primary/40 transition-all">
              <Search className="size-4 text-slate-400 mr-2.5 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por plato, local o distrito..." 
                className="bg-transparent border-none outline-none w-full text-sm placeholder:text-slate-400 text-slate-800"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="text-xs text-slate-400 hover:text-slate-600 px-1 font-semibold"
                >
                  ✕
                </button>
              )}
            </div>
            
            {hasActiveFilters && (
              <button 
                onClick={handleResetFilters}
                title="Restablecer filtros"
                className="bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2 flex items-center justify-center shadow-xs hover:bg-slate-50 apple-btn text-xs font-semibold text-slate-600 gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Píldoras de Filtros Rápidos & Toggles */}
        <div className="mb-8 space-y-3 animate-apple-fade-up stagger-1">
          {/* Categorías */}
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

          {/* Toggle Pills: Disponibles & Menos de S/ 15 */}
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

            <span className="text-xs text-slate-400 ml-auto hidden sm:inline">
              Mostrando {filteredPacks.length} {filteredPacks.length === 1 ? "pack" : "packs"}
            </span>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Column: Packs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6 animate-apple-fade-up stagger-1">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                Packs del Día
                <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {filteredPacks.length} encontrados
                </span>
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {loading ? (
                <>
                  <FoodCardSkeleton />
                  <FoodCardSkeleton />
                  <FoodCardSkeleton />
                  <FoodCardSkeleton />
                </>
              ) : filteredPacks.length > 0 ? (
                filteredPacks.map((pack, idx) => (
                  <Link 
                    key={pack.id} 
                    href={`/checkout/${pack.id}`} 
                    className="block group animate-apple-fade-up"
                    style={{ animationDelay: `${Math.min(idx * 60, 480)}ms` }}
                  >
                    <FoodCard {...(pack as any)} />
                  </Link>
                ))
              ) : (
                <div className="col-span-2 py-16 px-6 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center animate-apple-fade-up">
                  <div className="size-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                    <SearchX className="size-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No encontramos ofertas con estos filtros</h3>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-6">
                    Prueba cambiando de categoría, desactivando filtros o buscando otro distrito o plato.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="apple-btn inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
                  >
                    <RotateCcw className="size-3.5" />
                    Restablecer filtros
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar Column: Map & Restaurants */}
          <div className="space-y-8 animate-apple-fade-up stagger-2">
            <div className="glass-card rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 h-96 relative flex flex-col apple-card">
              {!loading && <ExploreMap restaurants={filteredRestaurants} />}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Locales Destacados</h2>
                <span className="text-xs text-slate-400">{filteredRestaurants.length} locales</span>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <>
                    <RestaurantCardSkeleton />
                    <RestaurantCardSkeleton />
                    <RestaurantCardSkeleton />
                  </>
                ) : filteredRestaurants.length > 0 ? (
                  filteredRestaurants.map((restaurant, idx) => (
                    <Link 
                      key={restaurant.id} 
                      href={`/restaurant/${restaurant.id}`} 
                      className="block animate-apple-fade-up"
                      style={{ animationDelay: `${Math.min(idx * 60, 480)}ms` }}
                    >
                      <RestaurantCard {...(restaurant as any)} />
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200/70 p-4">
                    No hay restaurantes para este criterio.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
