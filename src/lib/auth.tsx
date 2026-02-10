"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Role } from "./types";

interface AuthContextType {
  role: Role;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    const stored = localStorage.getItem("motw-role");
    if (stored === "player" || stored === "keeper") {
      setRole(stored);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === process.env.NEXT_PUBLIC_KEEPER_PASSWORD) {
      setRole("keeper");
      localStorage.setItem("motw-role", "keeper");
      return true;
    }
    if (password === process.env.NEXT_PUBLIC_PLAYER_PASSWORD) {
      setRole("player");
      localStorage.setItem("motw-role", "player");
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("motw-role");
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
