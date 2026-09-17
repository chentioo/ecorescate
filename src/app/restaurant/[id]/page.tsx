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
    coverUrl: "/restaurants/LALUCHA.jpg",
    packName: "Pack Criollo Especial",
    originalPrice: 45.0,
    rescuePrice: 20.0
  },
  "2": {
    name: "Punto Azul",
    category: "Pescados y Mariscos",
    rating: 4.7,
    reviews: 1840,
    address: "Calle San Martín 595, Miraflores",
    location: { lat: -12.120563, lng: -77.027063 },
    description: "Cevichería tradicional peruana con pesca del día garantizada. Ofrecemos exquisitos platos marinos. Nuestros packs de rescate incluyen guarniciones y platos elaborados durante el turno tarde que conservan su máxima calidad.",
    coverUrl: "/restaurants/PUNTOAZUL.jpg",
    packName: "Pack Marino",
    originalPrice: 55.0,
    rescuePrice: 25.0
  },
  "3": {
    name: "Siete Sopas",
    category: "Caldos y Sopas",
    rating: 4.6,
    reviews: 3200,
    address: "Av. Arequipa 2394, Lince",
    location: { lat: -12.086316, lng: -77.034503 },
    description: "Abierto 24 horas ofreciendo caldos reparadores y platos criollos contundentes. Rescatamos el exceso de producción de nuestras sopas diarias asegurando siempre el mismo sabor de casa y apoyando a una alimentación más sostenible.",
    coverUrl: "/restaurants/SieteSopas.jpg",
    packName: "Pack Sopa Menestrón",
    originalPrice: 38.0,
    rescuePrice: 15.0
  },
  "4": {
    name: "Bodega Verde",
    category: "Cafetería y Postres",
    rating: 4.8,
    reviews: 950,
    address: "Jirón Sucre 335A, Barranco",
    location: { lat: -12.148152, lng: -77.021759 },
    description: "Un oasis verde en el corazón de Barranco. Nos especializamos en comida saludable, postres artesanales y café orgánico. Nuestros packs sorpresa contienen deliciosos postres y sándwiches horneados el mismo día.",
    coverUrl: "/restaurants/BodegaVerde.jpg",
    packName: "Pack Desayuno Saludable",
    originalPrice: 30.0,
    rescuePrice: 14.0
  },
  "5": {
    name: "La Mar",
    category: "Cevichería",
    rating: 4.9,
    reviews: 4500,
    address: "Av. La Mar 770, Miraflores",
    location: { lat: -12.1152, lng: -77.0425 },
    description: "Reconocida cevichería limeña que celebra los sabores del mar peruano. Rescatamos insumos fresquísimos al cierre del turno almuerzo para que disfrutes de la más alta gastronomía cuidando el océano y tu bolsillo.",
    coverUrl: "/restaurants/LAMAR.jpg",
    packName: "Pack Ceviche Clásico",
    originalPrice: 75.0,
    rescuePrice: 28.0
  },
  "6": {
    name: "Roky's",
    category: "Pollería",
    rating: 4.3,
    reviews: 1200,
    address: "Av. Benavides 2405, Miraflores",
    location: { lat: -12.1264, lng: -77.0253 },
    description: "El tradicional sabor del pollo a la brasa peruano. Al final del día armamos packs con los deliciosos pollos asados y guarniciones que no se sirvieron, garantizando que puedas disfrutar este platillo bandera evitando el desperdicio.",
    coverUrl: "/restaurants/Rockys.jpg",
    packName: "Pack 1/4 Pollo",
    originalPrice: 28.0,
    rescuePrice: 12.0
  },
  "7": {
    name: "Chifa Titi",
    category: "Comida Oriental",
    rating: 4.8,
    reviews: 2100,
    address: "Av. Javier Prado Este 1212, San Borja",
    location: { lat: -12.0934, lng: -77.0051 },
    description: "Fusión peruano-china de la más alta calidad. Disfruta de la técnica al wok con nuestros packs de rescate que incluyen generosas porciones de arroces, tallarines y carnes preparadas ese mismo día.",
    coverUrl: "/restaurants/ChifaTiti.jpg",
    packName: "Pack Chaufa Salvaje",
    originalPrice: 42.0,
    rescuePrice: 18.0
  },
  "8": {
    name: "Hikari",
    category: "Pollería y Chifa",
    rating: 4.5,
    reviews: 1800,
    address: "Av. La Mar 2339, San Miguel",
    location: { lat: -12.0743, lng: -77.0821 },
    description: "Expertos en Lomo Saltado, fusionando los sabores criollos y orientales. Apoyamos la sostenibilidad empaquetando al final de nuestro servicio aquellos platos humeantes que merecen ser disfrutados.",
    coverUrl: "/restaurants/Hikari.jpg",
    packName: "Pack Lomo Saltado",
    originalPrice: 35.0,
    rescuePrice: 16.0
  }
};

const getRestaurantData = (id: string) => {
  const data = MOCK_DB[id] || MOCK_DB["1"];
  return {
    id,
    ...data,
    packs: [
      {
        id,
        restaurantName: data.name,
        packName: data.packName || "Pack Especial Sorpresa",
        originalPrice: data.originalPrice || 45.0,
        rescuePrice: data.rescuePrice || 20.0,
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
            {data.packs.map((pack: any) => (
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
