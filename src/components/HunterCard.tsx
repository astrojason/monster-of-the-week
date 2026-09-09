"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Hunter } from "@/lib/types";
import { summarizePlaybookOptions } from "@/lib/playbookOptions";
import { getEffectiveSections, type PlaybookOptionOverrides } from "@/lib/playbookOptionsStore";
import { TrackerBoxes } from "./TrackerBoxes";
import { ImageUpload } from "./ImageUpload";
import { HunterEditModal } from "./HunterEditModal";
import { Skull, Sparkles, Edit, User, MessageSquare, Lock, Save, Loader2 } from "lucide-react";

interface HunterCardProps {
  hunter: Hunter;
  optionOverrides?: PlaybookOptionOverrides;
  onUpdate: (hunter: Hunter) => void;
}

export function HunterCard({ hunter, optionOverrides = {}, onUpdate }: HunterCardProps) {
  const { role, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editingPlayerNotes, setEditingPlayerNotes] = useState(false);
  const [editingKeeperNotes, setEditingKeeperNotes] = useState(false);
  const [playerNotesDraft, setPlayerNotesDraft] = useState(hunter.playerNotes || "");
  const [keeperNotesDraft, setKeeperNotesDraft] = useState(hunter.keeperNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  const isDoomed = hunter.luck >= 7;
  const canLevelUp = hunter.experience >= 5;

  const isOwnHunter =
    !!user?.email &&
    (hunter.playerEmails || []).some((email) => email.toLowerCase() === user.email!.toLowerCase());
  const canEditHunter = role === "keeper" || (role === "player" && isOwnHunter);
  const canEditTrackers = canEditHunter;
  const canUploadImage = canEditHunter;
  const canEditDetails = canEditHunter;

  const optionSummaries = summarizePlaybookOptions(
    getEffectiveSections(hunter.playbook, optionOverrides),
    hunter.playbookOptions
  );

  const updateField = async (field: string, value: number) => {
    try {
      await updateDoc(doc(db, "hunters", hunter.id), { [field]: value });
      onUpdate({ ...hunter, [field]: value });
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const saveNotes = async (field: "playerNotes" | "keeperNotes", value: string) => {
    setSavingNotes(true);
    try {
      await updateDoc(doc(db, "hunters", hunter.id), { [field]: value });
      onUpdate({ ...hunter, [field]: value });
      if (field === "playerNotes") setEditingPlayerNotes(false);
      else setEditingKeeperNotes(false);
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleTrackerToggle = (field: "luck" | "harm" | "experience", index: number) => {
    const current = hunter[field];
    const newValue = index === current ? current - 1 : index;
    updateField(field, Math.max(0, newValue));
  };

  let cardClass = "bg-surface border rounded-lg overflow-hidden transition-all ";
  if (isDoomed) {
    cardClass += "border-danger doomed-card";
  } else if (canLevelUp) {
    cardClass += "border-success levelup-card";
  } else {
    cardClass += "border-border hover:border-border-light";
  }

  return (
    <>
      <div className={cardClass}>
        {/* Image */}
        <div className="relative aspect-square bg-background">
          {(hunter.imageData || hunter.imageUrl) ? (
            <img
              src={hunter.imageData || hunter.imageUrl}
              alt={hunter.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-16 h-16 text-border" />
            </div>
          )}
          {canUploadImage && (
            <ImageUpload
              hunterId={hunter.id}
              onUploaded={(dataUrl) => onUpdate({ ...hunter, imageData: dataUrl })}
            />
          )}
          {isDoomed && (
            <div className="absolute top-2 left-2 bg-danger/90 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Skull className="w-3 h-3" />
              DOOMED
            </div>
          )}
          {canLevelUp && !isDoomed && (
            <div className="absolute top-2 left-2 bg-success/90 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              LEVEL UP
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-bold text-lg leading-tight">{hunter.name}</h3>
              <p className="text-accent text-sm">{hunter.playbook}</p>
              <p className="text-muted text-xs">Played by {hunter.playedBy}</p>
            </div>
            {canEditDetails && (
              <button
                onClick={() => setEditing(true)}
                className="text-muted hover:text-foreground transition-colors p-1"
                title="Edit hunter"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-1 my-3">
            {(["charm", "cool", "sharp", "tough", "weird"] as const).map((stat) => (
              <div key={stat} className="text-center">
                <div className="text-xs text-muted uppercase">{stat.slice(0, 3)}</div>
                <div className={`text-sm font-bold ${hunter.stats[stat] >= 0 ? "text-foreground" : "text-danger"}`}>
                  {hunter.stats[stat] >= 0 ? `+${hunter.stats[stat]}` : hunter.stats[stat]}
                </div>
              </div>
            ))}
          </div>

          {/* Moves */}
          {hunter.moves.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Moves</p>
              <div className="flex flex-wrap gap-1">
                {hunter.moves.map((move, i) => (
                  <span key={i} className="text-xs bg-background border border-border px-2 py-0.5 rounded">
                    {move}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gear */}
          {hunter.gear.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Gear</p>
              <div className="flex flex-wrap gap-1">
                {hunter.gear.map((item, i) => (
                  <span key={i} className="text-xs bg-background border border-border px-2 py-0.5 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Character Options (playbook-specific, structured) */}
          {optionSummaries.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Character Options</p>
              <div className="flex flex-col gap-1">
                {optionSummaries.map((summary, i) => (
                  <span
                    key={i}
                    className="text-xs bg-background border border-border px-2 py-1 rounded"
                  >
                    {summary}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Other Options (freeform) */}
          {(hunter.options || []).length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Other Options</p>
              <div className="flex flex-wrap gap-1">
                {hunter.options.map((option, i) => (
                  <span key={i} className="text-xs bg-background border border-border px-2 py-0.5 rounded">
                    {option}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trackers */}
          <div className="space-y-2 mt-3">
            <TrackerBoxes
              label="Luck"
              current={hunter.luck}
              max={7}
              disabled={!canEditTrackers}
              variant="luck"
              onToggle={(i) => handleTrackerToggle("luck", i)}
            />
            <TrackerBoxes
              label="Harm"
              current={hunter.harm}
              max={7}
              disabled={!canEditTrackers}
              variant="harm"
              onToggle={(i) => handleTrackerToggle("harm", i)}
            />
            <TrackerBoxes
              label="Experience"
              current={hunter.experience}
              max={5}
              disabled={!canEditTrackers}
              variant="experience"
              onToggle={(i) => handleTrackerToggle("experience", i)}
            />
          </div>

          {/* Player Notes */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-xs text-muted">
                <MessageSquare className="w-3 h-3" />
                Player Notes
              </span>
              {!editingPlayerNotes && canEditHunter && (
                <button
                  onClick={() => { setPlayerNotesDraft(hunter.playerNotes || ""); setEditingPlayerNotes(true); }}
                  aria-label="Edit player notes"
                  className="text-xs text-accent hover:text-accent-hover"
                >
                  Edit
                </button>
              )}
            </div>
            {editingPlayerNotes ? (
              <div>
                <textarea
                  value={playerNotesDraft}
                  onChange={(e) => setPlayerNotesDraft(e.target.value)}
                  className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-accent resize-y min-h-[60px]"
                  placeholder="Notes visible to all players..."
                  autoFocus
                />
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setEditingPlayerNotes(false)} className="text-xs text-muted hover:text-foreground">Cancel</button>
                  <button
                    onClick={() => saveNotes("playerNotes", playerNotesDraft)}
                    disabled={savingNotes}
                    className="flex items-center gap-1 text-xs bg-accent hover:bg-accent-hover text-white px-2 py-0.5 rounded disabled:opacity-50"
                  >
                    {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs whitespace-pre-wrap">
                {hunter.playerNotes || <span className="text-muted italic">No notes yet.</span>}
              </p>
            )}
          </div>

          {/* Keeper Notes */}
          {role === "keeper" && (
            <div className="mt-2 pt-2 border-t border-accent/20">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-xs text-accent">
                  <Lock className="w-3 h-3" />
                  Keeper Only
                </span>
                {!editingKeeperNotes && (
                  <button
                    onClick={() => { setKeeperNotesDraft(hunter.keeperNotes || ""); setEditingKeeperNotes(true); }}
                    className="text-xs text-accent hover:text-accent-hover"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingKeeperNotes ? (
                <div>
                  <textarea
                    value={keeperNotesDraft}
                    onChange={(e) => setKeeperNotesDraft(e.target.value)}
                    className="w-full bg-background border border-accent/30 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-accent resize-y min-h-[60px]"
                    placeholder="Private keeper notes..."
                    autoFocus
                  />
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => setEditingKeeperNotes(false)} className="text-xs text-muted hover:text-foreground">Cancel</button>
                    <button
                      onClick={() => saveNotes("keeperNotes", keeperNotesDraft)}
                      disabled={savingNotes}
                      className="flex items-center gap-1 text-xs bg-accent hover:bg-accent-hover text-white px-2 py-0.5 rounded disabled:opacity-50"
                    >
                      {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs whitespace-pre-wrap">
                  {hunter.keeperNotes || <span className="text-muted italic">No keeper notes.</span>}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <HunterEditModal
          hunter={hunter}
          onClose={() => setEditing(false)}
          onSave={(updated) => {
            onUpdate(updated);
            setEditing(false);
          }}
        />
      )}
    </>
  );
}
