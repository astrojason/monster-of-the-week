import type { Playbook } from "./playbooks";

export type PlaybookOptionFieldKind = "select" | "multiselect" | "text" | "number";

export interface PlaybookOptionField {
  /** stable, unique within the section (and within a repeatable group's fields) */
  key: string;
  label: string;
  kind: PlaybookOptionFieldKind;
  /** required for "select" and "multiselect" */
  choices?: string[];
  /** for "multiselect": how many the player should choose */
  pick?: number;
  /** adds a "Write in..." choice that reveals a free-text input */
  allowCustom?: boolean;
  /** for "text" / "number" */
  placeholder?: string;
  /** for "number" (e.g. a 0-7 tracker) */
  max?: number;
}

interface PlaybookOptionSectionBase {
  /** stable, unique within the playbook */
  key: string;
  label: string;
  description?: string;
}

export interface PlaybookOptionFieldsSection extends PlaybookOptionSectionBase {
  kind: "fields";
  fields: PlaybookOptionField[];
}

export interface PlaybookOptionRepeatableSection extends PlaybookOptionSectionBase {
  kind: "repeatable";
  itemLabel: string;
  min: number;
  max: number;
  fields: PlaybookOptionField[];
}

export type PlaybookOptionSection = PlaybookOptionFieldsSection | PlaybookOptionRepeatableSection;

export type PlaybookOptionsSchema = Partial<Record<Playbook, PlaybookOptionSection[]>>;

/** Value of one "fields" section: fieldKey -> selected choice(s)/text, as strings. */
export type SectionValues = Record<string, string[]>;

/** Value of one "repeatable" section: one SectionValues per repeated entry. */
export type RepeatableSectionValues = SectionValues[];

/** Full structured picks for a hunter: sectionKey -> its values. */
export type PlaybookOptionValues = Record<string, SectionValues | RepeatableSectionValues>;

function summarizeFields(fields: PlaybookOptionField[], values: SectionValues): string[] {
  return fields
    .map((f) => {
      const v = values[f.key];
      return v && v.length > 0 ? `${f.label}: ${v.join(", ")}` : null;
    })
    .filter((s): s is string => s !== null);
}

/** Produces human-readable summary line(s) for one section's stored values, using its current (possibly overridden) schema. */
export function summarizeSectionValues(
  section: PlaybookOptionSection,
  values: SectionValues | RepeatableSectionValues | undefined
): string[] {
  if (!values) return [];
  if (section.kind === "repeatable") {
    const entries = values as RepeatableSectionValues;
    return entries
      .map((entry, i) => {
        const parts = summarizeFields(section.fields, entry);
        return parts.length > 0 ? `${section.itemLabel} ${i + 1} — ${parts.join("; ")}` : null;
      })
      .filter((s): s is string => s !== null);
  }
  const parts = summarizeFields(section.fields, values as SectionValues);
  return parts.length > 0 ? [`${section.label}: ${parts.join(" | ")}`] : [];
}

/** Produces one human-readable summary per non-empty section, in schema order. */
export function summarizePlaybookOptions(
  sections: PlaybookOptionSection[],
  values: PlaybookOptionValues | undefined
): string[] {
  if (!values) return [];
  return sections.flatMap((s) => summarizeSectionValues(s, values[s.key]));
}
