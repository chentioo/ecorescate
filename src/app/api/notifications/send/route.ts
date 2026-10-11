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
