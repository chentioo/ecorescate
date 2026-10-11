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
}

interface LeafletMapProps {
  restaurants: Restaurant[];
  userLocation: Location | null;
  center: Location;
}

export default function LeafletMap({ restaurants, userLocation, center }: LeafletMapProps) {
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

    // Iconos de los restaurantes
    restaurants.forEach((restaurant) => {
      const isAvailable = restaurant.packsAvailable > 0;
      const bgColor = isAvailable ? "#16a34a" : "#64748b";

      const iconContent = restaurant.logoUrl 
        ? `<img src="${restaurant.logoUrl}" alt="${restaurant.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
        : `<span style="font-size: 14px; font-weight: bold;">🍴</span>`;

      const restaurantIcon = L.divIcon({
        className: "custom-restaurant-pin",
        html: `
          <div style="background-color: ${bgColor}; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.25); cursor: pointer; overflow: hidden; transition: transform 0.2s;">
            ${iconContent}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const popupContent = `
        <div style="padding: 6px; font-family: system-ui, sans-serif; min-width: 140px;">
          <h4 style="margin: 0 0 3px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${restaurant.name}</h4>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">${restaurant.category}</p>
          <span style="display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 9999px; background-color: ${isAvailable ? '#dcfce7' : '#f1f5f9'}; color: ${isAvailable ? '#15803d' : '#64748b'};">
            ${isAvailable ? `${restaurant.packsAvailable} packs disponibles` : 'Agotado'}
          </span>
          <div style="margin-top: 8px;">
            <a href="/restaurant/${restaurant.id}" style="display: block; text-align: center; background: #16a34a; color: white; text-decoration: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
              Ver menú de rescate
            </a>
          </div>
        </div>
      `;

      L.marker([restaurant.location.lat, restaurant.location.lng], { icon: restaurantIcon })
        .addTo(map)
        .bindPopup(popupContent);
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
