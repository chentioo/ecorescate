import Link from "next/link";
import { Menu, Leaf, User } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="size-6 text-primary" />
              <span className="font-bold text-xl tracking-tight text-slate-800">EcoRescate</span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/explore" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Explorar Ofertas
            </Link>
            
            <Link href="/prime" className="flex items-center gap-1.5 text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors border border-amber-200">
              <span className="text-amber-500">✨ Prime</span>
            </Link>
            
            {/* New Profile Link */}
            <Link href="/profile" className="flex items-center gap-2 text-sm font-medium bg-slate-50 text-slate-700 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors border border-slate-200">
              <User className="size-4" />
              <span>Mi Perfil</span>
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button className="p-2 rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none">
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
