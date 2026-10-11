import { NextResponse } from "next/server";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  increment 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export interface CreatePackPayload {
  restaurantId: string;
  restaurantName: string;
  packName: string;
  originalPrice: number;
  rescuePrice: number;
  packsAvailable: number;
  pickupTime: string;
  imageUrl?: string;
  category?: string;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const body: CreatePackPayload = await request.json();

    if (!body.restaurantId || !body.packName || !body.rescuePrice) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Campos requeridos: restaurantId, packName y rescuePrice son obligatorios." 
        },
        { status: 400 }
      );
    }

    const originalPrice = Number(body.originalPrice || body.rescuePrice * 2.2);
    const rescuePrice = Number(body.rescuePrice);
    const packsAvailable = Math.max(1, Number(body.packsAvailable || 1));
    const packId = `pack-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Obtener datos y ubicación del restaurante
    let address = "Lima, Perú";
    let location = { lat: -12.122, lng: -77.031 };
    let restName = body.restaurantName;

    try {
      const restRef = doc(db, "restaurants", body.restaurantId);
      const restSnap = await getDoc(restRef);
      if (restSnap.exists()) {
        const restData = restSnap.data();
        address = restData.address || address;
        location = restData.location || location;
        restName = restData.name || restName;

        // Actualizar packs disponibles en el restaurante
        await updateDoc(restRef, {
          packsAvailable: increment(packsAvailable),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn("Restaurante lookup warning:", e);
    }

    // 2. Guardar nuevo pack en Firestore
    const newPack = {
      id: packId,
      restaurantId: body.restaurantId,
      restaurantName: restName,
      packName: body.packName.trim(),
      originalPrice,
      rescuePrice,
      packsAvailable,
      pickupTime: body.pickupTime || "Hoy, 20:30 - 22:00",
      imageUrl: body.imageUrl || "/restaurants/LALUCHA.jpg",
      category: body.category || "Comida Preparada",
      description: body.description || "Pack sorpresa con alimentos frescos del día preparados por el local.",
      address,
      location,
      status: "available",
      createdAt: serverTimestamp(),
    };

    const packRef = doc(db, "packs", packId);
    await setDoc(packRef, newPack);

    return NextResponse.json({
      success: true,
      message: `¡Pack "${body.packName}" publicado exitosamente con ${packsAvailable} unidades disponibles!`,
      pack: {
        ...newPack,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error en /api/packs/create:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al publicar pack en el servidor" },
      { status: 500 }
    );
  }
}
