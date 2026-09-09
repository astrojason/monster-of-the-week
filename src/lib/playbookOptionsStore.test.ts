import { describe, it, expect, vi, beforeEach } from "vitest";

const getDocsMock = vi.fn();
const setDocMock = vi.fn();
const deleteDocMock = vi.fn();

vi.mock("./firebase", () => ({ db: {} }));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db, ...segments) => segments.join("/")),
  doc: vi.fn((_db, ...segments) => segments.join("/")),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
  setDoc: (...args: unknown[]) => setDocMock(...args),
  deleteDoc: (...args: unknown[]) => deleteDocMock(...args),
}));

import {
  getDefaultSections,
  getEffectiveSections,
  loadPlaybookOptionOverrides,
  savePlaybookOptionOverride,
  resetPlaybookOptionOverride,
} from "./playbookOptionsStore";

describe("getDefaultSections", () => {
  it("returns the built-in sections for a playbook that has them", () => {
    const sections = getDefaultSections("Chosen");
    expect(sections.map((s) => s.key)).toContain("fate");
  });

  it("returns an empty array for an unknown playbook name", () => {
    expect(getDefaultSections("Not A Real Playbook")).toEqual([]);
  });
});

describe("getEffectiveSections", () => {
  it("falls back to the default when there is no override", () => {
    const sections = getEffectiveSections("Chosen", {});
    expect(sections.map((s) => s.key)).toContain("fate");
  });

  it("prefers an override keyed by the playbook's slug", () => {
    const overrideSections = [{ key: "custom", label: "Custom", kind: "fields" as const, fields: [] }];
    const sections = getEffectiveSections("Chosen", { chosen: overrideSections });
    expect(sections).toBe(overrideSections);
  });
});

describe("loadPlaybookOptionOverrides", () => {
  beforeEach(() => {
    getDocsMock.mockReset();
  });

  it("builds a map of playbook slug -> sections from override docs", async () => {
    getDocsMock.mockResolvedValue({
      docs: [
        { id: "chosen", data: () => ({ sections: [{ key: "custom", label: "Custom", kind: "fields", fields: [] }] }) },
        { id: "malformed", data: () => ({ notSections: true }) },
      ],
    });
    const overrides = await loadPlaybookOptionOverrides();
    expect(Object.keys(overrides)).toEqual(["chosen"]);
    expect(overrides.chosen[0].key).toBe("custom");
  });
});

describe("savePlaybookOptionOverride / resetPlaybookOptionOverride", () => {
  beforeEach(() => {
    setDocMock.mockReset();
    deleteDocMock.mockReset();
    setDocMock.mockResolvedValue(undefined);
    deleteDocMock.mockResolvedValue(undefined);
  });

  it("saves an override under the playbook's slug", async () => {
    const sections = [{ key: "custom", label: "Custom", kind: "fields" as const, fields: [] }];
    await savePlaybookOptionOverride("Spell-slinger", sections);
    expect(setDocMock).toHaveBeenCalledWith("playbookOptionOverrides/spell-slinger", { sections });
  });

  it("deletes the override doc for a playbook", async () => {
    await resetPlaybookOptionOverride("Spell-slinger");
    expect(deleteDocMock).toHaveBeenCalledWith("playbookOptionOverrides/spell-slinger");
  });
});
