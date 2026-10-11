"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, SlidersHorizontal, Navigation2 } from "lucide-react";
import { FoodCard } from "@/components/ui/FoodCard";
import { RestaurantCard } from "@/components/ui/RestaurantCard";
import { ExploreMap } from "@/components/map/ExploreMap";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ExplorePage() {
  const [packs, setPacks] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const packsSnapshot = await getDocs(collection(db, "packs"));
        const packsData = packsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const restsSnapshot = await getDocs(collection(db, "restaurants"));
        const restsData = restsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setPacks(packsData);
        setRestaurants(restsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Ofertas cerca de ti</h1>
            <p className="text-slate-600 mt-2">Encuentra packs de rescate en tus locales favoritos de Lima con hasta 70% de descuento.</p>
          </div>
          
          <div className="w-full md:w-auto flex gap-2">
            <div className="flex-1 md:w-80 flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 ring-primary/50 transition-all">
              <Search className="size-4 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar por plato, restaurante o distrito..." 
                className="bg-transparent border-none outline-none w-full text-sm placeholder:text-slate-400 text-slate-800"
              />
            </div>
            <button className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors">
              <SlidersHorizontal className="size-4 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Column: Packs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                Packs del Día <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-semibold">Disponibles ahora</span>
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {loading ? (
                <p className="text-slate-500">Cargando packs desde Firestore...</p>
              ) : (
                packs.map(pack => (
                  <Link key={pack.id} href={`/checkout/${pack.id}`} className="block group">
                    <FoodCard {...(pack as any)} />
                  </Link>
                ))
              )}
            </div>
          </div>
          
          {/* Sidebar Column: Map & Restaurants */}
          <div className="space-y-8">
            <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-slate-200 h-96 relative flex flex-col">
              {!loading && <ExploreMap restaurants={restaurants} />}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 text-slate-800">Locales Destacados en Lima</h2>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-slate-500">Cargando restaurantes...</p>
                ) : (
                  restaurants.map(restaurant => (
                    <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="block transition-transform hover:-translate-y-1">
                      <RestaurantCard {...(restaurant as any)} />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
