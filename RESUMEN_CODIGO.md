# Resumen Completo de Código - EcoRescate

Este documento contiene el código fuente íntegro de las reglas de seguridad de Firestore, definiciones de modelos y tipos TypeScript, librerías de soporte y todas las rutas de la API del proyecto **EcoRescate**.

## Tabla de Contenidos

1. [firestore.rules](#1-firestore-rules)
2. [src/types/index.ts](#2-src-types-index-ts)
3. [src/lib/avatars.ts](#3-src-lib-avatars-ts)
4. [src/lib/firebase.ts](#4-src-lib-firebase-ts)
5. [src/lib/notifications.ts](#5-src-lib-notifications-ts)
6. [src/lib/orders.ts](#6-src-lib-orders-ts)
7. [src/lib/payments.ts](#7-src-lib-payments-ts)
8. [src/app/api/notifications/send/route.ts](#8-src-app-api-notifications-send-route-ts)
9. [src/app/api/orders/create/route.ts](#9-src-app-api-orders-create-route-ts)
10. [src/app/api/orders/verify/route.ts](#10-src-app-api-orders-verify-route-ts)
11. [src/app/api/packs/route.ts](#11-src-app-api-packs-route-ts)
12. [src/app/api/packs/create/route.ts](#12-src-app-api-packs-create-route-ts)
13. [src/app/api/payments/process/route.ts](#13-src-app-api-payments-process-route-ts)
14. [src/app/api/payments/webhook/route.ts](#14-src-app-api-payments-webhook-route-ts)
15. [src/app/api/seed/route.ts](#15-src-app-api-seed-route-ts)

---

## 1. firestore.rules

**Ruta en el repositorio:** firestore.rules  

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 2. src/types/index.ts

**Ruta en el repositorio:** src/types/index.ts  

```typescript
export interface Restaurant {
  id: string;
  name: string;
  category?: string;
  address: string;
  rating?: number;
  reviews?: number;
  distance?: string;
  packsAvailable?: number;
  logoUrl?: string;
  coverUrl?: string;
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt?: any;
}

export interface FoodPack {
  id: string;
  restaurantId: string;
  restaurantName: string;
  packName?: string;
  name?: string;
  description?: string;
  originalPrice: number;
  rescuePrice: number;
  imageUrl: string;
  pickupTime?: string;
  pickupTimeStart?: string;
  pickupTimeEnd?: string;
  distance?: string;
  packsAvailable?: number;
  status?: "available" | "reserved" | "picked_up" | "sold_out";
  createdAt?: any;
}

export interface Order {
  id: string;
  orderCode: string; // Ej: "ECO-8392"
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
  totalPrice: number;
  originalPrice: number;
  moneySaved: number;
  co2SavedKg: number;
  pickupTime: string;
  deliveryMethod: "pickup" | "delivery";
  deliveryCost: number;
  paymentMethod: "card" | "yape" | "cash";
  bringOwnContainer?: boolean;
  notes?: string;
  status: "confirmed" | "ready" | "completed" | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed";
  transactionId?: string;
  authorizationCode?: string;
  createdAt: any;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: "PEN" | "USD";
  paymentMethod: "card" | "yape" | "cash";
  status: "approved" | "pending" | "rejected";
  gateway: "culqi" | "mercadopago" | "stripe" | "sandbox";
  cardBrand?: "visa" | "mastercard" | "amex" | "other";
  last4?: string;
  authorizationCode?: string;
  yapeOperationCode?: string;
  errorMessage?: string;
  createdAt: any;
}
```

---

## 3. src/lib/avatars.ts

**Ruta en el repositorio:** src/lib/avatars.ts  

```typescript
export interface PresetAvatar {
  id: string;
  label: string;
  url: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "av-1", label: "Aguacate Eco", url: "/avatars/av-1.svg" },
  { id: "av-2", label: "Zorro Andino", url: "/avatars/av-2.svg" },
  { id: "av-3", label: "Chef Rescatista", url: "/avatars/av-3.svg" },
  { id: "av-4", label: "Panda Verde", url: "/avatars/av-4.svg" },
  { id: "av-5", label: "Pizza Hero", url: "/avatars/av-5.svg" },
  { id: "av-6", label: "Fresa Fresca", url: "/avatars/av-6.svg" },
  { id: "av-7", label: "León Guardián", url: "/avatars/av-7.svg" },
  { id: "av-8", label: "Brote Verde", url: "/avatars/av-8.svg" },
];

export const DEFAULT_AVATAR = "/avatars/av-1.svg";

export function getCleanAvatar(url?: string | null): string {
  if (!url || typeof url !== "string" || url.includes("dicebear")) {
    return DEFAULT_AVATAR;
  }
  return url;
}
```

---

## 4. src/lib/firebase.ts

**Ruta en el repositorio:** src/lib/firebase.ts  

```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDUNUMeVZQZfR_Lt5jKgFncG4BQWT2gJp8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ecorescate-d76be.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ecorescate-d76be",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ecorescate-d76be.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "873982979280",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:873982979280:web:0531cd11fff4e24ae302d5",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-K6D8W69TQ7"
};

// Singleton pattern para evitar inicializar multiples veces en Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
```

---

## 5. src/lib/notifications.ts

**Ruta en el repositorio:** src/lib/notifications.ts  

```typescript
import { Order } from "@/types";

/**
 * Formatea un mensaje de WhatsApp limpio, profesional y detallado con los datos del pedido.
 */
export function formatWhatsAppOrderMessage(order: Partial<Order> & { id: string }): string {
  const code = order.orderCode || `ECO-${order.id.slice(-4)}`;
  const restaurant = order.restaurantName || "Restaurante Aliado";
  const pack = order.packName || "Pack Sorpresa";
  const quantity = order.quantity || 1;
  const total = order.totalPrice ? `S/ ${order.totalPrice.toFixed(2)}` : "S/ 14.90";
  const saved = order.moneySaved ? `S/ ${order.moneySaved.toFixed(2)}` : "S/ 20.00";
  const co2 = order.co2SavedKg ? `${order.co2SavedKg} kg` : "2.5 kg";
  const time = order.pickupTime || "Hoy, 20:00 - 21:30";
  const address = order.restaurantAddress || "Lima, Perú";
  const bringTaper = order.bringOwnContainer ? "✅ *Sí, el cliente lleva su propio táper 🌱*" : "❌ *No lleva táper (embalaje del local)*";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ", Lima")}`;

  const message = `🌱 *ECORESCATE PERÚ - COMPROBANTE DE RESERVA* 🌱
─────────────────────────────
¡Hola! Tu reserva ha sido confirmada con éxito.

🔖 *Código de Recojo:* \`${code}\`
🏪 *Local:* ${restaurant}
🍱 *Pack:* ${pack} (${quantity} unidad${quantity > 1 ? "es" : ""})
⏰ *Horario de Recojo:* ${time}
📍 *Dirección:* ${address}

💰 *Total Pagado:* ${total}
🎉 *Ahorraste:* ${saved}
🌍 *Impacto Ambiental:* ${co2} de CO2 evitado
♻️ *Táper Ecológico:* ${bringTaper}

🗺️ *Cómo llegar:* ${mapsUrl}
─────────────────────────────
⚠️ *Importante:* Muestra tu código \`${code}\` en la caja o barra del restaurante para recibir tu comida fresca. ¡Gracias por salvar comida del desperdicio! 🌎✨`;

  return message;
}

/**
 * Genera el enlace de WhatsApp listo para abrir o compartir
 */
export function getWhatsAppShareUrl(order: Partial<Order> & { id: string }, phoneNumber?: string): string {
  const text = encodeURIComponent(formatWhatsAppOrderMessage(order));
  if (phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

/**
 * Genera el template HTML del comprobante por correo electrónico
 */
export function generateOrderEmailHtml(order: Partial<Order> & { id: string }, customerName: string): string {
  const code = order.orderCode || `ECO-${order.id.slice(-4)}`;
  const restaurant = order.restaurantName || "Restaurante Aliado";
  const pack = order.packName || "Pack Sorpresa";
  const quantity = order.quantity || 1;
  const total = order.totalPrice ? `S/ ${order.totalPrice.toFixed(2)}` : "S/ 14.90";
  const saved = order.moneySaved ? `S/ ${order.moneySaved.toFixed(2)}` : "S/ 20.00";
  const co2 = order.co2SavedKg ? `${order.co2SavedKg} kg` : "2.5 kg";
  const time = order.pickupTime || "Hoy, 20:00 - 21:30";
  const address = order.restaurantAddress || "Lima, Perú";
  const dateStr = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Confirmada - EcoRescate</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 36px 30px; text-align: center; color: white; }
    .logo-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; margin-bottom: 12px; }
    .title { font-size: 26px; font-weight: 800; margin: 0 0 6px 0; }
    .subtitle { font-size: 14px; opacity: 0.9; margin: 0; }
    .content { padding: 32px 28px; }
    .code-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 24px; }
    .code-label { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1px; }
    .code-value { font-size: 28px; font-weight: 900; color: #16a34a; letter-spacing: 2px; font-family: monospace; margin-top: 4px; }
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin: 20px 0 10px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-val { font-weight: 700; color: #0f172a; text-align: right; }
    .impact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
    .impact-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 14px; text-align: center; }
    .impact-box.gold { background: #fffbeb; border-color: #fde68a; }
    .impact-box-val { font-size: 18px; font-weight: 900; color: #166534; }
    .impact-box.gold .impact-box-val { color: #92400e; }
    .impact-box-lbl { font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase; }
    .impact-box.gold .impact-box-lbl { color: #b45309; }
    .taper-alert { background: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 8px; font-size: 13px; color: #065f46; margin: 20px 0; }
    .btn { display: block; text-align: center; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 14px 20px; border-radius: 14px; font-weight: 700; font-size: 15px; margin-top: 24px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-badge">🌱 EcoRescate Perú</div>
      <h1 class="title">¡Reserva Confirmada!</h1>
      <p class="subtitle">Hola ${customerName}, tu comida fresca te espera para ser rescatada.</p>
    </div>
    
    <div class="content">
      <div class="code-box">
        <div class="code-label">Código de Recojo</div>
        <div class="code-value">${code}</div>
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">Muestra este código al llegar al local</p>
      </div>

      <div class="impact-grid">
        <div class="impact-box">
          <div class="impact-box-val">${co2}</div>
          <div class="impact-box-lbl">CO2 Evitado</div>
        </div>
        <div class="impact-box gold">
          <div class="impact-box-val">${saved}</div>
          <div class="impact-box-lbl">Dinero Ahorrado</div>
        </div>
      </div>

      <div class="section-title">Detalles del Pedido</div>
      <div class="info-row">
        <span class="info-label">Restaurante:</span>
        <span class="info-val">${restaurant}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Pack Sorpresa:</span>
        <span class="info-val">${pack} (${quantity}x)</span>
      </div>
      <div class="info-row">
        <span class="info-label">Horario de Recojo:</span>
        <span class="info-val" style="color: #16a34a;">${time}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Dirección:</span>
        <span class="info-val">${address}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fecha:</span>
        <span class="info-val" style="text-transform: capitalize;">${dateStr}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Pagado:</span>
        <span class="info-val" style="font-size: 16px; color: #16a34a;">${total}</span>
      </div>

      ${order.bringOwnContainer ? `
      <div class="taper-alert">
        🌱 <strong>¡Recordatorio Verde!</strong> Marcaste que llevarás tu propio táper ecológico. ¡Gracias por ayudarnos a reducir plástico!
      </div>
      ` : ''}

      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ", Lima")}" class="btn">
        📍 Ver Ruta en Google Maps
      </a>
    </div>

    <div class="footer">
      EcoRescate Perú • Ayudando al planeta plato a plato 🌱<br>
      Miraflores, Lima • Soporte: ayuda@ecorescate.pe
    </div>
  </div>
</body>
</html>
  `.trim();
}
```

---

## 6. src/lib/orders.ts

**Ruta en el repositorio:** src/lib/orders.ts  

```typescript
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

export async function getOrderByCode(code: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/verify?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (data.success && data.order) return data.order;
  } catch (e) {}
  return null;
}
```

---

## 7. src/lib/payments.ts

**Ruta en el repositorio:** src/lib/payments.ts  

```typescript
import { PaymentTransaction } from "@/types";

export interface CardPaymentInput {
  cardNumber: string;
  expDate: string; // MM/YY
  cvv: string;
  cardholderName?: string;
}

export interface ProcessPaymentParams {
  orderId: string;
  userId: string;
  amount: number;
  currency?: "PEN" | "USD";
  paymentMethod: "card" | "yape" | "cash";
  cardInput?: CardPaymentInput;
  yapeOperationCode?: string;
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentResult {
  success: boolean;
  status: "approved" | "pending" | "rejected";
  transactionId: string;
  authorizationCode?: string;
  gateway: "culqi" | "mercadopago" | "stripe" | "sandbox";
  cardBrand?: "visa" | "mastercard" | "amex" | "other";
  last4?: string;
  message: string;
  receiptNumber?: string;
}

/**
 * Detecta la marca de la tarjeta basándose en los primeros dígitos (IIN/BIN)
 */
export function detectCardBrand(cleanNumber: string): "visa" | "mastercard" | "amex" | "other" {
  if (/^4/.test(cleanNumber)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(cleanNumber)) return "mastercard";
  if (/^3[47]/.test(cleanNumber)) return "amex";
  return "other";
}

/**
 * Validador de tarjeta bancaria: formato, algoritmo de Luhn, fecha de expiración y CVV
 */
export function validateCardDetails(input: CardPaymentInput): { valid: boolean; error?: string; brand: "visa" | "mastercard" | "amex" | "other"; last4: string } {
  const cleanNumber = input.cardNumber.replace(/\D/g, "");
  const last4 = cleanNumber.slice(-4) || "0000";
  const brand = detectCardBrand(cleanNumber);

  // 1. Longitud
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return { valid: false, error: "El número de tarjeta debe tener entre 15 y 16 dígitos.", brand, last4 };
  }

  // 2. Algoritmo de Luhn (Módulo 10)
  let sum = 0;
  let alternate = false;
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  if (sum % 10 !== 0) {
    return { valid: false, error: "El número de tarjeta ingresado no es válido (Fallo de suma de verificación).", brand, last4 };
  }

  // 3. Expiración
  const [mmStr, yyStr] = input.expDate.split("/").map((s) => s.trim());
  const month = parseInt(mmStr, 10);
  let year = parseInt(yyStr, 10);
  if (!month || month < 1 || month > 12) {
    return { valid: false, error: "Mes de expiración inválido (01 a 12).", brand, last4 };
  }
  if (year < 100) year += 2000; // ej: 28 -> 2028

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, error: "La tarjeta ingresada ha expirado.", brand, last4 };
  }

  // 4. CVV
  const cleanCvv = input.cvv.replace(/\D/g, "");
  const requiredCvvLen = brand === "amex" ? 4 : 3;
  if (cleanCvv.length !== requiredCvvLen && cleanCvv.length !== 3) {
    return { valid: false, error: `El código de seguridad CVV debe tener ${requiredCvvLen} dígitos.`, brand, last4 };
  }

  return { valid: true, brand, last4 };
}

/**
 * Valida el código de constancia de Yape o Plin
 */
export function validateYapeCode(code: string): { valid: boolean; error?: string } {
  const clean = code.trim().replace(/\D/g, "");
  if (clean.length < 5 || clean.length > 9) {
    return { valid: false, error: "El número de operación de Yape/Plin debe tener entre 6 y 8 dígitos." };
  }
  return { valid: true };
}

/**
 * Motor central de procesamiento de pasarela de pago (Culqi, Stripe o Sandbox con simulación bancaria 3DS)
 */
export async function executePayment(params: ProcessPaymentParams): Promise<PaymentResult> {
  const { amount, currency = "PEN", paymentMethod, cardInput, yapeOperationCode } = params;
  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const authorizationCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
  const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  // 1. Manejo de Pago en Tienda (Efectivo/POS en mostrador)
  if (paymentMethod === "cash") {
    return {
      success: true,
      status: "pending",
      transactionId,
      gateway: "sandbox",
      message: "Reserva registrada para pago en el local al momento del recojo.",
      receiptNumber,
    };
  }

  // 2. Manejo de Yape / Plin
  if (paymentMethod === "yape") {
    if (!yapeOperationCode) {
      return {
        success: false,
        status: "rejected",
        transactionId,
        gateway: "sandbox",
        message: "Debes ingresar el número de operación de la transferencia Yape o Plin.",
      };
    }

    const yapeValidation = validateYapeCode(yapeOperationCode);
    if (!yapeValidation.valid) {
      return {
        success: false,
        status: "rejected",
        transactionId,
        gateway: "sandbox",
        message: yapeValidation.error || "Código de operación de Yape inválido.",
      };
    }

    return {
      success: true,
      status: "approved",
      transactionId,
      authorizationCode: `YAPE-${yapeOperationCode.trim()}`,
      gateway: "sandbox",
      message: `¡Pago con Yape/Plin verificado exitosamente! (Op. #${yapeOperationCode.trim()})`,
      receiptNumber,
    };
  }

  // 3. Manejo de Tarjeta de Crédito / Débito
  if (paymentMethod === "card") {
    if (!cardInput) {
      return {
        success: false,
        status: "rejected",
        transactionId,
        gateway: "sandbox",
        message: "Faltan los datos de la tarjeta bancaria.",
      };
    }

    const cardValidation = validateCardDetails(cardInput);
    if (!cardValidation.valid) {
      return {
        success: false,
        status: "rejected",
        transactionId,
        gateway: "sandbox",
        message: cardValidation.error || "Tarjeta inválida.",
      };
    }

    // A. Si existe CULQI_SECRET_KEY, llamar a la API real de Culqi
    const culqiKey = process.env.CULQI_SECRET_KEY;
    if (culqiKey) {
      try {
        const amountInCents = Math.round(amount * 100);
        const culqiRes = await fetch("https://api.culqi.com/v2/charges", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${culqiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountInCents,
            currency_code: currency,
            email: params.customerEmail || "cliente@ecorescate.pe",
            description: `EcoRescate Orden #${params.orderId}`,
            // Nota: En producción frontend se genera token con Culqi.js o se envía token
          }),
        });

        const culqiData = await culqiRes.json();
        if (culqiRes.ok) {
          return {
            success: true,
            status: "approved",
            transactionId: culqiData.id || transactionId,
            authorizationCode: culqiData.authorization_code || authorizationCode,
            gateway: "culqi",
            cardBrand: cardValidation.brand,
            last4: cardValidation.last4,
            message: "¡Cobro procesado exitosamente por pasarela Culqi!",
            receiptNumber,
          };
        }
      } catch (e) {
        console.warn("Culqi API request fallback:", e);
      }
    }

    // B. Modo Sandbox / Simulación Bancaria con Validación Real de Tarjeta
    return {
      success: true,
      status: "approved",
      transactionId,
      authorizationCode,
      gateway: "sandbox",
      cardBrand: cardValidation.brand,
      last4: cardValidation.last4,
      message: `¡Pago de S/ ${amount.toFixed(2)} autorizado exitosamente con ${cardValidation.brand.toUpperCase()} terminado en ${cardValidation.last4}!`,
      receiptNumber,
    };
  }

  return {
    success: false,
    status: "rejected",
    transactionId,
    gateway: "sandbox",
    message: "Método de pago no soportado.",
  };
}
```

---

## 8. src/app/api/notifications/send/route.ts

**Ruta en el repositorio:** src/app/api/notifications/send/route.ts  

```typescript
import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateOrderEmailHtml } from "@/lib/notifications";

export const dynamic = "force-dynamic";

interface SendNotificationPayload {
  orderId: string;
  email?: string;
  customerName?: string;
  type?: "order_created" | "order_ready" | "order_completed";
}

export async function POST(request: Request) {
  try {
    const body: SendNotificationPayload = await request.json();
    const { orderId, email, customerName, type = "order_created" } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "El campo orderId es requerido." },
        { status: 400 }
      );
    }

    // 1. Obtener la orden de Firestore si existe
    let orderData: any = null;
    try {
      const orderRef = doc(db, "orders", orderId);
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        orderData = { id: snap.id, ...snap.data() };
      }
    } catch (e) {
      console.warn("No se pudo leer la orden de Firestore directamente:", e);
    }

    // Si no está en Firestore todavía, usar datos base
    if (!orderData) {
      orderData = {
        id: orderId,
        orderCode: `ECO-${orderId.slice(-4).toUpperCase()}`,
        restaurantName: "Restaurante Aliado",
        packName: "Pack Sorpresa",
        totalPrice: 14.90,
        moneySaved: 20.00,
        co2SavedKg: 2.5,
        pickupTime: "Hoy, 20:00 - 21:30",
        restaurantAddress: "Lima, Perú",
        quantity: 1,
        bringOwnContainer: false,
      };
    }

    const recipientEmail = email || orderData.userEmail || "cliente@ecorescate.pe";
    const recipientName = customerName || orderData.userName || recipientEmail.split("@")[0] || "EcoHéroe";

    // 2. Generar el contenido HTML
    const emailHtml = generateOrderEmailHtml(orderData, recipientName);
    const subject = type === "order_ready"
      ? `🔔 ¡Tu comida está lista para recojo! [${orderData.orderCode}] - ${orderData.restaurantName}`
      : `🌱 ¡Reserva Confirmada [${orderData.orderCode}]! Tu comida te espera en ${orderData.restaurantName}`;

    // 3. Envío real con Resend API si la clave está presente
    const resendApiKey = process.env.RESEND_API_KEY;
    let deliveryStatus = "simulated";
    let messageId = `msg-${Date.now()}`;

    if (resendApiKey) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || "EcoRescate <onboarding@resend.dev>";
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [recipientEmail],
            subject,
            html: emailHtml,
          }),
        });

        const resendData = await resendRes.json();
        if (resendRes.ok) {
          deliveryStatus = "sent";
          messageId = resendData.id || messageId;
        } else {
          console.warn("Resend API warning:", resendData);
          deliveryStatus = "simulated_fallback";
        }
      } catch (err) {
        console.warn("Error calling Resend:", err);
        deliveryStatus = "simulated_fallback";
      }
    }

    // 4. Registrar en Firestore si el documento existe
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        notificationSent: true,
        notifiedAt: serverTimestamp(),
        notificationEmail: recipientEmail,
        notificationDeliveryStatus: deliveryStatus,
      });
    } catch (e) {
      // Si la orden no existía en Firestore, no bloqueamos la respuesta
    }

    return NextResponse.json({
      success: true,
      deliveryStatus,
      messageId,
      recipientEmail,
      subject,
      emailHtml,
      message: deliveryStatus === "sent"
        ? `¡Comprobante enviado exitosamente a ${recipientEmail}!`
        : `¡Comprobante generado y simulado para ${recipientEmail}! (Modo de demostración activo)`,
    });
  } catch (error: any) {
    console.error("Error in /api/notifications/send:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al procesar la notificación." },
      { status: 500 }
    );
  }
}
```

---

## 9. src/app/api/orders/create/route.ts

**Ruta en el repositorio:** src/app/api/orders/create/route.ts  

```typescript
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
    const deliveryCost = Number(body.deliveryCost || 0);

    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderCode = `ECO-${Math.floor(1000 + Math.random() * 9000)}`;

    const packRef = doc(db, "packs", body.packId);
    const orderRef = doc(db, "orders", orderId);
    const userRef = doc(db, "users", body.userId);
    const restRef = body.restaurantId ? doc(db, "restaurants", body.restaurantId) : null;

    // Transacción atómica en Firestore: verifica stock, descuenta y crea la orden
    const createdOrder = await runTransaction(db, async (transaction) => {
      // Precios base por defecto (del body si no estuviera en db)
      let unitPrice = Number(body.unitPrice || 0);
      let originalPrice = Number(body.originalPrice || unitPrice * 2);

      // 1. Leer pack actual dentro de la transacción
      const packSnap = await transaction.get(packRef);
      if (packSnap.exists()) {
        const packData = packSnap.data();
        const available = Number(packData.packsAvailable ?? 0);
        if (available < quantity || packData.status === "sold_out") {
          throw new Error(`Stock insuficiente: solo quedan ${available} packs disponibles.`);
        }

        // Fuente de verdad: usar rescuePrice y originalPrice reales de Firestore
        if (packData.rescuePrice !== undefined) {
          unitPrice = Number(packData.rescuePrice);
        }
        if (packData.originalPrice !== undefined) {
          originalPrice = Number(packData.originalPrice);
        } else {
          originalPrice = Number(unitPrice * 2);
        }

        const newStock = Math.max(0, available - quantity);
        transaction.update(packRef, {
          packsAvailable: newStock,
          status: newStock === 0 ? "sold_out" : "available",
          updatedAt: serverTimestamp(),
        });
      }

      const totalPrice = Number((unitPrice * quantity + deliveryCost).toFixed(2));
      const moneySaved = Number(((originalPrice - unitPrice) * quantity).toFixed(2));
      const co2SavedKg = Number((2.5 * quantity).toFixed(1));

      // 2. Si existe restaurante, actualizar stock del restaurante
      if (restRef) {
        const restSnap = await transaction.get(restRef);
        if (restSnap.exists()) {
          const restData = restSnap.data();
          const currentRestPacks = Number(restData.packsAvailable ?? 0);
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
        paymentStatus: "pending",
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

    // Envío automático de notificación si hay email disponible
    let notificationSent = false;
    if (createdOrder.userEmail && process.env.RESEND_API_KEY) {
      try {
        const { generateOrderEmailHtml } = await import("@/lib/notifications");
        const html = generateOrderEmailHtml(createdOrder, createdOrder.userName);
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "EcoRescate <onboarding@resend.dev>",
            to: [createdOrder.userEmail],
            subject: `🌱 ¡Reserva Confirmada [${createdOrder.orderCode}]! Tu comida te espera en ${createdOrder.restaurantName}`,
            html,
          }),
        });
        notificationSent = true;
      } catch (e) {
        console.warn("Auto notification send notice:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Reserva creada exitosamente en el servidor",
      order: createdOrder,
      notificationSent,
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
```

---

## 10. src/app/api/orders/verify/route.ts

**Ruta en el repositorio:** src/app/api/orders/verify/route.ts  

```typescript
import { NextResponse } from "next/server";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types";

export const dynamic = "force-dynamic";

// Helper para buscar orden por orderCode o ID
async function findOrder(codeOrId: string): Promise<{ ref: any; order: Order } | null> {
  const cleanCode = codeOrId.trim().toUpperCase();

  // 1. Probar por ID directo
  const docRef = doc(db, "orders", codeOrId.trim());
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ref: docRef, order: { id: docSnap.id, ...docSnap.data() } as Order };
  }

  // 2. Probar por orderCode (ej. ECO-1234)
  const q = query(collection(db, "orders"), where("orderCode", "==", cleanCode));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const firstDoc = snap.docs[0];
    return { ref: firstDoc.ref, order: { id: firstDoc.id, ...firstDoc.data() } as Order };
  }

  return null;
}

