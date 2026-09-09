"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type {
  PlaybookOptionField,
  PlaybookOptionSection,
  PlaybookOptionValues,
  SectionValues,
} from "@/lib/playbookOptions";

const CUSTOM_CHOICE = "Write in...";

interface PlaybookOptionsFieldsProps {
  sections: PlaybookOptionSection[];
  values: PlaybookOptionValues;
  onChange: (values: PlaybookOptionValues) => void;
}

export function PlaybookOptionsFields({ sections, values, onChange }: PlaybookOptionsFieldsProps) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-4">
      {sections.map((section) =>
        section.kind === "repeatable" ? (
          <RepeatableSection
            key={section.key}
            section={section}
            entries={(values[section.key] as SectionValues[]) || []}
            onChange={(entries) => onChange({ ...values, [section.key]: entries })}
          />
        ) : (
          <FieldsSection
            key={section.key}
            section={section}
            values={(values[section.key] as SectionValues) || {}}
            onChange={(sectionValues) => onChange({ ...values, [section.key]: sectionValues })}
          />
        )
      )}
    </div>
  );
}

function FieldsSection({
  section,
  values,
  onChange,
}: {
  section: Extract<PlaybookOptionSection, { kind: "fields" }>;
  values: SectionValues;
  onChange: (values: SectionValues) => void;
}) {
  return (
    <fieldset className="border border-border rounded-lg p-3">
      <legend className="text-sm font-medium px-1">{section.label}</legend>
      {section.description && <p className="text-xs text-muted mb-2">{section.description}</p>}
      <div className="space-y-3">
        {section.fields.map((field) => (
          <Field
            key={field.key}
            field={field}
            value={values[field.key] || []}
            onChange={(v) => onChange({ ...values, [field.key]: v })}
          />
        ))}
      </div>
    </fieldset>
  );
}

function RepeatableSection({
  section,
  entries,
  onChange,
}: {
  section: Extract<PlaybookOptionSection, { kind: "repeatable" }>;
  entries: SectionValues[];
  onChange: (entries: SectionValues[]) => void;
}) {
  return (
    <fieldset className="border border-border rounded-lg p-3">
      <legend className="text-sm font-medium px-1">{section.label}</legend>
      {section.description && <p className="text-xs text-muted mb-2">{section.description}</p>}
      <div className="space-y-3">
        {entries.map((entry, i) => (
          <div key={i} className="border border-border rounded p-2 relative">
            <button
              type="button"
              onClick={() => onChange(entries.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 text-muted hover:text-danger p-1"
              aria-label={`Remove ${section.itemLabel} ${i + 1}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="text-xs text-muted mb-2">
              {section.itemLabel} {i + 1}
            </p>
            <div className="space-y-3 pr-6">
              {section.fields.map((field) => (
                <Field
                  key={field.key}
                  field={field}
                  value={entry[field.key] || []}
                  onChange={(v) =>
                    onChange(entries.map((e, idx) => (idx === i ? { ...e, [field.key]: v } : e)))
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...entries, {}])}
        disabled={entries.length >= section.max}
        className="mt-2 flex items-center gap-1 text-xs text-accent hover:text-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-3.5 h-3.5" />
        Add {section.itemLabel}
      </button>
    </fieldset>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: PlaybookOptionField;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const fieldId = `pbfield-${field.key}`;
  const [customMode, setCustomMode] = useState(false);

  if (field.kind === "text") {
    return (
      <div>
        <label htmlFor={fieldId} className="block text-xs text-muted mb-1">
          {field.label}
        </label>
        <textarea
          id={fieldId}
          value={value[0] || ""}
          onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
          placeholder={field.placeholder}
          rows={2}
          className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />
      </div>
    );
  }

  if (field.kind === "number") {
    return (
      <div>
        <label htmlFor={fieldId} className="block text-xs text-muted mb-1">
          {field.label}
        </label>
        <input
          id={fieldId}
          type="number"
          min={0}
          max={field.max}
          value={value[0] || ""}
          onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
          className="w-24 bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />
      </div>
    );
  }

  if (field.kind === "select") {
    const current = value[0] || "";
    const isCustom =
      customMode || (field.allowCustom && current !== "" && !(field.choices || []).includes(current));
    const selectValue = isCustom ? CUSTOM_CHOICE : current;
    return (
      <div>
        <label htmlFor={fieldId} className="block text-xs text-muted mb-1">
          {field.label}
        </label>
        <select
          id={fieldId}
          value={selectValue}
          onChange={(e) => {
            if (e.target.value === CUSTOM_CHOICE) {
              setCustomMode(true);
              onChange([]);
            } else {
              setCustomMode(false);
              onChange(e.target.value ? [e.target.value] : []);
            }
          }}
          className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="">Choose...</option>
          {(field.choices || []).map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
          {field.allowCustom && <option value={CUSTOM_CHOICE}>{CUSTOM_CHOICE}</option>}
        </select>
        {isCustom && (
          <input
            type="text"
            value={current}
            onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
            placeholder={`Write in ${field.label.toLowerCase()}`}
            autoFocus
            className="mt-1 w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        )}
      </div>
    );
  }

  // multiselect
  const atLimit = field.pick != null && value.length >= field.pick;
  return (
    <div>
      <p className="text-xs text-muted mb-1">
        {field.label}
        {field.pick != null && ` (${value.length}/${field.pick})`}
      </p>
      <div className="space-y-1">
        {(field.choices || []).map((choice) => {
          const checked = value.includes(choice);
          return (
            <label key={choice} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && atLimit}
                onChange={(e) =>
                  onChange(e.target.checked ? [...value, choice] : value.filter((v) => v !== choice))
                }
                className="mt-0.5"
              />
              <span>{choice}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
