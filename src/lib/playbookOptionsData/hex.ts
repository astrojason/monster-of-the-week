import type { PlaybookOptionSection } from "../playbookOptions";

export const hex: PlaybookOptionSection[] = [
  {
    key: "temptation",
    label: "Temptation",
    description:
      "You have a dangerous drive that you pursue, sometimes to the exclusion of your own safety.",
    kind: "fields",
    fields: [
      {
        key: "temptation",
        label: "Choose one Temptation",
        kind: "select",
        choices: [
          "Vengeance: Use magic to inflict disproportionate retribution on someone who wronged you.",
          "Power: Use magic to exert your dominance over another.",
          "Addiction: Use magic to do what you could do without it.",
          "Callousness: Use magic without regard for the safety of others.",
          "Carnage: Use magic to inflict gruesome violence.",
          "Secrets: Use magic to discover forbidden, dangerous knowledge.",
          "Glory: Use magic to steal someone's thunder.",
        ],
      },
    ],
  },
  {
    key: "rotes",
    label: "Rotes",
    description:
      "You start out knowing up to one rote, which you can choose when creating your character or during play. Each rote is a custom spell built with the Keeper.",
    kind: "repeatable",
    itemLabel: "Rote",
    min: 0,
    max: 8,
    fields: [
      {
        key: "name",
        label: "Rote name",
        kind: "text",
        placeholder: "e.g. Whispering Ward",
      },
      {
        key: "requirements",
        label: "Requirements (pick two)",
        kind: "multiselect",
        pick: 2,
        choices: [
          "Magic words, ritual gestures",
          "Object of power which must be wielded",
          "Expendable component destroyed or scattered",
          "Runes or symbols written or engraved on a surface",
          "Spilling of blood (1-harm to you or willing person)",
        ],
      },
      {
        key: "effect-10",
        label: "Effect on a 10+",
        kind: "text",
      },
      {
        key: "effect-7-9",
        label: "Effect on a 7-9",
        kind: "text",
      },
      {
        key: "effect-miss",
        label: "Effect on a miss",
        kind: "text",
      },
    ],
  },
];
