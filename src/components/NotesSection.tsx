"use client";

import { useState } from "react";
import { MessageSquare, Lock, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface NotesSectionProps {
  playerNotes: string;
  keeperNotes: string;
  onSavePlayerNotes: (notes: string) => Promise<void>;
  onSaveKeeperNotes: (notes: string) => Promise<void>;
}

export function NotesSection({
  playerNotes,
  keeperNotes,
  onSavePlayerNotes,
  onSaveKeeperNotes,
}: NotesSectionProps) {
  const { role } = useAuth();
  const [editingPlayer, setEditingPlayer] = useState(false);
  const [editingKeeper, setEditingKeeper] = useState(false);
  const [playerDraft, setPlayerDraft] = useState(playerNotes);
  const [keeperDraft, setKeeperDraft] = useState(keeperNotes);
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [savingKeeper, setSavingKeeper] = useState(false);

  const handleSavePlayer = async () => {
    setSavingPlayer(true);
    try {
      await onSavePlayerNotes(playerDraft);
      setEditingPlayer(false);
    } catch {
      alert("Failed to save notes.");
    } finally {
      setSavingPlayer(false);
    }
  };

  const handleSaveKeeper = async () => {
    setSavingKeeper(true);
    try {
      await onSaveKeeperNotes(keeperDraft);
      setEditingKeeper(false);
    } catch {
      alert("Failed to save notes.");
    } finally {
      setSavingKeeper(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Player Notes */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-muted uppercase tracking-wide">
            <MessageSquare className="w-3 h-3" />
            Player Notes
          </div>
          {!editingPlayer && (
            <button
              onClick={() => {
                setPlayerDraft(playerNotes);
                setEditingPlayer(true);
              }}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              Edit
            </button>
          )}
        </div>
        {editingPlayer ? (
          <div>
            <textarea
              value={playerDraft}
              onChange={(e) => setPlayerDraft(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent resize-y min-h-[80px]"
              placeholder="Add notes visible to all players..."
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setEditingPlayer(false)}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlayer}
                disabled={savingPlayer}
                className="flex items-center gap-1 text-xs bg-accent hover:bg-accent-hover text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
              >
                {savingPlayer ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {playerNotes || <span className="text-muted italic">No player notes yet.</span>}
          </p>
        )}
      </div>

      {/* Keeper Notes - only visible to keeper */}
      {role === "keeper" && (
        <div className="bg-surface border border-accent/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-accent uppercase tracking-wide">
              <Lock className="w-3 h-3" />
              Keeper Notes
              <span className="text-muted normal-case tracking-normal">(only you can see this)</span>
            </div>
            {!editingKeeper && (
              <button
                onClick={() => {
                  setKeeperDraft(keeperNotes);
                  setEditingKeeper(true);
                }}
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                Edit
              </button>
            )}
          </div>
          {editingKeeper ? (
            <div>
              <textarea
                value={keeperDraft}
                onChange={(e) => setKeeperDraft(e.target.value)}
                className="w-full bg-background border border-accent/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent resize-y min-h-[80px]"
                placeholder="Add private keeper notes..."
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setEditingKeeper(false)}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveKeeper}
                  disabled={savingKeeper}
                  className="flex items-center gap-1 text-xs bg-accent hover:bg-accent-hover text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {savingKeeper ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {keeperNotes || <span className="text-muted italic">No keeper notes yet.</span>}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
