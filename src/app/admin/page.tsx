"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import type { Grant } from "@/lib/types";
import { PLAYBOOK_LIST, playbookSlug } from "@/lib/playbooks";
import type { PlaybookOptionSection } from "@/lib/playbookOptions";
import {
  getDefaultSections,
  getEffectiveSections,
  loadPlaybookOptionOverrides,
  resetPlaybookOptionOverride,
  savePlaybookOptionOverride,
  type PlaybookOptionOverrides,
} from "@/lib/playbookOptionsStore";
import { Loader2, Pencil, Plus, Save, Shield, Trash2, User, Users, X } from "lucide-react";

export default function AdminPage() {
  const { status, role, user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newRole, setNewRole] = useState<"player" | "keeper">("player");
  const [saving, setSaving] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [optionOverrides, setOptionOverrides] = useState<PlaybookOptionOverrides>({});
  const [selectedPlaybook, setSelectedPlaybook] = useState(PLAYBOOK_LIST[0]);
  const [sectionsJson, setSectionsJson] = useState("");
  const [optionsError, setOptionsError] = useState("");
  const [savingSections, setSavingSections] = useState(false);

  useEffect(() => {
    if (status !== "authorized" || role !== "keeper") return;
    loadGrants();
    loadPlaybookOptionOverrides()
      .then(setOptionOverrides)
      .catch((err) => setOptionsError(err instanceof Error ? err.message : String(err)));
  }, [status, role]);

  const effectiveSections = useMemo(
    () => getEffectiveSections(selectedPlaybook, optionOverrides),
    [selectedPlaybook, optionOverrides]
  );

  useEffect(() => {
    setSectionsJson(JSON.stringify(effectiveSections, null, 2));
  }, [effectiveSections]);

  const isOverridden = !!optionOverrides[playbookSlug(selectedPlaybook)];

  const saveSections = async () => {
    setOptionsError("");
    let parsed: PlaybookOptionSection[];
    try {
      parsed = JSON.parse(sectionsJson);
    } catch (err) {
      setOptionsError(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    setSavingSections(true);
    try {
      await savePlaybookOptionOverride(selectedPlaybook, parsed);
      setOptionOverrides((prev) => ({
        ...prev,
        [playbookSlug(selectedPlaybook)]: parsed,
      }));
    } catch (err) {
      setOptionsError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingSections(false);
    }
  };

  const resetSections = async () => {
    setOptionsError("");
    setSavingSections(true);
    try {
      await resetPlaybookOptionOverride(selectedPlaybook);
      setOptionOverrides((prev) => {
        const next = { ...prev };
        delete next[playbookSlug(selectedPlaybook)];
        return next;
      });
      setSectionsJson(JSON.stringify(getDefaultSections(selectedPlaybook), null, 2));
    } catch (err) {
      setOptionsError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingSections(false);
    }
  };

  const loadGrants = async () => {
    setError("");
    try {
      const q = query(collection(db, "grants"), orderBy("email"));
      const snap = await getDocs(q);
      setGrants(snap.docs.map((d) => d.data() as Grant));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const addGrant = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setSaving(true);
    setError("");
    try {
      const trimmedName = name.trim();
      const grant: Grant = {
        email: normalizedEmail,
        role: newRole,
        addedAt: Date.now(),
        addedBy: user?.email ?? "",
        name: trimmedName,
        nameSetByKeeper: !!trimmedName,
      };
      await setDoc(doc(db, "grants", normalizedEmail), grant);
      setGrants((prev) => [...prev.filter((g) => g.email !== normalizedEmail), grant].sort((a, b) => a.email.localeCompare(b.email)));
      setEmail("");
      setName("");
      setNewRole("player");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const removeGrant = async (grantEmail: string) => {
    setError("");
    try {
      await deleteDoc(doc(db, "grants", grantEmail));
      setGrants((prev) => prev.filter((g) => g.email !== grantEmail));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const startEditingName = (grant: Grant) => {
    setEditingEmail(grant.email);
    setNameDraft(grant.name || "");
  };

  const saveGrantName = async (grantEmail: string) => {
    const trimmedName = nameDraft.trim();
    setSavingName(true);
    setError("");
    try {
      const update = { name: trimmedName, nameSetByKeeper: !!trimmedName };
      await updateDoc(doc(db, "grants", grantEmail), update);
      setGrants((prev) => prev.map((g) => (g.email === grantEmail ? { ...g, ...update } : g)));
      setEditingEmail(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingName(false);
    }
  };

  if (status !== "authorized") return <LoginForm />;

  if (role !== "keeper") {
    return (
      <div className="text-center py-20 text-muted">
        <p>Only the Keeper can manage access.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-accent" />
        <h1 className="text-2xl font-bold">Access</h1>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium mb-3">Grant access</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="grant-email" className="block text-xs text-muted mb-1">
              Email
            </label>
            <input
              id="grant-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="player@example.com"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="grant-name" className="block text-xs text-muted mb-1">
              Name (optional)
            </label>
            <input
              id="grant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="Steve Smith"
            />
          </div>
          <div>
            <label htmlFor="grant-role" className="block text-xs text-muted mb-1">
              Role
            </label>
            <select
              id="grant-role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "player" | "keeper")}
              className="bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="player">Player</option>
              <option value="keeper">Keeper</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={addGrant}
              disabled={saving || !email.trim()}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </button>
          </div>
        </div>
      </div>

      {error && (
        <pre className="text-danger text-xs bg-surface border border-border rounded p-3 mb-6 whitespace-pre-wrap break-words select-all">
          {error}
        </pre>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : grants.length === 0 ? (
        <p className="text-center text-muted py-12">No grants yet.</p>
      ) : (
        <div className="space-y-2">
          {grants.map((grant) => (
            <div
              key={grant.email}
              className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3"
            >
              {editingEmail === grant.email ? (
                <div className="flex items-center gap-2 flex-1">
                  <label htmlFor={`edit-name-${grant.email}`} className="sr-only">
                    Edit name
                  </label>
                  <input
                    id={`edit-name-${grant.email}`}
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                    placeholder={grant.email}
                    autoFocus
                  />
                  <button
                    onClick={() => saveGrantName(grant.email)}
                    disabled={savingName}
                    className="flex items-center gap-1 text-xs bg-accent hover:bg-accent-hover text-white px-2 py-1 rounded disabled:opacity-50"
                  >
                    {savingName ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </button>
                  <button
                    onClick={() => setEditingEmail(null)}
                    className="text-muted hover:text-foreground p-1"
                    aria-label="Cancel editing name"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    {grant.role === "keeper" ? (
                      <Shield className="w-4 h-4 text-accent" />
                    ) : (
                      <User className="w-4 h-4 text-success" />
                    )}
                    <span>{grant.name || grant.email}</span>
                    <span className="text-xs text-muted uppercase">{grant.role}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditingName(grant)}
                      className="text-muted hover:text-foreground transition-colors p-1"
                      aria-label={`Edit name for ${grant.email}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeGrant(grant.email)}
                      className="text-muted hover:text-danger transition-colors p-1"
                      title="Remove access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-10 mb-6">
        <Pencil className="w-5 h-5 text-accent" />
        <h1 className="text-2xl font-bold">Playbook Options</h1>
      </div>
      <p className="text-sm text-muted mb-3">
        Each playbook&apos;s character-creation options are transcribed from its rulebook PDF and may contain
        mistakes. Pick a playbook to review or correct its sections here; saving creates an override that takes
        precedence over the built-in default everywhere in the app.
      </p>

      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex-1">
            <label htmlFor="options-playbook" className="block text-xs text-muted mb-1">
              Playbook
            </label>
            <select
              id="options-playbook"
              value={selectedPlaybook}
              onChange={(e) => setSelectedPlaybook(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {PLAYBOOK_LIST.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {isOverridden && (
            <span className="text-xs text-accent border border-accent rounded px-2 py-1 whitespace-nowrap">
              Overridden
            </span>
          )}
        </div>

        <label htmlFor="options-sections-json" className="block text-xs text-muted mb-1">
          Sections JSON
        </label>
        <textarea
          id="options-sections-json"
          value={sectionsJson}
          onChange={(e) => setSectionsJson(e.target.value)}
          className="w-full bg-background border border-border rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
          rows={16}
          spellCheck={false}
        />

        {optionsError && (
          <pre className="text-danger text-xs bg-surface border border-border rounded p-3 mt-2 whitespace-pre-wrap break-words select-all">
            {optionsError}
          </pre>
        )}

        <div className="flex gap-3 mt-3">
          <button
            onClick={saveSections}
            disabled={savingSections}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {savingSections ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Sections
          </button>
          <button
            onClick={resetSections}
            disabled={savingSections || !isOverridden}
            className="flex items-center gap-2 border border-border text-sm px-4 py-2 rounded-md hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}
