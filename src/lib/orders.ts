import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types";

export interface CreateOrderParams {
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

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderCode = `ECO-${Math.floor(1000 + Math.random() * 9000)}`;

  const quantity = Math.max(1, params.quantity || 1);
  const totalPrice = Number((params.unitPrice * quantity + params.deliveryCost).toFixed(2));
  const moneySaved = Number(((params.originalPrice - params.unitPrice) * quantity).toFixed(2));
  const co2SavedKg = Number((2.5 * quantity).toFixed(1));

  const newOrder: Order = {
    id: orderId,
    orderCode,
    userId: params.userId,
    userName: params.userName || "Usuario EcoRescate",
    userEmail: params.userEmail,
    restaurantId: params.restaurantId,
    restaurantName: params.restaurantName,
    restaurantAddress: params.restaurantAddress,
    restaurantLocation: params.restaurantLocation,
    packId: params.packId,
    packName: params.packName,
    packImageUrl: params.packImageUrl,
    quantity,
    unitPrice: params.unitPrice,
    totalPrice,
    originalPrice: params.originalPrice,
    moneySaved,
    co2SavedKg,
    pickupTime: params.pickupTime,
    deliveryMethod: params.deliveryMethod,
    deliveryCost: params.deliveryCost,
    paymentMethod: params.paymentMethod,
    bringOwnContainer: params.bringOwnContainer ?? false,
    notes: params.notes || "",
    status: "confirmed",
    paymentStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  // 1. Intentar creación atómica segura en el Backend
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (res.ok && data.success && data.order) {
        const serverOrder: Order = data.order;
        // Backup local para acceso instantáneo
        try {
          const existing = JSON.parse(localStorage.getItem(`eco_orders_${params.userId}`) || "[]");
          localStorage.setItem(`eco_orders_${params.userId}`, JSON.stringify([serverOrder, ...existing]));
          localStorage.setItem(`eco_last_order`, JSON.stringify(serverOrder));
        } catch (e) {}
        return serverOrder;
      } else if (!res.ok && data.error) {
        throw new Error(data.error);
      }
    } catch (apiError: any) {
      // Si el servidor arrojó un error de negocio (ej. stock insuficiente), lanzarlo al usuario
      if (apiError.message && apiError.message.includes("Stock insuficiente")) {
        throw apiError;
      }
      console.warn("Backend API warning, running client fallback:", apiError);
    }
  }

  // 2. Fallback de cliente si la API no está disponible o estamos offline
  try {
    // 1. Descontar stock en Firestore si existe pack y verificar disponibilidad
    const packRef = doc(db, "packs", params.packId);
    const packSnap = await getDoc(packRef);
    if (packSnap.exists()) {
      const packData = packSnap.data();
      const currentPacks = Number(packData.packsAvailable ?? 0);
      if (currentPacks < quantity || packData.status === "sold_out") {
        throw new Error(`Stock insuficiente: solo quedan ${currentPacks} packs disponibles.`);
      }
      const newStock = Math.max(0, currentPacks - quantity);
      await updateDoc(packRef, {
        packsAvailable: newStock,
        status: newStock === 0 ? "sold_out" : "available",
      });
    }

    // 2. Guardar orden en Firestore
    const orderRef = doc(db, "orders", orderId);
    await setDoc(orderRef, {
      ...newOrder,
      createdAt: serverTimestamp(),
    });

    // 3. Descontar en restaurante si existe
    try {
      const restRef = doc(db, "restaurants", params.restaurantId);
      const restSnap = await getDoc(restRef);
      if (restSnap.exists()) {
        const restData = restSnap.data();
        const currentRestPacks = Number(restData.packsAvailable ?? 0);
        await updateDoc(restRef, {
          packsAvailable: Math.max(0, currentRestPacks - quantity),
        });
      }
    } catch (e) {
      console.warn("Non-fatal stock update warning for restaurant:", e);
    }

    // 4. Actualizar impacto ecológico del usuario en Firestore de forma infalible
    try {
      const userRef = doc(db, "users", params.userId);
      const userSnap = await getDoc(userRef);
      const currentData = userSnap.exists() ? (userSnap.data() || {}) : {};

      const currentCount = Number(currentData.rescuedCount || 0);
      const currentMoney = Number(currentData.moneySaved || 0);
      const currentCo2 = Number(currentData.co2SavedKg || 0);

      const newCount = currentCount + quantity;
      const newMoney = Number((currentMoney + moneySaved).toFixed(2));
      const newCo2 = Number((currentCo2 + co2SavedKg).toFixed(1));

      await setDoc(userRef, {
        uid: params.userId,
        rescuedCount: newCount,
        moneySaved: newMoney,
        co2SavedKg: newCo2,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn("Non-fatal user impact increment warning:", e);
    }

  } catch (error: any) {
    if (error.message && error.message.includes("Stock insuficiente")) {
      throw error;
    }
    console.error("Error creating order in Firestore, using local fallback:", error);
  }

  // Backup local para acceso instantáneo
  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem(`eco_orders_${params.userId}`) || "[]");
      localStorage.setItem(`eco_orders_${params.userId}`, JSON.stringify([newOrder, ...existing]));
      localStorage.setItem(`eco_last_order`, JSON.stringify(newOrder));
    } catch (e) {
      // Ignorar quota errors
    }
  }

  return newOrder;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, "orders", orderId);
    const snap = await getDoc(orderRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Order;
    }
  } catch (e) {
    console.warn("Error fetching order from Firestore:", e);
  }

  // Fallback a localStorage
  if (typeof window !== "undefined") {
    try {
      const lastOrder = localStorage.getItem("eco_last_order");
      if (lastOrder) {
        const parsed = JSON.parse(lastOrder);
        if (parsed.id === orderId || parsed.orderCode === orderId) {
          return parsed;
        }
      }
    } catch (e) {}
  }

  return null;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const orders: Order[] = [];

  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    snap.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });

    // Ordenar descendente por fecha
    orders.sort((a, b) => {
      const dateA = new Date(a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt).getTime();
      const dateB = new Date(b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt).getTime();
      return dateB - dateA;
    });

    if (orders.length > 0) return orders;
  } catch (e) {
    console.warn("Error fetching user orders from Firestore:", e);
  }

  // Fallback a localStorage si Firestore falla
  if (typeof window !== "undefined") {
    try {
      const local = JSON.parse(localStorage.getItem(`eco_orders_${userId}`) || "[]");
      return local;
    } catch (e) {}
  }

  return orders;
}

