import { NextResponse } from "next/server";
import { 
  doc, 
  runTransaction, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types";

export const dynamic = "force-dynamic";

export interface ServerCreateOrderBody {
  userId: string;
  userName: string;
  userEmail: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantLocation?: { lat: number; lng: number };
  packId: string;
  packName: string;
  packImageUrl: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  pickupTime: string;
  deliveryMethod: "pickup" | "delivery";
  deliveryCost: number;
  paymentMethod: "card" | "yape" | "cash";
  bringOwnContainer?: boolean;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body: ServerCreateOrderBody = await request.json();

    if (!body.userId || !body.packId) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos: userId y packId son obligatorios." },
        { status: 400 }
      );
    }

    const quantity = Math.max(1, body.quantity || 1);
    const unitPrice = Number(body.unitPrice || 0);
    const originalPrice = Number(body.originalPrice || unitPrice * 2);
    const deliveryCost = Number(body.deliveryCost || 0);
    const totalPrice = Number((unitPrice * quantity + deliveryCost).toFixed(2));
    const moneySaved = Number(((originalPrice - unitPrice) * quantity).toFixed(2));
    const co2SavedKg = Number((2.5 * quantity).toFixed(1));

    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderCode = `ECO-${Math.floor(1000 + Math.random() * 9000)}`;

    const packRef = doc(db, "packs", body.packId);
    const orderRef = doc(db, "orders", orderId);
    const userRef = doc(db, "users", body.userId);
    const restRef = body.restaurantId ? doc(db, "restaurants", body.restaurantId) : null;

    // Transacción atómica en Firestore: verifica stock, descuenta y crea la orden
    const createdOrder = await runTransaction(db, async (transaction) => {
      // 1. Leer pack actual dentro de la transacción
      const packSnap = await transaction.get(packRef);
      if (packSnap.exists()) {
        const packData = packSnap.data();
        const available = packData.packsAvailable ?? 3;
        if (available < quantity) {
          throw new Error(`Stock insuficiente: solo quedan ${available} packs disponibles.`);
        }
        const newStock = Math.max(0, available - quantity);
        transaction.update(packRef, {
          packsAvailable: newStock,
          status: newStock === 0 ? "sold_out" : "available",
          updatedAt: serverTimestamp(),
        });
      }

      // 2. Si existe restaurante, actualizar stock del restaurante
      if (restRef) {
        const restSnap = await transaction.get(restRef);
        if (restSnap.exists()) {
          const restData = restSnap.data();
          const currentRestPacks = restData.packsAvailable ?? 3;
          transaction.update(restRef, {
            packsAvailable: Math.max(0, currentRestPacks - quantity),
          });
        }
      }

      // 3. Crear documento de la Orden
      const orderPayload: Order = {
        id: orderId,
        orderCode,
        userId: body.userId,
        userName: body.userName || "Usuario EcoRescate",
        userEmail: body.userEmail || "",
        restaurantId: body.restaurantId,
        restaurantName: body.restaurantName,
        restaurantAddress: body.restaurantAddress,
        restaurantLocation: body.restaurantLocation,
        packId: body.packId,
        packName: body.packName,
        packImageUrl: body.packImageUrl,
        quantity,
        unitPrice,
        totalPrice,
        originalPrice,
        moneySaved,
        co2SavedKg,
        pickupTime: body.pickupTime,
        deliveryMethod: body.deliveryMethod,
        deliveryCost,
        paymentMethod: body.paymentMethod,
        bringOwnContainer: body.bringOwnContainer ?? false,
        notes: body.notes || "",
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      transaction.set(orderRef, {
        ...orderPayload,
        createdAt: serverTimestamp(),
      });

      // 4. Actualizar impacto del usuario
      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const currentCount = Number(userData.rescuedCount || 0);
      const currentMoney = Number(userData.moneySaved || 0);
      const currentCo2 = Number(userData.co2SavedKg || 0);

      transaction.set(
        userRef,
        {
          uid: body.userId,
          rescuedCount: currentCount + quantity,
          moneySaved: Number((currentMoney + moneySaved).toFixed(2)),
          co2SavedKg: Number((currentCo2 + co2SavedKg).toFixed(1)),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return orderPayload;
    });

    return NextResponse.json({
      success: true,
      message: "Reserva creada exitosamente en el servidor",
      order: createdOrder,
    });
  } catch (error: any) {
    console.error("Error en /api/orders/create:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al procesar la reserva en el servidor",
      },
      { status: 400 }
    );
  }
}
