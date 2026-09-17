"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { Loader2, MapPin, Navigation } from "lucide-react";

// Importación dinámica de Leaflet para evitar problemas con Server-Side Rendering (SSR)
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center bg-slate-50 text-slate-500 rounded-2xl">
      <Loader2 className="size-7 animate-spin text-primary mb-2" />
      <span className="text-xs font-medium">Cargando mapa interactivo...</span>
    </div>
  ),
});

interface Location {
  lat: number;
  lng: number;
}

interface ExploreMapProps {
  restaurants: Array<{
    id: string;
    name: string;
    category: string;
    location: Location;
    packsAvailable: number;
  }>;
}

// Centro de Lima por defecto (Miraflores/San Isidro)
const DEFAULT_CENTER = { lat: -12.122114, lng: -77.030999 };

export function ExploreMap({ restaurants }: ExploreMapProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);

  const rawKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const hasValidGoogleKey = rawKey.trim().length > 0 && rawKey !== "DEMO_MAPS_API_KEY" && rawKey.startsWith("AIza");

  const requestGeolocation = () => {
    setIsLoadingGeo(true);
    if (!navigator.geolocation) {
      setIsLoadingGeo(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingGeo(false);
      },
      (err) => {
        console.warn("No se pudo obtener la geolocalización exacta:", err.message);
        setIsLoadingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    requestGeolocation();
  }, []);

  return (
    <div className="w-full h-full min-h-[380px] rounded-2xl overflow-hidden relative group">
      {/* Botón flotante para centrar / actualizar geolocalización */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-2">
        <button
          onClick={requestGeolocation}
          title="Centrar en mi ubicación"
          className="bg-white/95 hover:bg-white text-slate-700 hover:text-primary p-2.5 rounded-xl shadow-md border border-slate-200/80 transition-all flex items-center justify-center backdrop-blur"
        >
          {isLoadingGeo ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : (
            <Navigation className="size-4 text-emerald-600" />
          )}
        </button>
      </div>

      {/* Renderizado de Mapa según disponibilidad de API Key */}
      {hasValidGoogleKey ? (
        <Map
          mapId={process.env.NEXT_PUBLIC_MAP_ID || "DEMO_MAP_ID"}
          defaultZoom={14}
          defaultCenter={userLocation || DEFAULT_CENTER}
          gestureHandling={"greedy"}
          disableDefaultUI={false}
          className="w-full h-full min-h-[380px]"
        >
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Tu ubicación">
              <div className="size-4 bg-blue-500 border-2 border-white rounded-full shadow-md shadow-blue-500/50" />
            </AdvancedMarker>
          )}

          {restaurants.map((restaurant) => (
            <AdvancedMarker
              key={restaurant.id}
              position={restaurant.location}
              title={restaurant.name}
            >
              <Pin
                background={restaurant.packsAvailable > 0 ? "#16a34a" : "#64748b"}
                borderColor={restaurant.packsAvailable > 0 ? "#15803d" : "#475569"}
                glyphColor="#ffffff"
              />
            </AdvancedMarker>
          ))}
        </Map>
      ) : (
        <LeafletMap
          restaurants={restaurants}
          userLocation={userLocation}
          center={DEFAULT_CENTER}
        />
      )}
    </div>
  );
}
