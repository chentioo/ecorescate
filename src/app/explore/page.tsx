import { Search, MapPin, SlidersHorizontal, Navigation2 } from "lucide-react";
import { FoodCard } from "@/components/ui/FoodCard";
import { RestaurantCard } from "@/components/ui/RestaurantCard";
import { ExploreMap } from "@/components/map/ExploreMap";
import Link from "next/link";

const MOCK_PACKS = [
  {
    id: "1",
    restaurantId: "1",
    restaurantName: "La Lucha Sanguchería",
    packName: "Pack Criollo Especial",
    originalPrice: 45.0,
    rescuePrice: 20.0,
    imageUrl: "/restaurants/LALUCHA.jpg",
    pickupTime: "20:00 - 21:30",
    distance: "0.8 km",
  },
  {
    id: "2",
    restaurantId: "2",
    restaurantName: "Punto Azul",
    packName: "Pack Marino",
    originalPrice: 55.0,
    rescuePrice: 25.0,
    imageUrl: "/restaurants/PUNTOAZUL.jpg",
    pickupTime: "16:00 - 17:00",
    distance: "1.2 km",
  },
  {
    id: "3",
    restaurantId: "3",
    restaurantName: "Siete Sopas",
    packName: "Pack Sopa Menestrón",
    originalPrice: 38.0,
    rescuePrice: 15.0,
    imageUrl: "/restaurants/SieteSopas.jpg",
    pickupTime: "22:00 - 23:30",
    distance: "2.5 km",
  },
  {
    id: "4",
    restaurantId: "4",
    restaurantName: "Bodega Verde",
    packName: "Pack Desayuno Saludable",
    originalPrice: 30.0,
    rescuePrice: 14.0,
    imageUrl: "/restaurants/BodegaVerde.jpg",
    pickupTime: "11:30 - 12:30",
    distance: "3.1 km",
  },
  {
    id: "5",
    restaurantId: "5",
    restaurantName: "La Mar",
    packName: "Pack Ceviche Clásico",
    originalPrice: 75.0,
    rescuePrice: 28.0,
    imageUrl: "/restaurants/LAMAR.jpg",
    pickupTime: "15:00 - 16:30",
    distance: "1.5 km",
  },
  {
    id: "6",
    restaurantId: "6",
    restaurantName: "Roky's",
    packName: "Pack 1/4 Pollo",
    originalPrice: 28.0,
    rescuePrice: 12.0,
    imageUrl: "/restaurants/Rockys.jpg",
    pickupTime: "21:30 - 23:00",
    distance: "0.5 km",
  },
  {
    id: "7",
    restaurantId: "7",
    restaurantName: "Chifa Titi",
    packName: "Pack Chaufa Salvaje",
    originalPrice: 42.0,
    rescuePrice: 18.0,
    imageUrl: "/restaurants/ChifaTiti.jpg",
    pickupTime: "19:00 - 20:30",
    distance: "4.2 km",
  },
  {
    id: "8",
    restaurantId: "8",
    restaurantName: "Hikari",
    packName: "Pack Lomo Saltado",
    originalPrice: 35.0,
    rescuePrice: 16.0,
    imageUrl: "/restaurants/Hikari.jpg",
    pickupTime: "22:00 - 23:00",
    distance: "1.8 km",
  }
];

const MOCK_RESTAURANTS = [
  {
    id: "1",
    name: "La Lucha Sanguchería",
    category: "Sándwiches y Criollo",
    rating: 4.8,
    reviews: 2150,
    distance: "0.8 km",
    packsAvailable: 3,
    location: { lat: -12.122114, lng: -77.030999 } // Miraflores
  },
  {
    id: "2",
    name: "Punto Azul",
    category: "Pescados y Mariscos",
    rating: 4.7,
    reviews: 1840,
    distance: "1.2 km",
    packsAvailable: 5,
    location: { lat: -12.120563, lng: -77.027063 } // Miraflores
  },
  {
    id: "3",
    name: "Siete Sopas",
    category: "Caldos y Sopas",
    rating: 4.6,
    reviews: 3200,
    distance: "2.5 km",
    packsAvailable: 0,
    location: { lat: -12.096316, lng: -77.034503 } // San Isidro
  },
  {
    id: "4",
    name: "Bodega Verde",
    category: "Cafetería y Postres",
    rating: 4.8,
    reviews: 950,
    distance: "3.1 km",
    packsAvailable: 2,
    location: { lat: -12.148152, lng: -77.021759 } // Barranco
  },
  {
    id: "5",
    name: "La Mar",
    category: "Cevichería",
    rating: 4.9,
    reviews: 4500,
    distance: "1.5 km",
    packsAvailable: 2,
    location: { lat: -12.1152, lng: -77.0425 } // Miraflores
  },
  {
    id: "6",
    name: "Roky's",
    category: "Pollería",
    rating: 4.3,
    reviews: 1200,
    distance: "0.5 km",
    packsAvailable: 6,
    location: { lat: -12.1264, lng: -77.0253 } // Miraflores
  },
  {
    id: "7",
    name: "Chifa Titi",
    category: "Comida Oriental",
    rating: 4.8,
    reviews: 2100,
    distance: "4.2 km",
    packsAvailable: 1,
    location: { lat: -12.0934, lng: -77.0051 } // San Borja
  },
  {
    id: "8",
    name: "Hikari",
    category: "Pollería y Chifa",
    rating: 4.5,
    reviews: 1800,
    distance: "1.8 km",
    packsAvailable: 4,
    location: { lat: -12.0743, lng: -77.0821 } // San Miguel
  }
];

export default function ExplorePage() {
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
              {MOCK_PACKS.map(pack => (
                <Link key={pack.id} href={`/restaurant/${pack.restaurantId}`} className="block group">
                  <FoodCard {...pack} />
                </Link>
              ))}
            </div>
          </div>
          
          {/* Sidebar Column: Map & Restaurants */}
          <div className="space-y-8">
            <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-slate-200 h-96 relative flex flex-col">
              <ExploreMap restaurants={MOCK_RESTAURANTS} />
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 text-slate-800">Locales Destacados en Lima</h2>
              <div className="space-y-4">
                {MOCK_RESTAURANTS.map(restaurant => (
                  <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="block transition-transform hover:-translate-y-1">
                    <RestaurantCard {...restaurant} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
