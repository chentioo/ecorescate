import { MapPin, Clock, Star, ArrowLeft, Leaf } from "lucide-react";
import Link from "next/link";
import { FoodCard } from "@/components/ui/FoodCard";

const MOCK_DB: Record<string, any> = {
  "1": {
    name: "La Lucha Sanguchería",
    category: "Sándwiches y Criollo",
    rating: 4.8,
    reviews: 2150,
    address: "Av. Diagonal 308, Miraflores",
    location: { lat: -12.122114, lng: -77.030999 },
    description: "Uno de los restaurantes más icónicos de Lima, conocido por sus sándwiches tradicionales y jugos frescos. Famoso por su pan francés crujiente y lechón asado. Únete a nosotros al final del día para rescatar ingredientes frescos que no se utilizaron.",
    coverUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&auto=format&fit=crop&q=80"
  },
  "2": {
    name: "Punto Azul",
    category: "Pescados y Mariscos",
    rating: 4.7,
    reviews: 1840,
    address: "Calle San Martín 595, Miraflores",
    location: { lat: -12.120563, lng: -77.027063 },
    description: "Cevichería tradicional peruana con pesca del día garantizada. Ofrecemos exquisitos platos marinos. Nuestros packs de rescate incluyen guarniciones y platos elaborados durante el turno tarde que conservan su máxima calidad.",
    coverUrl: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=1200&auto=format&fit=crop&q=80"
  },
  "3": {
    name: "Siete Sopas",
    category: "Caldos y Sopas",
    rating: 4.6,
    reviews: 3200,
    address: "Av. Arequipa 2394, Lince",
    location: { lat: -12.086316, lng: -77.034503 },
    description: "Abierto 24 horas ofreciendo caldos reparadores y platos criollos contundentes. Rescatamos el exceso de producción de nuestras sopas diarias asegurando siempre el mismo sabor de casa y apoyando a una alimentación más sostenible.",
    coverUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&auto=format&fit=crop&q=80"
  },
  "4": {
    name: "Bodega Verde",
    category: "Cafetería y Postres",
    rating: 4.8,
    reviews: 950,
    address: "Jirón Sucre 335A, Barranco",
    location: { lat: -12.148152, lng: -77.021759 },
    description: "Un oasis verde en el corazón de Barranco. Nos especializamos en comida saludable, postres artesanales y café orgánico. Nuestros packs sorpresa contienen deliciosos postres y sándwiches horneados el mismo día.",
    coverUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80"
  }
};

const getRestaurantData = (id: string) => {
  const data = MOCK_DB[id] || MOCK_DB["1"];
  return {
    id,
    ...data,
    packs: [
      {
        id: `pack-${id}-1`,
        restaurantName: data.name,
        packName: "Pack Especial Sorpresa",
        originalPrice: 45.0,
        rescuePrice: 20.0,
        imageUrl: data.coverUrl,
        pickupTime: "20:00 - 21:30",
        distance: "0.8 km",
      }
    ]
  };
};

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getRestaurantData(id);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 w-full">
        <div className="absolute inset-0 bg-slate-900/40 z-10" />
        <img src={data.coverUrl} alt={data.name} className="w-full h-full object-cover" />
        
        <div className="absolute top-20 left-4 sm:left-8 z-20">
          <Link href="/explore" className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full inline-flex items-center justify-center text-white transition">
            <ArrowLeft className="size-5" />
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        {/* Info Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <Leaf className="size-3" /> Aliado EcoRescate
                </span>
                <span className="text-sm font-medium text-slate-500">{data.category}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{data.name}</h1>
            </div>
            
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-200">
              <Star className="size-5 fill-amber-500 text-amber-500" />
              <span className="font-bold text-lg">{data.rating}</span>
              <span className="text-sm opacity-70">({data.reviews})</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-slate-600 text-sm mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {data.address}
              </div>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${data.location.lat},${data.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-semibold text-xs flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
              >
                Cómo llegar
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              Horario de rescate variable
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Packs */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Packs disponibles hoy</h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {data.packs.map(pack => (
              <Link key={pack.id} href={`/checkout/${pack.id}`} className="block group">
                <FoodCard {...pack} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