export async function markOrderCompleted(orderId: string, userId: string): Promise<void> {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: "completed",
      completedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Error updating order status in Firestore:", e);
  }

  if (typeof window !== "undefined") {
    try {
      const orders = JSON.parse(localStorage.getItem(`eco_orders_${userId}`) || "[]");
      const updated = orders.map((o: Order) => o.id === orderId ? { ...o, status: "completed" } : o);
      localStorage.setItem(`eco_orders_${userId}`, JSON.stringify(updated));
    } catch (e) {}
  }
}

export async function verifyOrderByCode(code: string, restaurantName?: string): Promise<{ success: boolean; message?: string; error?: string; order?: Order; alreadyCompleted?: boolean }> {
  try {
    const res = await fetch("/api/orders/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, restaurantName }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || "Error al conectar con el servidor" };
  }
}

export async function cancelOrder(orderId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      return { success: false, error: "La orden no existe." };
    }
    const orderData = orderSnap.data() as Order;
    if (orderData.status === "cancelled") {
      return { success: false, error: "La orden ya ha sido cancelada." };
    }

    // 1. Marcar como cancelada
    await updateDoc(orderRef, {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
    });

    const quantity = orderData.quantity || 1;

    // 2. Devolver stock al pack
    if (orderData.packId) {
      try {
        const packRef = doc(db, "packs", orderData.packId);
        const packSnap = await getDoc(packRef);
        if (packSnap.exists()) {
          const packData = packSnap.data();
          const newStock = Number(packData.packsAvailable ?? 0) + quantity;
          await updateDoc(packRef, {
            packsAvailable: newStock,
            status: "available",
          });
        }
      } catch (e) {
        console.warn("Error restoring pack stock:", e);
      }
    }

    // 3. Devolver stock al restaurante
    if (orderData.restaurantId) {
      try {
        const restRef = doc(db, "restaurants", orderData.restaurantId);
        const restSnap = await getDoc(restRef);
        if (restSnap.exists()) {
          const restData = restSnap.data();
          const newRestStock = Number(restData.packsAvailable ?? 0) + quantity;
          await updateDoc(restRef, {
            packsAvailable: newRestStock,
          });
        }
      } catch (e) {
        console.warn("Error restoring restaurant stock:", e);
      }
    }

    // 4. Actualizar localStorage
    if (typeof window !== "undefined") {
      try {
        const orders = JSON.parse(localStorage.getItem(`eco_orders_${userId}`) || "[]");
        const updated = orders.map((o: Order) => o.id === orderId ? { ...o, status: "cancelled" } : o);
        localStorage.setItem(`eco_orders_${userId}`, JSON.stringify(updated));

        const lastOrder = localStorage.getItem("eco_last_order");
        if (lastOrder) {
          const parsed = JSON.parse(lastOrder);
          if (parsed.id === orderId) {
            localStorage.setItem("eco_last_order", JSON.stringify({ ...parsed, status: "cancelled" }));
          }
        }
      } catch (e) {}
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error cancelling order:", err);
    return { success: false, error: err.message || "Error al cancelar la orden." };
  }
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/verify?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (data.success && data.order) return data.order;
  } catch (e) {}
  return null;
}

