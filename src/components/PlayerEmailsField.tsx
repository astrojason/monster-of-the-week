"use client";

import { useState } from "react";
import type { Grant } from "@/lib/types";
import { X } from "lucide-react";

interface PlayerEmailsFieldProps {
  emails: string[];
  onChange: (emails: string[]) => void;
  playerGrants: Grant[];
  grantsError?: string;
}

export function PlayerEmailsField({ emails, onChange, playerGrants, grantsError }: PlayerEmailsFieldProps) {
  const [input, setInput] = useState("");

  const addEmail = (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (!email || emails.includes(email)) return;
    onChange([...emails, email]);
    setInput("");
  };

  const removeEmail = (email: string) => {
    onChange(emails.filter((e) => e !== email));
  };

  const suggestions = playerGrants.filter((g) => !emails.includes(g.email));

  const labelFor = (email: string) => playerGrants.find((g) => g.email === email)?.name || email;

  return (
    <fieldset>
      <legend className="block text-xs text-muted mb-1">Played By (accounts)</legend>

      {emails.length > 0 && (
        <ul className="space-y-1 mb-2">
          {emails.map((email) => (
            <li
              key={email}
              className="flex items-center justify-between bg-background border border-border rounded px-2 py-1 text-sm"
            >
              <span>{labelFor(email)}</span>
              <button
                type="button"
                onClick={() => removeEmail(email)}
                aria-label={`Remove ${email}`}
                className="text-muted hover:text-danger"
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addEmail(input);
            }
          }}
          aria-label="Add player email"
          placeholder="player@example.com"
          className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => addEmail(input)}
          className="border border-border rounded px-3 py-2 text-sm hover:bg-surface-hover transition-colors"
        >
          Add
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {suggestions.map((g) => (
            <button
              type="button"
              key={g.email}
              onClick={() => addEmail(g.email)}
              className="text-xs bg-background border border-border rounded-full px-2 py-0.5 hover:border-accent transition-colors"
            >
              {g.name || g.email}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted mt-1">
        Links this hunter to one or more player accounts so only they (and the Keeper) can edit it.
        You can type any email, even before granting them access.
      </p>
      {grantsError && (
        <pre className="text-danger text-xs bg-surface border border-border rounded p-2 mt-1 whitespace-pre-wrap break-words select-all">
          {grantsError}
        </pre>
      )}
    </fieldset>
  );
}
