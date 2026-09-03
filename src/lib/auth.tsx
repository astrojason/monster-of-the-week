"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";
import type { Role } from "./types";

export type AuthStatus = "loading" | "signed-out" | "unauthorized" | "authorized";

interface AuthContextType {
  user: User | null;
  role: Role;
  status: AuthStatus;
  error: string;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  status: "loading",
  error: "",
  signIn: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setError("");

      if (!firebaseUser || !firebaseUser.email) {
        setUser(null);
        setRole(null);
        setStatus("signed-out");
        return;
      }

      setUser(firebaseUser);

      const grantRef = doc(db, "grants", firebaseUser.email.toLowerCase());

      try {
        const grantSnap = await getDoc(grantRef);
        if (grantSnap.exists()) {
          setRole(grantSnap.data().role as Role);
          setStatus("authorized");

          if (firebaseUser.displayName && firebaseUser.displayName !== grantSnap.data().name) {
            try {
              await updateDoc(grantRef, { name: firebaseUser.displayName });
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }
        } else {
          setRole(null);
          setStatus("unauthorized");
        }
      } catch (err) {
        setRole(null);
        setStatus("unauthorized");
        setError(err instanceof Error ? err.message : String(err));
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  const logout = async () => {
    setError("");
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, status, error, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
