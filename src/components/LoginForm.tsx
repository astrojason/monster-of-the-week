"use client";

import { useAuth } from "@/lib/auth";
import { Skull, LogIn, LogOut, Loader2 } from "lucide-react";

function ErrorBlock({ error }: { error: string }) {
  if (!error) return null;
  return (
    <pre className="text-danger text-xs bg-surface border border-border rounded p-3 mt-4 text-left whitespace-pre-wrap break-words select-all">
      {error}
    </pre>
  );
}

export function LoginForm() {
  const { status, user, error, signIn, logout } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-sm text-center">
          <Skull className="w-16 h-16 mx-auto mb-4 text-accent" />
          <h1 className="text-xl font-bold mb-2">Access Pending</h1>
          <p className="text-muted text-sm mb-1">
            Signed in as {user?.email}
          </p>
          <p className="text-muted text-sm mb-6">
            Your account doesn&apos;t have access yet. Ask the Keeper to grant you access.
          </p>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 border border-border hover:bg-surface-hover rounded-md py-2 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
          <ErrorBlock error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm text-center">
        <Skull className="w-16 h-16 mx-auto mb-4 text-accent" />
        <h1 className="text-3xl font-bold mb-2">Monster of the Week</h1>
        <p className="text-muted text-sm mb-8">Campaign Tracker</p>
        <button
          onClick={() => signIn()}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 text-sm font-medium transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign in with Google
        </button>
        <ErrorBlock error={error} />
      </div>
    </div>
  );
}
