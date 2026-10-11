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
