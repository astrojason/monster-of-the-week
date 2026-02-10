"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import type { Mystery, Session } from "@/lib/types";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Calendar, FileText, Loader2 } from "lucide-react";

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
        <div className="flex items-center gap-2 text-xs text-muted mb-1">
          <span>{mystery.title}</span>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {session.date}
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-2">
          Session {session.sessionNumber}
        </h1>
        {session.summary && (
          <div className="bg-surface border border-border rounded-lg p-4 mb-4">
            <h3 className="text-xs text-muted uppercase tracking-wide mb-1">
              Summary
            </h3>
            <p className="text-sm">{session.summary}</p>
          </div>
        )}
      </div>

      {session.transcript ? (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-accent" />
            <h2 className="font-semibold">Transcript</h2>
            {session.transcriptName && (
              <span className="text-xs text-muted">
                ({session.transcriptName})
              </span>
            )}
          </div>
          <div className="bg-surface border border-border rounded-lg p-6 prose-dark">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
  );
}
