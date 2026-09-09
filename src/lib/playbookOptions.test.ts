import { describe, it, expect } from "vitest";
import { summarizePlaybookOptions, summarizeSectionValues } from "./playbookOptions";
import type { PlaybookOptionFieldsSection, PlaybookOptionRepeatableSection } from "./playbookOptions";

const fateSection: PlaybookOptionFieldsSection = {
  key: "fate",
  label: "Fate",
  kind: "fields",
  fields: [
    { key: "found-out", label: "How You Found Out", kind: "select", choices: ["Trained from birth"] },
    { key: "heroic", label: "Heroic tags", kind: "multiselect", pick: 2, choices: ["Sacrifice", "Visions"] },
  ],
};

const crewSection: PlaybookOptionRepeatableSection = {
  key: "crew",
  label: "Crew",
  kind: "repeatable",
  itemLabel: "Crew member",
  min: 0,
  max: 3,
  fields: [
    { key: "name", label: "Name", kind: "text" },
    { key: "job", label: "Job", kind: "select", choices: ["Fixer", "Wheelman"] },
  ],
};

describe("summarizeSectionValues", () => {
  it("returns nothing for a fields section with no values", () => {
    expect(summarizeSectionValues(fateSection, undefined)).toEqual([]);
    expect(summarizeSectionValues(fateSection, {})).toEqual([]);
  });

  it("joins picked fields into one readable line for a fields section", () => {
    expect(
      summarizeSectionValues(fateSection, {
        "found-out": ["Trained from birth"],
        heroic: ["Sacrifice", "Visions"],
      })
    ).toEqual(["Fate: How You Found Out: Trained from birth | Heroic tags: Sacrifice, Visions"]);
  });

  it("skips fields with empty picks", () => {
    expect(summarizeSectionValues(fateSection, { "found-out": ["Trained from birth"], heroic: [] })).toEqual([
      "Fate: How You Found Out: Trained from birth",
    ]);
  });

  it("summarizes each entry of a repeatable section on its own line", () => {
    expect(
      summarizeSectionValues(crewSection, [
        { name: ["Sal"], job: ["Fixer"] },
        { name: ["Reg"], job: [] },
      ])
    ).toEqual(["Crew member 1 — Name: Sal; Job: Fixer", "Crew member 2 — Name: Reg"]);
  });

  it("drops repeatable entries that ended up entirely empty", () => {
    expect(summarizeSectionValues(crewSection, [{ name: [], job: [] }])).toEqual([]);
  });
});

describe("summarizePlaybookOptions", () => {
  it("summarizes every section in schema order, skipping empty ones", () => {
    const result = summarizePlaybookOptions([fateSection, crewSection], {
      fate: { "found-out": ["Trained from birth"], heroic: [] },
      crew: [{ name: ["Sal"], job: ["Fixer"] }],
    });
    expect(result).toEqual(["Fate: How You Found Out: Trained from birth", "Crew member 1 — Name: Sal; Job: Fixer"]);
  });

  it("returns an empty array when there are no stored values", () => {
    expect(summarizePlaybookOptions([fateSection], undefined)).toEqual([]);
  });
});
