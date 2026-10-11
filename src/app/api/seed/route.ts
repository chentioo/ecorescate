import { NextResponse } from "next/server";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  }
];

export async function GET() {
  try {
    const batch = writeBatch(db);

    for (const rest of MOCK_RESTAURANTS) {
      batch.set(doc(db, "restaurants", rest.id), rest);
    }

    for (const pack of MOCK_PACKS) {
      batch.set(doc(db, "packs", pack.id), pack);
    }

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: "Datos insertados en Firestore correctamente",
      restaurantsCount: MOCK_RESTAURANTS.length,
      packsCount: MOCK_PACKS.length
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
