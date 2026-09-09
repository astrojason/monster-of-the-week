import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { PLAYBOOKS, PLAYBOOK_LIST, playbookSlug } from "./playbooks";

const PLAYBOOKS_DIR = path.resolve(__dirname, "../../data/playbooks");

describe("PLAYBOOKS", () => {
  it("has one entry for every playbook file in data/playbooks", () => {
    const files = fs
      .readdirSync(PLAYBOOKS_DIR)
      .filter((f) => f.endsWith(".pdf"))
      .map((f) => f.replace(/\.pdf$/, ""))
      .sort();

    const slugs = PLAYBOOKS.map(playbookSlug).sort();

    expect(slugs).toEqual(files);
  });

  it("has no duplicate playbook names", () => {
    expect(new Set(PLAYBOOKS).size).toBe(PLAYBOOKS.length);
  });

  it("is alphabetized, so the hunter playbook select lists it in order", () => {
    expect(PLAYBOOK_LIST).toEqual([...PLAYBOOK_LIST].sort());
  });
});
