"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = localStorage.getItem("ecoRescateUser");
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    if (user) {
      setIsAuthenticated(true);
      if (isAuthRoute) {
        router.push("/");
      }
    } else {
      setIsAuthenticated(false);
      if (!isAuthRoute) {
        router.push("/register");
      }
    }
  }, [pathname, router]);

  // Si no ha comprobado aún y no estamos en auth, mostramos null para evitar destellos
  if (isAuthenticated === null) {
    const isAuthRoute = pathname === "/login" || pathname === "/register";
    return isAuthRoute ? <>{children}</> : null; 
  }

  return <>{children}</>;
}