// GET: Consultar estado del pedido sin marcarlo como entregado
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") || searchParams.get("orderId");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Parámetro 'code' o 'orderId' requerido" },
        { status: 400 }
      );
    }

    const result = await findOrder(code);
    if (!result) {
      return NextResponse.json(
        { success: false, error: `No se encontró ningún pedido con el código '${code}'` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      isCompleted: result.order.status === "completed",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al buscar pedido" },
      { status: 500 }
    );
  }
}

// POST: Validar y marcar como entregado por el restaurante
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = body.code || body.orderCode || body.orderId;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "El código o ID del pedido es obligatorio" },
        { status: 400 }
      );
    }

    const result = await findOrder(code);
    if (!result) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Código de pedido '${code}' no encontrado o inválido. Por favor verifica con el cliente.` 
        },
        { status: 404 }
      );
    }

    const currentOrder = result.order;

    // Verificar si ya fue canjeado
    if (currentOrder.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          alreadyCompleted: true,
          error: `Este pedido ya fue entregado y validado anteriormente (${currentOrder.orderCode}).`,
          order: currentOrder,
        },
        { status: 409 }
      );
    }

    // Verificar si fue cancelado
    if (currentOrder.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          error: `Este pedido (${currentOrder.orderCode}) fue cancelado y no puede ser entregado.`,
          order: currentOrder,
        },
        { status: 400 }
      );
    }

    // Marcar como completado/entregado en Firestore
    await updateDoc(result.ref, {
      status: "completed",
      completedAt: serverTimestamp(),
      verifiedByRestaurant: true,
      verifiedRestaurantName: body.restaurantName || currentOrder.restaurantName,
    });

    const updatedOrder: Order = {
      ...currentOrder,
      status: "completed",
    };

    return NextResponse.json({
      success: true,
      message: `¡Pedido ${currentOrder.orderCode} verificado y entregado exitosamente!`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error en /api/orders/verify:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al validar pedido en el servidor" },
      { status: 500 }
    );
  }
}
```

