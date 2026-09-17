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

    // Destruir mapa previo si existe
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

    // Añadir capa de azulejos limpia (CartoDB Positron / OSM)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // Controles de zoom abajo a la derecha
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Icono personalizado para el usuario
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "custom-user-pin",
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 24px; height: 24px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; background: #2563eb; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3); z-index: 10;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>📍 Tu ubicación actual</b>");
    }

    // Iconos personalizados para los restaurantes
    restaurants.forEach((restaurant) => {
      const isAvailable = restaurant.packsAvailable > 0;
      const bgColor = isAvailable ? "#16a34a" : "#64748b";

      const restaurantIcon = L.divIcon({
        className: "custom-restaurant-pin",
        html: `
          <div style="background-color: ${bgColor}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); cursor: pointer; transition: transform 0.2s;">
            <span style="font-size: 14px; font-weight: bold;">🍴</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupContent = `
        <div style="padding: 4px; font-family: system-ui, sans-serif;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${restaurant.name}</h4>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">${restaurant.category}</p>
          <span style="display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 9999px; background-color: ${isAvailable ? '#dcfce7' : '#f1f5f9'}; color: ${isAvailable ? '#15803d' : '#64748b'};">
            ${isAvailable ? `${restaurant.packsAvailable} packs disponibles` : 'Agotado'}
          </span>
          <div style="margin-top: 8px;">
            <a href="/restaurant/${restaurant.id}" style="display: inline-block; width: 100%; text-align: center; background: #16a34a; color: white; text-decoration: none; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
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
