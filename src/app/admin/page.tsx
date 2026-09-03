"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import type { Grant } from "@/lib/types";
import { Loader2, Plus, Shield, Trash2, User, Users } from "lucide-react";

export default function AdminPage() {
  const { status, role, user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<"player" | "keeper">("player");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status !== "authorized" || role !== "keeper") return;
    loadGrants();
  }, [status, role]);

  const loadGrants = async () => {
    setError("");
    try {
      const q = query(collection(db, "grants"), orderBy("email"));
      const snap = await getDocs(q);
      setGrants(snap.docs.map((d) => d.data() as Grant));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const addGrant = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setSaving(true);
    setError("");
    try {
      const grant: Grant = {
        email: normalizedEmail,
        role: newRole,
        addedAt: Date.now(),
        addedBy: user?.email ?? "",
      };
      await setDoc(doc(db, "grants", normalizedEmail), grant);
      setGrants((prev) => [...prev.filter((g) => g.email !== normalizedEmail), grant].sort((a, b) => a.email.localeCompare(b.email)));
      setEmail("");
      setNewRole("player");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const removeGrant = async (grantEmail: string) => {
    setError("");
    try {
      await deleteDoc(doc(db, "grants", grantEmail));
      setGrants((prev) => prev.filter((g) => g.email !== grantEmail));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (status !== "authorized") return <LoginForm />;

  if (role !== "keeper") {
    return (
      <div className="text-center py-20 text-muted">
        <p>Only the Keeper can manage access.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-accent" />
        <h1 className="text-2xl font-bold">Access</h1>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium mb-3">Grant access</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="grant-email" className="block text-xs text-muted mb-1">
              Email
            </label>
            <input
              id="grant-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="player@example.com"
            />
          </div>
          <div>
            <label htmlFor="grant-role" className="block text-xs text-muted mb-1">
              Role
            </label>
            <select
              id="grant-role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "player" | "keeper")}
              className="bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="player">Player</option>
              <option value="keeper">Keeper</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={addGrant}
              disabled={saving || !email.trim()}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </button>
          </div>
        </div>
      </div>

      {error && (
        <pre className="text-danger text-xs bg-surface border border-border rounded p-3 mb-6 whitespace-pre-wrap break-words select-all">
          {error}
        </pre>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : grants.length === 0 ? (
        <p className="text-center text-muted py-12">No grants yet.</p>
      ) : (
        <div className="space-y-2">
          {grants.map((grant) => (
            <div
              key={grant.email}
              className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm">
                {grant.role === "keeper" ? (
                  <Shield className="w-4 h-4 text-accent" />
                ) : (
                  <User className="w-4 h-4 text-success" />
                )}
                <span>{grant.name || grant.email}</span>
                <span className="text-xs text-muted uppercase">{grant.role}</span>
              </div>
              <button
                onClick={() => removeGrant(grant.email)}
                className="text-muted hover:text-danger transition-colors p-1"
                title="Remove access"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
