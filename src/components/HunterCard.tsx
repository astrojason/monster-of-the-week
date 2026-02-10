"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Hunter } from "@/lib/types";
import { TrackerBoxes } from "./TrackerBoxes";
import { ImageUpload } from "./ImageUpload";
import { HunterEditModal } from "./HunterEditModal";
import { Skull, Sparkles, Edit, User } from "lucide-react";

interface HunterCardProps {
  hunter: Hunter;
  onUpdate: (hunter: Hunter) => void;
}

export function HunterCard({ hunter, onUpdate }: HunterCardProps) {
  const { role } = useAuth();
  const [editing, setEditing] = useState(false);

  const isDoomed = hunter.luck >= 7;
  const canLevelUp = hunter.experience >= 5;

  const canEditTrackers = role === "keeper" || role === "player";
  const canUploadImage = role === "keeper" || role === "player";
  const canEditDetails = role === "keeper";

  const updateField = async (field: string, value: number) => {
    try {
      await updateDoc(doc(db, "hunters", hunter.id), { [field]: value });
      onUpdate({ ...hunter, [field]: value });
    } catch (err) {
      console.error("Failed to update:", err);
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

          {/* Notes */}
          {hunter.notes && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted">{hunter.notes}</p>
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
