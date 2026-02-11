"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Skull, BookOpen, LogOut, Shield, User, Crosshair } from "lucide-react";

export function Navbar() {
  const { role, logout } = useAuth();
  const pathname = usePathname();

  if (!role) return null;

  const isHunters = pathname === "/";
  const isMysteries = pathname.startsWith("/mysteries");

  return (
    <nav className="border-b border-border bg-surface sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
            <Skull className="w-5 h-5" />
            <span className="font-bold text-sm">MotW Tracker</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${
                isHunters
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <Crosshair className="w-4 h-4" />
              Hunters
            </Link>
            <Link
              href="/mysteries"
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${
                isMysteries
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Mysteries
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-border">
            {role === "keeper" ? <Shield className="w-3 h-3 text-accent" /> : <User className="w-3 h-3 text-success" />}
            {role === "keeper" ? "Keeper" : "Player"}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
