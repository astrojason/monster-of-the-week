"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { NotesSection } from "@/components/NotesSection";
import type { Mystery, Session } from "@/lib/types";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Loader2,
  ScrollText,
  Edit,
  X,
  Save,
  Upload,
} from "lucide-react";

type Tab = "recap" | "transcript";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ mysteryId: string; sessionId: string }>;
}) {
  const { mysteryId, sessionId } = use(params);
  const { role } = useAuth();
  const [mystery, setMystery] = useState<Mystery | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("recap");
  const [editingSession, setEditingSession] = useState(false);

  useEffect(() => {
    if (!role) return;
    loadData();
  }, [role, mysteryId, sessionId]);

  const loadData = async () => {
    try {
      const [mysteryDoc, sessionDoc] = await Promise.all([
        getDoc(doc(db, "mysteries", mysteryId)),
        getDoc(doc(db, "mysteries", mysteryId, "sessions", sessionId)),
      ]);

      if (mysteryDoc.exists()) {
        setMystery({ id: mysteryDoc.id, ...mysteryDoc.data() } as Mystery);
      }
      if (sessionDoc.exists()) {
        setSession({
          id: sessionDoc.id,
          ...sessionDoc.data(),
        } as Session);
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    } finally {
      setLoading(false);
    }
  };

  const sessionDocRef = doc(db, "mysteries", mysteryId, "sessions", sessionId);

  if (!role) return <LoginForm />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!session || !mystery) {
    return (
      <div className="text-center py-20 text-muted">
        <p>Session not found.</p>
        <Link
          href="/mysteries"
          className="text-accent text-sm mt-2 inline-block"
        >
          Back to Mysteries
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/mysteries/${mysteryId}`}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {mystery.title}
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted mb-1">
              <span>{mystery.title}</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {session.date}
              </span>
            </div>
            <h1 className="text-2xl font-bold">
              Session {session.sessionNumber}
            </h1>
          </div>
          {role === "keeper" && (
            <button
              onClick={() => setEditingSession(true)}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("recap")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "recap"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <ScrollText className="w-4 h-4" />
          Recap
        </button>
        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "transcript"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          Transcript
          {!session.transcript && (
            <span className="text-xs text-muted">(none)</span>
          )}
        </button>
      </div>

      {/* Recap Tab */}
      {activeTab === "recap" && (
        <div>
          {session.summary ? (
            <div className="bg-surface border border-border rounded-lg p-6 prose-dark">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {session.summary}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-12 text-muted bg-surface border border-border rounded-lg">
              <ScrollText className="w-10 h-10 mx-auto mb-2 text-border" />
              <p className="text-sm">No recap for this session yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Transcript Tab */}
      {activeTab === "transcript" && (
        <div>
          {session.transcript ? (
            <div>
              {session.transcriptName && (
                <p className="text-xs text-muted mb-3">
                  {session.transcriptName}
                </p>
              )}
              <div className="bg-surface border border-border rounded-lg p-6 prose-dark">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {session.transcript}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted bg-surface border border-border rounded-lg">
              <FileText className="w-10 h-10 mx-auto mb-2 text-border" />
              <p className="text-sm">No transcript uploaded for this session.</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="mt-6">
        <NotesSection
          playerNotes={session.playerNotes || ""}
          keeperNotes={session.keeperNotes || ""}
          onSavePlayerNotes={async (notes) => {
            await updateDoc(sessionDocRef, { playerNotes: notes });
            setSession({ ...session, playerNotes: notes });
          }}
          onSaveKeeperNotes={async (notes) => {
            await updateDoc(sessionDocRef, { keeperNotes: notes });
            setSession({ ...session, keeperNotes: notes });
          }}
        />
      </div>

      {/* Edit Session Modal (Keeper only) */}
      {editingSession && (
        <EditSessionModal
          session={session}
          mysteryId={mysteryId}
          onClose={() => setEditingSession(false)}
          onSave={(updated) => {
            setSession(updated);
            setEditingSession(false);
          }}
        />
      )}
    </div>
  );
}

function EditSessionModal({
  session,
  mysteryId,
  onClose,
  onSave,
}: {
  session: Session;
  mysteryId: string;
  onClose: () => void;
  onSave: (s: Session) => void;
}) {
  const [form, setForm] = useState({
    sessionNumber: session.sessionNumber,
    date: session.date,
    summary: session.summary,
  });
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        sessionNumber: Number(form.sessionNumber),
        date: form.date,
        summary: form.summary,
      };

      if (transcriptFile) {
        updates.transcript = await transcriptFile.text();
        updates.transcriptName = transcriptFile.name;
      }

      await updateDoc(
        doc(db, "mysteries", mysteryId, "sessions", session.id),
        updates
      );
      onSave({
        ...session,
        ...updates,
      } as Session);
    } catch (err) {
      console.error("Failed to update session:", err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Edit Session</h3>
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
            <label className="block text-xs text-muted mb-1">Summary / Recap</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              rows={6}
              placeholder="Session recap (supports markdown)"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">
              Replace Transcript (.md file)
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-background border border-border rounded px-3 py-2 text-sm hover:border-border-light transition-colors">
              <Upload className="w-4 h-4 text-muted" />
              <span className="text-muted">
                {transcriptFile?.name || session.transcriptName || "Choose file..."}
              </span>
              <input
                type="file"
                accept=".md,.markdown,.txt"
                onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {session.transcript && !transcriptFile && (
              <p className="text-xs text-muted mt-1">Current transcript will be kept unless replaced.</p>
            )}
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
