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
