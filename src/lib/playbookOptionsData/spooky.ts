import type { PlaybookOptionSection } from "../playbookOptions";

export const spooky: PlaybookOptionSection[] = [
  {
    key: "dark-side",
    label: "The Dark Side",
    description: "Pick three tags for your dark side.",
    kind: "fields",
    fields: [
      {
        key: "tags",
        label: "Dark side tags",
        kind: "multiselect",
        pick: 3,
        choices: [
          "Violence",
          "Depression",
          "Secrets",
          "Lust",
          "Dark bargain",
          "Guilt",
          "Soulless",
          "Addiction",
          "Mood swings",
          "Rage",
          "Self-destruction",
          "Greed for power",
          "Poor impulse control",
          "Hallucinations",
          "Pain",
          "Paranoia",
        ],
      },
    ],
  },
];
