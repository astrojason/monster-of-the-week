"use client";

import { useEffect, useState, use } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { NotesSection } from "@/components/NotesSection";
import type { Mystery, Session } from "@/lib/types";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  FileText,
  Calendar,
  X,
  Upload,
  CheckCircle,
  RotateCcw,
} from "lucide-react";

export default function MysteryDetailPage({
  params,
}: {
  params: Promise<{ mysteryId: string }>;
}) {
  const { mysteryId } = use(params);
  const { role } = useAuth();
  const [mystery, setMystery] = useState<Mystery | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const toggleMysteryStatus = async () => {
    if (!mystery) return;
    setTogglingStatus(true);
    try {
      const newStatus = mystery.status === "active" ? "completed" : "active";
      await updateDoc(doc(db, "mysteries", mysteryId), { status: newStatus });
      setMystery({ ...mystery, status: newStatus });
    } catch (err) {
      console.error("Failed to update mystery status:", err);
    } finally {
      setTogglingStatus(false);
    }
  };

  useEffect(() => {
    if (!role) return;
    loadData();
  }, [role, mysteryId]);

  const loadData = async () => {
    try {
      const mysteryDoc = await getDoc(doc(db, "mysteries", mysteryId));
      if (mysteryDoc.exists()) {
        setMystery({ id: mysteryDoc.id, ...mysteryDoc.data() } as Mystery);
      }
      const q = query(
        collection(db, "mysteries", mysteryId, "sessions"),
        orderBy("sessionNumber", "asc")
      );
      const snap = await getDocs(q);
      setSessions(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Session))
      );
    } catch (err) {
      console.error("Failed to load mystery:", err);
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

  if (!mystery) {
    return (
      <div className="text-center py-20 text-muted">
        <p>Mystery not found.</p>
        <Link href="/mysteries" className="text-accent text-sm mt-2 inline-block">
          Back to Mysteries
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/mysteries"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Mysteries
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{mystery.title}</h1>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                mystery.status === "active"
                  ? "bg-success/20 text-success"
                  : "bg-muted/20 text-muted"
              }`}
            >
              {mystery.status}
            </span>
          </div>
          {role === "keeper" && (
            <button
              onClick={toggleMysteryStatus}
              disabled={togglingStatus}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 ${
                mystery.status === "active"
                  ? "bg-success/20 text-success hover:bg-success/30"
                  : "bg-accent/20 text-accent hover:bg-accent/30"
              }`}
            >
              {mystery.status === "active" ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Reopen
                </>
              )}
            </button>
          )}
        </div>
        {mystery.description && (
          <p className="text-muted text-sm">{mystery.description}</p>
        )}
      </div>

      {/* Notes */}
      <div className="mb-6">
        <NotesSection
          playerNotes={mystery.playerNotes || ""}
          keeperNotes={mystery.keeperNotes || ""}
          onSavePlayerNotes={async (notes) => {
            await updateDoc(doc(db, "mysteries", mysteryId), { playerNotes: notes });
            setMystery({ ...mystery, playerNotes: notes });
          }}
          onSaveKeeperNotes={async (notes) => {
            await updateDoc(doc(db, "mysteries", mysteryId), { keeperNotes: notes });
            setMystery({ ...mystery, keeperNotes: notes });
          }}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Sessions</h2>
        {role === "keeper" && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-muted bg-surface border border-border rounded-lg">
          <FileText className="w-10 h-10 mx-auto mb-2 text-border" />
          <p>No sessions yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/mysteries/${mysteryId}/sessions/${session.id}`}
              className="flex items-center justify-between bg-surface border border-border hover:border-border-light rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/20 text-accent rounded flex items-center justify-center text-sm font-bold">
                  {session.sessionNumber}
                </div>
                <div>
                  <p className="font-medium text-sm">Session {session.sessionNumber}</p>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Calendar className="w-3 h-3" />
                    {session.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.summary && (
                  <span className="text-xs text-muted max-w-xs truncate hidden sm:block">
                    {session.summary}
                  </span>
                )}
                {session.transcript && (
                  <FileText className="w-4 h-4 text-accent" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateSessionModal
          mysteryId={mysteryId}
          nextNumber={sessions.length + 1}
          onClose={() => setShowCreate(false)}
          onCreate={(s) => {
            setSessions((prev) => [...prev, s]);
          }}
        />
      )}
    </div>
  );
}

function CreateSessionModal({
  mysteryId,
  nextNumber,
  onClose,
  onCreate,
}: {
  mysteryId: string;
  nextNumber: number;
  onClose: () => void;
  onCreate: (s: Session) => void;
}) {
  const [form, setForm] = useState({
    sessionNumber: nextNumber,
    date: new Date().toISOString().split("T")[0],
    summary: "",
  });
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [transcriptName, setTranscriptName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    try {
      let transcript = "";

      if (transcriptFile) {
        transcript = await transcriptFile.text();
      }

      const sessionData = {
        sessionNumber: Number(form.sessionNumber),
        date: form.date,
        summary: form.summary,
        transcript,
        transcriptName,
        playerNotes: "",
        keeperNotes: "",
        createdAt: Date.now(),
      };

      const docRef = await addDoc(
        collection(db, "mysteries", mysteryId, "sessions"),
        sessionData
      );
      onCreate({ id: docRef.id, ...sessionData });
      onClose();
    } catch (err) {
      console.error("Failed to create session:", err);
      alert("Failed to create session.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">New Session</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Session #</label>
              <input
                type="number"
                value={form.sessionNumber}
                onChange={(e) =>
                  setForm({ ...form, sessionNumber: parseInt(e.target.value) || 1 })
                }
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
                min={1}
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              rows={3}
              placeholder="Brief summary of the session"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">
              Transcript (.md file)
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-background border border-border rounded px-3 py-2 text-sm hover:border-border-light transition-colors">
              <Upload className="w-4 h-4 text-muted" />
              <span className="text-muted">
                {transcriptName || "Choose file..."}
              </span>
              <input
                type="file"
                accept=".md,.markdown,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setTranscriptFile(file);
                  setTranscriptName(file?.name || "");
                }}
                className="hidden"
              />
            </label>
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
            {saving ? "Creating..." : "Create Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
