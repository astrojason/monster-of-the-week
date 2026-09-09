import type { PlaybookOptionSection } from "../playbookOptions";

export const searcher: PlaybookOptionSection[] = [
  {
    key: "first-encounter",
    label: "First Encounter",
    description:
      "One strange event started you down this path. Decide what that event was: pick a category below and take the associated move.",
    kind: "fields",
    fields: [
      {
        key: "category",
        label: "Category",
        kind: "select",
        choices: [
          "Cryptid Sighting",
          "Zone of Strangeness",
          "Psychic Event",
          "Higher power",
          "Strange Dangers",
          "Abduction",
          "Cosmic Insight",
        ],
      },
    ],
  },
];
