import Link from "next/link";
import { ArrowRight, Leaf, MapPin, Store, Star, TrendingDown, Clock, ShieldCheck, Scale, Cloud, Wallet, CheckCircle2 } from "lucide-react";
import { FoodCard } from "@/components/ui/FoodCard";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-28 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-mesh-leaf opacity-90"></div>
        <div className="absolute inset-0 -z-10 bg-grain"></div>
        <div className="absolute -top-24 -right-24 -z-10 size-[28rem] rounded-full bg-amber/30 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 -z-10 size-[32rem] rounded-full bg-leaf/30 blur-3xl"></div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            
            <div className="relative z-10">
              <span className="inline-flex items-center justify-center rounded-md border w-fit whitespace-nowrap mb-5 gap-1.5 bg-leaf-soft text-leaf-deep border-leaf/30 px-3 py-1.5 text-xs font-semibold">
                <Leaf className="size-3.5" /> Plataforma de rescate de comida · Perú 🇵🇪
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-[1.05]">
                Salva comida.{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-leaf-deep">Ahorra dinero.</span>
                  <span className="absolute left-0 bottom-1 h-3 w-full bg-amber/40 -z-0 rounded-full"></span>
                </span>{" "}
                Cuida el planeta.
              </h1>
              
              <p className="mt-5 text-lg text-muted-foreground max-w-xl text-balance">
                Rescata comidas de restaurantes peruanos con hasta <span className="font-semibold text-foreground">70% de descuento</span>. Come delicioso, paga menos y evita el desperdicio de alimentos.
              </p>
              
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link href="/explore" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all rounded-md px-7 h-12 text-base bg-leaf hover:bg-leaf-deep text-white shadow-xl shadow-leaf/25">
                  <MapPin className="size-5" /> Ofertas cercanas
                </Link>
                <Link href="#restaurantes" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all rounded-md px-7 h-12 text-base bg-background/60 backdrop-blur border border-border hover:bg-accent hover:text-accent-foreground shadow-xs">
                  <Store className="size-5" /> Ver restaurantes
                </Link>
              </div>
            </div>

            <div className="relative h-[420px] sm:h-[480px] lg:h-[540px] hidden md:block">
              <div className="absolute top-0 right-4 w-[58%] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
                <Image 
                  src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80" 
                  alt="Sopa deliciosa" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white">
                  <div className="text-xs opacity-80">Siete Sopas</div>
                  <div className="font-semibold">Pack Sopa Criolla</div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="line-through opacity-60">S/38.00</span>
                    <span className="font-bold text-amber">S/15.00</span>
                    <span className="ml-auto rounded-full bg-amber text-black text-[10px] font-bold px-2 py-0.5">-60%</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-[52%] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <Image 
                  src="https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80" 
                  alt="Sándwich" 
                  fill 
                  className="object-cover"
                />
              </div>
              
              <div className="absolute top-10 left-2 w-52 glass-card rounded-2xl p-3.5 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-xl bg-leaf text-white">
                    <Leaf className="size-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Impacto hoy</div>
                    <div className="font-bold text-leaf-deep">312 comidas rescatadas</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-0 w-48 glass-card rounded-2xl p-3.5 shadow-xl">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> Recolección
                </div>
                <div className="mt-1 font-semibold">13:00 - 14:30</div>
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <MapPin className="size-3.5 text-leaf" /> Miraflores · 0.8 km
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="relative py-8 bg-leaf-deep text-white overflow-hidden" id="impacto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-xl bg-white/10">
                <Leaf className="size-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-extrabold">184k+</div>
                <div className="text-xs text-white/80">Comidas rescatadas</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-xl bg-white/10">
                <Scale className="size-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-extrabold">46k kg</div>
                <div className="text-xs text-white/80">Desperdicio evitado</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-xl bg-white/10">
                <Cloud className="size-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-extrabold">115k kg</div>
                <div className="text-xs text-white/80">CO₂ no emitido</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-xl bg-white/10">
                <Wallet className="size-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-extrabold">S/ 920k</div>
                <div className="text-xs text-white/80">Ahorro de usuarios</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-background" id="como-funciona">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">¿Cómo funciona EcoRescate?</h2>
            <p className="text-lg text-muted-foreground">Proceso ágil, sin cargos inflados de delivery y con total transparencia. Garantizamos higiene y frescura de los locales.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <MapPin className="size-24" />
              </div>
              <div className="size-12 bg-leaf-soft text-leaf-deep rounded-2xl flex items-center justify-center font-bold text-xl mb-6">1</div>
              <h3 className="text-xl font-bold mb-3">Descubre & Explora</h3>
              <p className="text-muted-foreground">Usa tu ubicación para encontrar "Packs del Día" cerca a ti. Verás el precio original y el precio de rescate con hasta 70% de descuento.</p>
            </div>
            
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="size-24" />
              </div>
              <div className="size-12 bg-amber/20 text-amber-deep rounded-2xl flex items-center justify-center font-bold text-xl mb-6">2</div>
              <h3 className="text-xl font-bold mb-3">Reserva Seguro</h3>
              <p className="text-muted-foreground">Paga en la app y recibe un código QR. Todos los packs son excedentes del mismo día, frescos y perfectamente comestibles. Tu salud es prioridad.</p>
            </div>
            
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <Store className="size-24" />
              </div>
              <div className="size-12 bg-leaf text-white rounded-2xl flex items-center justify-center font-bold text-xl mb-6">3</div>
              <h3 className="text-xl font-bold mb-3">Recoge & Disfruta</h3>
              <p className="text-muted-foreground">Acércate al local en el horario indicado. Muestra tu QR, evita el recargo de envíos a domicilio y disfruta tu comida sabiendo que ayudaste al planeta.</p>
            </div>
          </div>
        </div>

      </section>
      {/* Ecosystem Support */}
      <section className="py-24 bg-leaf-soft relative overflow-hidden" id="impacto-ecosistema">
        <div className="absolute -top-32 -right-32 -z-10 size-[40rem] rounded-full bg-leaf/20 blur-3xl"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-leaf/20 text-leaf-deep px-4 py-1.5 rounded-full text-sm font-bold border border-leaf/30 mb-6">
                <Leaf className="size-4" /> Compromiso EcoRescate
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 text-slate-900">
                Tu rescate salva más que solo comida.
              </h2>
              <p className="text-lg text-slate-700 mb-6">
                En EcoRescate creemos que el impacto debe ser circular. Por eso, destinamos un porcentaje de las ganancias de cada pedido y suscripción Prime directamente a la <strong>reforestación y protección de la Amazonía Peruana</strong> y otros ecosistemas vulnerables.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-6 text-leaf shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Reforestación Activa</strong>
                    <span className="text-slate-600 text-sm">Plantamos árboles nativos en zonas deforestadas de Madre de Dios.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-6 text-leaf shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Apoyo a Comunidades Locales</strong>
                    <span className="text-slate-600 text-sm">Trabajamos de la mano con agricultores y comunidades indígenas para proteger la biodiversidad.</span>
                  </div>
                </li>
              </ul>
              <Link href="/prime" className="inline-flex items-center gap-2 bg-leaf hover:bg-leaf-deep text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-leaf/20">
                Multiplica tu impacto con Prime <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img src="/deforestacion.jpg" alt="Deforestación en Madre de Dios" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Star className="size-6 text-amber-500 fill-amber-500" />
                  </div>
                  <strong className="text-xl text-slate-900">5,430</strong>
                </div>
                <p className="text-sm text-slate-600 font-medium">Árboles plantados gracias a nuestra comunidad Prime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
