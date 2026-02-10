"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Hunter } from "@/lib/types";
import { LoginForm } from "@/components/LoginForm";
import { HunterCard } from "@/components/HunterCard";
import { CreateHunterModal } from "@/components/CreateHunterModal";
import { Plus, Loader2 } from "lucide-react";

export default function HomePage() {
  const { role } = useAuth();
  const [hunters, setHunters] = useState<Hunter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!role) return;
    loadHunters();
  }, [role]);

  const loadHunters = async () => {
    try {
      const q = query(collection(db, "hunters"), orderBy("name"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Hunter));
      setHunters(data);
    } catch (err) {
      console.error("Failed to load hunters:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!role) return <LoginForm />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const updateHunter = (updated: Hunter) => {
    setHunters((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hunters</h1>
        {role === "keeper" && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Hunter
          </button>
        )}
      </div>

      {hunters.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p>No hunters yet.</p>
          {role === "keeper" && (
            <p className="text-sm mt-1">Create your first hunter or run the seed script.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {hunters.map((hunter) => (
            <HunterCard key={hunter.id} hunter={hunter} onUpdate={updateHunter} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateHunterModal
          onClose={() => setShowCreate(false)}
          onCreate={(h) => {
            setHunters((prev) => [...prev, h].sort((a, b) => a.name.localeCompare(b.name)));
          }}
        />
      )}
    </div>
  );
}
