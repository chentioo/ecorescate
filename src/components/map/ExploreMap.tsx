"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { Loader2, Navigation, AlertCircle, CheckCircle2 } from "lucide-react";

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
    logoUrl?: string;
  }>;
}

// Centro de Lima por defecto (Miraflores)
const DEFAULT_CENTER = { lat: -12.122114, lng: -77.030999 };

export function ExploreMap({ restaurants }: ExploreMapProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"loading" | "granted" | "denied" | "default">("loading");
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  const rawKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const hasValidGoogleKey = rawKey.trim().length > 0 && rawKey !== "DEMO_MAPS_API_KEY" && rawKey.startsWith("AIza");

  const requestGeolocation = () => {
    setIsLoadingGeo(true);
    setShowPermissionHelp(false);

    if (typeof window === "undefined" || !navigator.geolocation) {
      console.warn("Geolocalización no soportada en este navegador.");
      setIsLoadingGeo(false);
      setGeoStatus("denied");
      setUserLocation(DEFAULT_CENTER);
      return;
    }

    // Usamos enableHighAccuracy: false primero para respuesta rápida en laptops/PC de escritorio
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingGeo(false);
        setGeoStatus("granted");
      },
      (err) => {
        console.warn("Intento rápido falló:", err.message, "- Intentando alta precisión...");
        
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setIsLoadingGeo(false);
            setGeoStatus("granted");
          },
          (secondErr) => {
            console.warn("No se pudo obtener ubicación por GPS/WiFi:", secondErr.message);
            setIsLoadingGeo(false);
            setGeoStatus(secondErr.code === 1 ? "denied" : "default");
            if (secondErr.code === 1) {
              setShowPermissionHelp(true);
            }
            // Ubicación en Lima por defecto para no dejar el mapa vacío
            setUserLocation(DEFAULT_CENTER);
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
        );
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    // Al montar, intentamos solicitar la ubicación
    requestGeolocation();
  }, []);

  return (
    <div className="w-full h-full min-h-[380px] rounded-2xl overflow-hidden relative group">
      
      {/* Barra superior flotante de estado y botón de geolocalización */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex justify-between items-center pointer-events-none">
        
        {/* Estado de ubicación */}
        <div className="pointer-events-auto">
          {geoStatus === "granted" ? (
            <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-md text-xs font-semibold text-emerald-700 flex items-center gap-1.5 border border-emerald-200">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ubicación detectada</span>
            </div>
          ) : geoStatus === "denied" ? (
            <button
              onClick={() => setShowPermissionHelp(!showPermissionHelp)}
              className="bg-amber-50/95 hover:bg-amber-100 backdrop-blur px-3 py-1.5 rounded-full shadow-md text-xs font-semibold text-amber-800 flex items-center gap-1.5 border border-amber-300 transition"
            >
              <AlertCircle className="size-3.5 text-amber-600" />
              <span>Ubicación bloqueada (clic aquí)</span>
            </button>
          ) : (
            <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-slate-600 flex items-center gap-1.5 border border-slate-200">
              <span className="size-2 rounded-full bg-blue-500"></span>
              <span>Lima (Referencial)</span>
            </div>
          )}
        </div>

        {/* Botón explícito para pedir permiso / centrar ubicación con gesto de clic */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={requestGeolocation}
            disabled={isLoadingGeo}
            title="Activar o actualizar mi ubicación actual"
            className="bg-primary hover:bg-leaf-deep text-white px-3.5 py-2 rounded-xl shadow-lg border border-primary/20 transition-all flex items-center gap-2 text-xs font-bold active:scale-95 disabled:opacity-70"
          >
            {isLoadingGeo ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Navigation className="size-4" />
                <span>{geoStatus === "granted" ? "Mi Ubicación" : "Activar Ubicación"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner de ayuda si el navegador bloqueó la ubicación */}
      {showPermissionHelp && (
        <div className="absolute top-16 left-3 right-3 z-[1000] bg-white rounded-2xl p-4 shadow-xl border border-amber-200 text-xs text-slate-700 animate-fadeIn">
          <div className="flex justify-between items-start mb-1">
            <span className="font-bold text-amber-800 flex items-center gap-1">
              <AlertCircle className="size-4 text-amber-600" /> Cómo activar los permisos:
            </span>
            <button 
              onClick={() => setShowPermissionHelp(false)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-600 mt-1">
            En la barra de direcciones de Chrome, haz clic en el ícono de <strong>Ajustes / Candado 🔒</strong> al lado de <code>localhost:3000</code> y cambia <strong>Ubicación</strong> a <strong>Permitir</strong>, luego presiona el botón verde de nuevo.
          </p>
        </div>
      )}

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
              <div className="size-5 bg-blue-600 border-3 border-white rounded-full shadow-lg shadow-blue-500/50 animate-pulse" />
            </AdvancedMarker>
          )}

          {restaurants.map((restaurant) => (
            <AdvancedMarker
              key={restaurant.id}
              position={restaurant.location}
              title={restaurant.name}
            >
              {restaurant.logoUrl ? (
                <div className={`size-9 rounded-full overflow-hidden border-2 shadow-md flex items-center justify-center bg-white ${
                  restaurant.packsAvailable > 0 ? "border-green-600" : "border-slate-500 opacity-80 grayscale-[20%]"
                }`}>
                  <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <Pin
                  background={restaurant.packsAvailable > 0 ? "#16a34a" : "#64748b"}
                  borderColor={restaurant.packsAvailable > 0 ? "#15803d" : "#475569"}
                  glyphColor="#ffffff"
                />
              )}
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
