"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Hunter } from "@/lib/types";
import { PLAYBOOK_LIST } from "@/lib/playbooks";
import { X, Save } from "lucide-react";

interface HunterEditModalProps {
  hunter: Hunter;
  onClose: () => void;
  onSave: (hunter: Hunter) => void;
}

export function HunterEditModal({ hunter, onClose, onSave }: HunterEditModalProps) {
  const [form, setForm] = useState({
    name: hunter.name,
    playbook: hunter.playbook,
    playedBy: hunter.playedBy,
    charm: hunter.stats.charm,
    cool: hunter.stats.cool,
    sharp: hunter.stats.sharp,
    tough: hunter.stats.tough,
    weird: hunter.stats.weird,
    moves: hunter.moves.join(", "),
    gear: hunter.gear.join(", "),
    notes: hunter.notes,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated: Partial<Hunter> = {
        name: form.name,
        playbook: form.playbook,
        playedBy: form.playedBy,
        stats: {
          charm: Number(form.charm),
          cool: Number(form.cool),
          sharp: Number(form.sharp),
          tough: Number(form.tough),
          weird: Number(form.weird),
        },
        moves: form.moves.split(",").map((s) => s.trim()).filter(Boolean),
        gear: form.gear.split(",").map((s) => s.trim()).filter(Boolean),
        notes: form.notes,
      };
      await updateDoc(doc(db, "hunters", hunter.id), updated);
      onSave({ ...hunter, ...updated } as Hunter);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Edit {hunter.name}</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
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
              <label className="block text-xs text-muted mb-1">Played By</label>
              <input
                value={form.playedBy}
                onChange={(e) => setForm({ ...form, playedBy: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
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
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Gear (comma-separated)</label>
            <textarea
              value={form.gear}
              onChange={(e) => setForm({ ...form, gear: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              rows={3}
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
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm rounded py-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
