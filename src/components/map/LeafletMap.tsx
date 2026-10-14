"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Location {
  lat: number;
  lng: number;
}

interface Restaurant {
  id: string;
  name: string;
  category: string;
  location: Location;
  packsAvailable: number;
  logoUrl?: string;
  rating?: number;
}

interface LeafletMapProps {
  restaurants: Restaurant[];
  userLocation: Location | null;
  center: Location;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
}

export default function LeafletMap({ restaurants, userLocation, center, onSelectRestaurant }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destruir mapa previo si existe para re-renderizado limpio
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCenter = userLocation || center;

    // Inicializar mapa de Leaflet
    const map = L.map(mapContainerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: 14,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Capa de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Controles de zoom abajo a la derecha
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Marcador de Ubicación del Usuario (Punto azul con halo pulsante)
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: pulse 2s infinite ease-in-out;"></div>
            <div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.35); z-index: 10;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Halo de radio de precisión
      L.circle([userLocation.lat, userLocation.lng], {
        radius: 350,
        color: "#3b82f6",
        fillColor: "#60a5fa",
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map);

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; padding: 4px; font-family: system-ui, sans-serif;">
            <p style="margin: 0; font-size: 13px; font-weight: bold; color: #1e40af;">📍 Tu ubicación actual</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Buscando ofertas cerca de ti</p>
          </div>
        `);
    }

    // Iconos de los restaurantes con etiquetas limpias estilo Apple / Airbnb
    restaurants.forEach((restaurant) => {
      const isAvailable = restaurant.packsAvailable > 0;
      const tagText = isAvailable 
        ? `${restaurant.packsAvailable} ${restaurant.packsAvailable === 1 ? 'pack' : 'packs'}` 
        : 'Agotado';

      const restaurantIcon = L.divIcon({
        className: "custom-restaurant-pill",
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: ${isAvailable ? '#ffffff' : '#f8fafc'};
            color: ${isAvailable ? '#0f172a' : '#64748b'};
            padding: 4px 10px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18), 0 1px 2px rgba(0,0,0,0.06);
            border: 1.5px solid ${isAvailable ? '#16a34a' : '#cbd5e1'};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease;
          ">
            <span style="
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: ${isAvailable ? '#16a34a' : '#94a3b8'};
              display: inline-block;
            "></span>
            <span>${tagText}</span>
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });

      const marker = L.marker([restaurant.location.lat, restaurant.location.lng], { icon: restaurantIcon })
        .addTo(map);

      marker.on("click", () => {
        if (onSelectRestaurant) {
          onSelectRestaurant(restaurant);
        }
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [restaurants, userLocation, center]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[360px] rounded-2xl z-0" 
      style={{ position: "relative" }}
    />
  );
}
