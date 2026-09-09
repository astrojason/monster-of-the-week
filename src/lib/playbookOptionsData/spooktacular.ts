import type { PlaybookOptionSection } from "../playbookOptions";

export const spooktacular: PlaybookOptionSection[] = [
  {
    key: "the-show",
    label: "The Show",
    description:
      "You spent a long time with a traveling show and get an ability based on its style. Pick your show's specialty.",
    kind: "fields",
    fields: [
      {
        key: "specialty",
        label: "Show's specialty",
        kind: "select",
        choices: [
          "An Infernal Power",
          "Magic & Illusions",
          "Making Money",
          "Problem Solvers",
          "Supernatural Creatures",
        ],
      },
      {
        key: "infernal-sin",
        label: "If An Infernal Power: what sin have you already committed?",
        kind: "text",
        placeholder: "The Big Bad may restore your Infernal Favour once you do something unforgivably terrible",
      },
      {
        key: "infernal-favour",
        label: "Infernal Favour (only if An Infernal Power)",
        kind: "number",
        max: 3,
      },
    ],
  },
];
