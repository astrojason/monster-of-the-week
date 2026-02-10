"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, orderBy, query, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import type { Mystery } from "@/lib/types";
import Link from "next/link";
import { BookOpen, Plus, Loader2, CheckCircle, Clock, X, Save, Edit } from "lucide-react";

export default function MysteriesPage() {
  const { role } = useAuth();
  const [mysteries, setMysteries] = useState<(Mystery & { sessionCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;
    loadMysteries();
  }, [role]);

  const loadMysteries = async () => {
    try {
      const q = query(collection(db, "mysteries"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = await Promise.all(
        snap.docs.map(async (d) => {
          const sessionsRef = collection(db, "mysteries", d.id, "sessions");
          const countSnap = await getCountFromServer(sessionsRef);
          return {
            id: d.id,
            ...d.data(),
            sessionCount: countSnap.data().count,
          } as Mystery & { sessionCount: number };
        })
      );
      setMysteries(data);
    } catch (err) {
      console.error("Failed to load mysteries:", err);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mysteries</h1>
        {role === "keeper" && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Mystery
          </button>
        )}
      </div>

      {mysteries.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-border" />
          <p>No mysteries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mysteries.map((mystery) => (
            <MysteryRow
              key={mystery.id}
              mystery={mystery}
              isKeeper={role === "keeper"}
              isEditing={editingId === mystery.id}
              onEdit={() => setEditingId(mystery.id)}
              onCancelEdit={() => setEditingId(null)}
              onUpdate={(updated) => {
                setMysteries((prev) =>
                  prev.map((m) => (m.id === updated.id ? { ...updated, sessionCount: mystery.sessionCount } : m))
                );
                setEditingId(null);
              }}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateMysteryModal
          onClose={() => setShowCreate(false)}
          onCreate={(m) => {
            setMysteries((prev) => [{ ...m, sessionCount: 0 }, ...prev]);
          }}
        />
      )}
    </div>
  );
}

function MysteryRow({
  mystery,
  isKeeper,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
}: {
  mystery: Mystery & { sessionCount: number };
  isKeeper: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (m: Mystery) => void;
}) {
  const [form, setForm] = useState({
    title: mystery.title,
    description: mystery.description,
    status: mystery.status,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "mysteries", mystery.id), form);
      onUpdate({ ...mystery, ...form });
    } catch (err) {
      console.error("Failed to update mystery:", err);
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-surface border border-accent rounded-lg p-4">
        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            rows={2}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "completed" })}
            className="bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex gap-2">
            <button onClick={onCancelEdit} className="text-sm text-muted hover:text-foreground">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 bg-accent hover:bg-accent-hover text-white text-sm px-3 py-1 rounded transition-colors disabled:opacity-50"
            >
              <Save className="w-3 h-3" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/mysteries/${mystery.id}`}
      className="block bg-surface border border-border hover:border-border-light rounded-lg p-4 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{mystery.title}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                mystery.status === "active"
                  ? "bg-success/20 text-success"
                  : "bg-muted/20 text-muted"
              }`}
            >
              {mystery.status === "active" ? (
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Active</span>
              ) : (
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>
              )}
            </span>
          </div>
          {mystery.description && (
            <p className="text-sm text-muted mb-1">{mystery.description}</p>
          )}
          <p className="text-xs text-muted">{mystery.sessionCount} session{mystery.sessionCount !== 1 ? "s" : ""}</p>
        </div>
        {isKeeper && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className="text-muted hover:text-foreground transition-colors p-1 ml-2"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>
    </Link>
  );
}

function CreateMysteryModal({ onClose, onCreate }: { onClose: () => void; onCreate: (m: Mystery) => void }) {
  const [form, setForm] = useState({ title: "", description: "", status: "active" as const });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      alert("Title is required.");
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, createdAt: Date.now() };
      const docRef = await addDoc(collection(db, "mysteries"), data);
      onCreate({ id: docRef.id, ...data });
      onClose();
    } catch (err) {
      console.error("Failed to create mystery:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">New Mystery</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="Mystery title"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              rows={3}
              placeholder="Brief description of the mystery"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-border text-sm rounded py-2 hover:bg-surface-hover transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm rounded py-2 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
