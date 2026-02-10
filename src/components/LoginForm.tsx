"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Skull, KeyRound } from "lucide-react";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(password);
    if (!success) {
      setError("Invalid password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Skull className="w-16 h-16 mx-auto mb-4 text-accent" />
          <h1 className="text-3xl font-bold mb-2">Monster of the Week</h1>
          <p className="text-muted text-sm">Campaign Tracker</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Enter Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent"
                placeholder="Player or Keeper password"
                autoFocus
              />
            </div>
          </div>
          {error && (
            <p className="text-danger text-xs mb-3">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2 text-sm font-medium transition-colors"
          >
            Enter
          </button>
          <p className="text-muted text-xs mt-3 text-center">
            Player password for limited access, Keeper password for full control
          </p>
        </form>
      </div>
    </div>
  );
}