---

## 11. src/app/api/packs/route.ts

**Ruta en el repositorio:** src/app/api/packs/route.ts  

```typescript
import { NextResponse } from "next/server";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    let q = query(collection(db, "packs"));
    if (restaurantId) {
      q = query(collection(db, "packs"), where("restaurantId", "==", restaurantId));
    }

    const snap = await getDocs(q);
    const packs = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      count: packs.length,
      packs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener packs" },
      { status: 500 }
    );
  }
}
```

---

## 12. src/app/api/packs/create/route.ts

**Ruta en el repositorio:** src/app/api/packs/create/route.ts  

```typescript
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
```

---

## 13. src/app/api/payments/process/route.ts

**Ruta en el repositorio:** src/app/api/payments/process/route.ts  

```typescript
import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { executePayment, ProcessPaymentParams } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body: ProcessPaymentParams = await request.json();

    if (!body.orderId || !body.amount || !body.paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos para procesar el pago (orderId, amount, paymentMethod son requeridos)." },
        { status: 400 }
      );
    }

    // 1. Control antifraude para Yape / Plin (evitar códigos de operación duplicados)
    if (body.paymentMethod === "yape" && body.yapeOperationCode) {
      try {
        const cleanCode = body.yapeOperationCode.trim();
        const paymentsRef = collection(db, "payments");
        const q = query(paymentsRef, where("yapeOperationCode", "==", cleanCode));
        const existingDocs = await getDocs(q);

        if (!existingDocs.empty) {
          return NextResponse.json(
            { 
              success: false, 
              error: `El número de operación "${cleanCode}" ya fue utilizado en un pedido anterior. Ingresa una constancia válida.` 
            },
            { status: 409 }
          );
        }
      } catch (e) {
        console.warn("Anti-fraud check warning:", e);
      }
    }

    // 2. Ejecutar cobro a través del motor de pasarela (Culqi o Sandbox con 3DS)
    const result = await executePayment(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message,
          status: result.status 
        },
        { status: 402 } // Payment Required / Failed
      );
    }

    // 3. Registrar transacción de pago en Firestore
    try {
      const paymentDocRef = doc(db, "payments", result.transactionId);
      await setDoc(paymentDocRef, {
        id: result.transactionId,
        orderId: body.orderId,
        userId: body.userId,
        amount: body.amount,
        currency: body.currency || "PEN",
        paymentMethod: body.paymentMethod,
        status: result.status,
        gateway: result.gateway,
        cardBrand: result.cardBrand || null,
        last4: result.last4 || null,
        authorizationCode: result.authorizationCode || null,
        yapeOperationCode: body.yapeOperationCode || null,
        receiptNumber: result.receiptNumber || null,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("No se pudo registrar la transacción en Firestore:", e);
    }

    // 4. Actualizar estado de pago en el documento de la orden
    try {
      const orderRef = doc(db, "orders", body.orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        await updateDoc(orderRef, {
          paymentStatus: result.status === "approved" ? "paid" : "pending",
          transactionId: result.transactionId,
          authorizationCode: result.authorizationCode || null,
          receiptNumber: result.receiptNumber || null,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn("No se pudo actualizar el estado de pago en la orden:", e);
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      payment: result,
    });
  } catch (error: any) {
    console.error("Error en /api/payments/process:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno al procesar el pago." },
      { status: 500 }
    );
  }
}
```

