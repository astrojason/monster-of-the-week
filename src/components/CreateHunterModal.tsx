"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Hunter } from "@/lib/types";
import { PLAYBOOK_LIST } from "@/lib/playbooks";
import { X, Plus } from "lucide-react";

interface CreateHunterModalProps {
  onClose: () => void;
  onCreate: (hunter: Hunter) => void;
}

export function CreateHunterModal({ onClose, onCreate }: CreateHunterModalProps) {
  const [form, setForm] = useState({
    name: "",
    playbook: PLAYBOOK_LIST[0],
    playedBy: "",
    charm: 0,
    cool: 0,
    sharp: 0,
    tough: 0,
    weird: 0,
    moves: "",
    gear: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.playedBy.trim()) {
      alert("Name and Played By are required.");
      return;
    }
    setSaving(true);
    try {
      const hunterData = {
        name: form.name.trim(),
        playbook: form.playbook,
        playedBy: form.playedBy.trim(),
        stats: {
          charm: Number(form.charm),
          cool: Number(form.cool),
          sharp: Number(form.sharp),
          tough: Number(form.tough),
          weird: Number(form.weird),
        },
        moves: form.moves.split(",").map((s) => s.trim()).filter(Boolean),
        gear: form.gear.split(",").map((s) => s.trim()).filter(Boolean),
        luck: 0,
        harm: 0,
        experience: 0,
        notes: form.notes,
        imageUrl: "",
        imageData: "",
      };
      const docRef = await addDoc(collection(db, "hunters"), hunterData);
      onCreate({ id: docRef.id, ...hunterData });
      onClose();
    } catch (err) {
      console.error("Failed to create hunter:", err);
      alert("Failed to create hunter.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Create New Hunter</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted mb-1">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="Hunter name"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Playbook</label>
              <select
                value={form.playbook}
                onChange={(e) => setForm({ ...form, playbook: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              >
                {PLAYBOOK_LIST.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Played By *</label>
              <input
                value={form.playedBy}
                onChange={(e) => setForm({ ...form, playedBy: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
                placeholder="Player name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Stats</label>
            <div className="grid grid-cols-5 gap-2">
              {(["charm", "cool", "sharp", "tough", "weird"] as const).map((stat) => (
                <div key={stat}>
                  <label className="block text-xs text-center text-muted capitalize">{stat}</label>
                  <input
                    type="number"
                    value={form[stat]}
                    onChange={(e) => setForm({ ...form, [stat]: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-accent"
                    min={-3}
                    max={3}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Moves (comma-separated)</label>
            <textarea
              value={form.moves}
              onChange={(e) => setForm({ ...form, moves: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              rows={2}
              placeholder="Move 1, Move 2"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Gear (comma-separated)</label>
            <textarea
              value={form.gear}
              onChange={(e) => setForm({ ...form, gear: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              rows={2}
              placeholder="Item 1, Item 2"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-border text-sm rounded py-2 hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm rounded py-2 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {saving ? "Creating..." : "Create Hunter"}
          </button>
        </div>
      </div>
    </div>
  );
}
