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
