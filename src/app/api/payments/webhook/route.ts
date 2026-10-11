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
