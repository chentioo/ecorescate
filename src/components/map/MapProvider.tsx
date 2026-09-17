"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { ReactNode } from "react";

export function MapProvider({ children }: { children: ReactNode }) {
  const rawKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const isValidGoogleKey = rawKey.trim().length > 0 && rawKey !== "DEMO_MAPS_API_KEY" && rawKey.startsWith("AIza");

  if (!isValidGoogleKey) {
    // Si no hay una clave real de Google Maps, renderizamos los hijos sin cargar el SDK de Google
    // para evitar el error InvalidKeyMapError en consola.
    return <>{children}</>;
  }

  return (
    <APIProvider apiKey={rawKey} language="es" region="PE">
      {children}
    </APIProvider>
  );
}
