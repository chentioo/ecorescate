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
  createdAt: any;
}
