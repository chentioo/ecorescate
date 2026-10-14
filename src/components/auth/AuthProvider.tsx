"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { DEFAULT_AVATAR, getCleanAvatar } from "@/lib/avatars";
import { useRouter, usePathname } from "next/navigation";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  dietaryPreference?: string;
  emailNotifications?: boolean;
  whatsappNotifications?: boolean;
  defaultBringContainer?: boolean;
  favoriteRestaurantIds?: string[];
  primePlan?: "monthly" | "annual";
  primeSince?: string;
  createdAt?: any;
  co2SavedKg?: number;
  moneySaved?: number;
  rescuedCount?: number;
  isPrime?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, avatarUrl?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  refreshUserProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Helper to sync user profile to Firestore
  const syncUserProfile = async (firebaseUser: User, customName?: string, customAvatar?: string) => {
    const safeAvatar = getCleanAvatar(customAvatar || firebaseUser.photoURL);
    const localFallback: UserProfile = {
      uid: firebaseUser.uid,
      name: customName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Usuario",
      email: firebaseUser.email || "",
      photoURL: safeAvatar,
      co2SavedKg: 0,
      moneySaved: 0,
      rescuedCount: 0,
      isPrime: false,
    };

    setProfile(localFallback);

    // Si Firebase Auth tenía una URL rota o con dicebear, la corregimos
    if (firebaseUser.photoURL && firebaseUser.photoURL.includes("dicebear")) {
      updateProfile(firebaseUser, { photoURL: safeAvatar }).catch(() => {});
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        data.photoURL = getCleanAvatar(data.photoURL || safeAvatar);
        // Garantizamos que Firestore tenga un avatar válido local
        await setDoc(userRef, { photoURL: data.photoURL }, { merge: true });
        setProfile(data);
      } else {
        const newProfile: UserProfile = {
          ...localFallback,
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn("Firestore sync non-fatal warning:", err);
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        syncUserProfile(firebaseUser);

        // Suscripción reactiva en tiempo real al perfil en Firestore
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setProfile((prev) => ({
                ...(prev || {}),
                ...data,
                photoURL: getCleanAvatar(data.photoURL || prev?.photoURL),
                co2SavedKg: Number(data.co2SavedKg ?? prev?.co2SavedKg ?? 0),
                moneySaved: Number(data.moneySaved ?? prev?.moneySaved ?? 0),
                rescuedCount: Number(data.rescuedCount ?? prev?.rescuedCount ?? 0),
              }));
            }
          });
        } catch (e) {
          console.warn("Snapshot subscription warning:", e);
        }
      } else {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
        setProfile(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const refreshUserProfile = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setProfile((prev) => ({
          ...(prev || {}),
          ...data,
          photoURL: getCleanAvatar(data.photoURL || prev?.photoURL),
          co2SavedKg: Number(data.co2SavedKg ?? prev?.co2SavedKg ?? 0),
          moneySaved: Number(data.moneySaved ?? prev?.moneySaved ?? 0),
          rescuedCount: Number(data.rescuedCount ?? prev?.rescuedCount ?? 0),
        }));
      }
    } catch (e) {
      console.warn("Error refreshing user profile:", e);
    }
  };

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Strict route protection
  useEffect(() => {
    if (loading) return;

    if (user && isAuthRoute) {
      router.push("/");
    } else if (!user && !isAuthRoute) {
      router.push("/login");
    }
  }, [user, loading, pathname, isAuthRoute, router]);

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    setUser(res.user);
    await syncUserProfile(res.user);
  };

  const registerWithEmail = async (name: string, email: string, pass: string, avatarUrl?: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const chosenAvatar = avatarUrl || DEFAULT_AVATAR;

    try {
      await updateProfile(res.user, { 
        displayName: name.trim() || "Usuario",
        photoURL: chosenAvatar
      });
    } catch (e) {
      console.warn("Error setting initial profile in auth:", e);
    }

    setUser(res.user);
    await syncUserProfile(res.user, name.trim(), chosenAvatar);
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    setUser(res.user);
    await syncUserProfile(res.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    router.push("/login");
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    const cleanAvatar = data.photoURL ? getCleanAvatar(data.photoURL) : undefined;

    // 1. Actualizar en Firebase Auth si corresponde
    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (data.name) authUpdates.displayName = data.name.trim();
    if (cleanAvatar) authUpdates.photoURL = cleanAvatar;

    try {
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(user, authUpdates);
      }
    } catch (e) {
      console.warn("Error actualizando perfil en Auth:", e);
    }

    // 2. Actualizar en Firestore con merge
    try {
      const userRef = doc(db, "users", user.uid);
      const payload: Record<string, any> = { ...data };
      if (payload.name) payload.name = payload.name.trim();
      if (cleanAvatar) payload.photoURL = cleanAvatar;

      await setDoc(userRef, payload, { merge: true });
    } catch (e) {
      console.warn("Error actualizando perfil en Firestore:", e);
    }

    // 3. Actualizar estado local reactivo inmediatamente
    setProfile((prev) => {
      const current = prev || {
        uid: user.uid,
        name: data.name ? data.name.trim() : (user.displayName || "Usuario"),
        email: user.email || "",
        photoURL: cleanAvatar || user.photoURL || DEFAULT_AVATAR,
        co2SavedKg: 0,
        moneySaved: 0,
        rescuedCount: 0,
        isPrime: false,
      };
      return {
        ...current,
        ...data,
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(cleanAvatar ? { photoURL: cleanAvatar } : {}),
      };
    });
  };

  // Loading screen before auth status is known
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-slate-500">Cargando EcoRescate...</span>
        </div>
      </div>
    );
  }

  // Prevent flash of private content if not logged in
  if (!user && !isAuthRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-slate-500">Inicia sesión para continuar...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        updateUserProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
