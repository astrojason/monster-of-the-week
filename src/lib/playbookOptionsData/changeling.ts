import type { PlaybookOptionSection } from "../playbookOptions";

export const changeling: PlaybookOptionSection[] = [
  {
    key: "unknown-heritage",
    label: "Unknown Heritage",
    description: "Your non-human heritage has pitfalls you were never taught about. Pick three.",
    kind: "fields",
    fields: [
      {
        key: "tags",
        label: "Heritage tags",
        kind: "multiselect",
        pick: 3,
        allowCustom: true,
        choices: [
          "Dietary restriction",
          "Hygienic need",
          "Unearned reputation",
          "Erratic power",
          "Strange thoughts",
          "Sensory bombardment",
          "Allergy to ___",
          "Repulsion from ___",
          "Attraction to ___",
          "Obsession with ___",
        ],
      },
    ],
  },
];