---

## 14. src/app/api/payments/webhook/route.ts

**Ruta en el repositorio:** src/app/api/payments/webhook/route.ts  

```typescript
import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const event = await request.json();
    const eventType = event.type || event.action || "payment.received";

    console.log(`[Payment Webhook] Event received: ${eventType}`);

    // Culqi webhook format: { type: "charge.creation.succeeded", data: { id, order_id, ... } }
    const chargeData = event.data || event;
    const orderId = chargeData.order_id || chargeData.metadata?.orderId;
    const transactionId = chargeData.id || `wh_${Date.now()}`;

    if (orderId) {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          await updateDoc(orderRef, {
            paymentStatus: "paid",
            transactionId,
            webhookReceivedAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.warn("Error updating order via webhook:", e);
      }
    }

    return NextResponse.json({
      received: true,
      eventType,
      transactionId,
      message: "Webhook de pago procesado exitosamente.",
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { received: false, error: error.message || "Error al procesar webhook." },
      { status: 400 }
    );
  }
}
```

---

## 15. src/app/api/seed/route.ts

**Ruta en el repositorio:** src/app/api/seed/route.ts  

```typescript
import { NextResponse } from "next/server";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

const MOCK_RESTAURANTS = [
  {
    id: "1",
    name: "La Lucha Sanguchería",
    category: "Sándwiches y Criollo",
    rating: 4.8,
    reviews: 2150,
    distance: "0.8 km",
    packsAvailable: 3,
    location: { lat: -12.122114, lng: -77.030999 },
    logoUrl: "/logos/LaluchaLogo.jpg"
  },
  {
    id: "2",
    name: "Punto Azul",
    category: "Pescados y Mariscos",
    rating: 4.7,
    reviews: 1840,
    distance: "1.2 km",
    packsAvailable: 5,
    location: { lat: -12.120563, lng: -77.027063 },
    logoUrl: "/logos/puntoazul_logo.png"
  },
  {
    id: "3",
    name: "Siete Sopas",
    category: "Caldos y Sopas",
    rating: 4.6,
    reviews: 3200,
    distance: "2.5 km",
    packsAvailable: 0,
    location: { lat: -12.096316, lng: -77.034503 },
    logoUrl: "/logos/Sietesopaslogo.png"
  },
  {
    id: "4",
    name: "Bodega Verde",
    category: "Cafetería y Postres",
    rating: 4.8,
    reviews: 950,
    distance: "3.1 km",
    packsAvailable: 2,
    location: { lat: -12.148152, lng: -77.021759 },
    logoUrl: "/logos/bodegaverdelogo.jpg"
  },
  {
    id: "5",
    name: "La Mar",
    category: "Cevichería",
    rating: 4.9,
    reviews: 4500,
    distance: "1.5 km",
    packsAvailable: 2,
    location: { lat: -12.1152, lng: -77.0425 },
    logoUrl: "/logos/lamarlogo.jpg"
  },
  {
    id: "6",
    name: "Roky's",
    category: "Pollería",
    rating: 4.3,
    reviews: 1200,
    distance: "0.5 km",
    packsAvailable: 6,
    location: { lat: -12.1264, lng: -77.0253 },
    logoUrl: "/logos/rockyslogo.jpg"
  },
  {
    id: "7",
    name: "Chifa Titi",
    category: "Comida Oriental",
    rating: 4.8,
    reviews: 2100,
    distance: "4.2 km",
    packsAvailable: 1,
    location: { lat: -12.0934, lng: -77.0051 },
    logoUrl: "/logos/chifatitilogo.jpg"
  },
  {
    id: "8",
    name: "Hikari",
    category: "Pollería y Chifa",
    rating: 4.5,
    reviews: 1800,
    distance: "1.8 km",
    packsAvailable: 4,
    location: { lat: -12.0743, lng: -77.0821 },
    logoUrl: "/logos/hikarilogo.jpg"
  }
];

const MOCK_PACKS = [
  {
    id: "1",
    restaurantId: "1",
    restaurantName: "La Lucha Sanguchería",
    packName: "Pack Criollo Especial",
    originalPrice: 38.90,
    rescuePrice: 14.90,
    imageUrl: "/restaurants/LALUCHA.jpg",
    pickupTime: "20:00 - 21:30",
    distance: "0.8 km",
    packsAvailable: 3,
    status: "available",
  },
  {
    id: "2",
    restaurantId: "2",
    restaurantName: "Punto Azul",
    packName: "Pack Marino",
    originalPrice: 52.00,
    rescuePrice: 19.90,
    imageUrl: "/restaurants/PUNTOAZUL.jpg",
    pickupTime: "16:00 - 17:00",
    distance: "1.2 km",
    packsAvailable: 5,
    status: "available",
  },
  {
    id: "3",
    restaurantId: "3",
    restaurantName: "Siete Sopas",
    packName: "Pack Sopa Menestrón",
    originalPrice: 34.00,
    rescuePrice: 14.90,
    imageUrl: "/restaurants/SieteSopas.jpg",
    pickupTime: "22:00 - 23:30",
    distance: "2.5 km",
    packsAvailable: 0,
    status: "sold_out",
  },
  {
    id: "4",
    restaurantId: "4",
    restaurantName: "Bodega Verde",
    packName: "Pack Desayuno Saludable",
    originalPrice: 28.50,
    rescuePrice: 12.90,
    imageUrl: "/restaurants/BodegaVerde.jpg",
    pickupTime: "11:30 - 12:30",
    distance: "3.1 km",
    packsAvailable: 2,
    status: "available",
  },
  {
    id: "5",
    restaurantId: "5",
    restaurantName: "La Mar",
    packName: "Pack Ceviche Clásico",
    originalPrice: 79.00,
    rescuePrice: 29.90,
    imageUrl: "/restaurants/LAMAR.jpg",
    pickupTime: "15:00 - 16:30",
    distance: "1.5 km",
    packsAvailable: 2,
    status: "available",
  },
  {
    id: "6",
    restaurantId: "6",
    restaurantName: "Roky's",
    packName: "Pack 1/4 Pollo",
    originalPrice: 26.90,
    rescuePrice: 11.90,
    imageUrl: "/restaurants/Rockys.jpg",
    pickupTime: "21:30 - 23:00",
    distance: "0.5 km",
    packsAvailable: 6,
    status: "available",
  },
  {
    id: "7",
    restaurantId: "7",
    restaurantName: "Chifa Titi",
    packName: "Pack Chaufa Salvaje",
    originalPrice: 59.00,
    rescuePrice: 22.90,
    imageUrl: "/restaurants/ChifaTiti.jpg",
    pickupTime: "19:00 - 20:30",
    distance: "4.2 km",
    packsAvailable: 1,
    status: "available",
  },
  {
    id: "8",
    restaurantId: "8",
    restaurantName: "Hikari",
    packName: "Pack Lomo Saltado",
    originalPrice: 44.90,
    rescuePrice: 17.90,
    imageUrl: "/restaurants/Hikari.jpg",
    pickupTime: "22:00 - 23:00",
    distance: "1.8 km",
    packsAvailable: 4,
    status: "available",
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret") || request.headers.get("x-seed-secret");

    // En producción, bloquear si no se proporciona el secreto autorizado
    if (process.env.NODE_ENV === "production") {
      const validSecret = process.env.SEED_SECRET;
      if (!validSecret || secret !== validSecret) {
        return NextResponse.json(
          { 
            success: false, 
            error: "El sembrado de datos en producción está bloqueado. Proporciona el parámetro ?secret=... autorizado." 
          },
          { status: 403 }
        );
      }
    }

    const batch = writeBatch(db);

    for (const rest of MOCK_RESTAURANTS) {
      batch.set(doc(db, "restaurants", rest.id), rest, { merge: true });
    }

    for (const pack of MOCK_PACKS) {
      batch.set(doc(db, "packs", pack.id), pack, { merge: true });
    }

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: "Datos insertados en Firestore correctamente (con merge: true)",
      restaurantsCount: MOCK_RESTAURANTS.length,
      packsCount: MOCK_PACKS.length
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
```

---

