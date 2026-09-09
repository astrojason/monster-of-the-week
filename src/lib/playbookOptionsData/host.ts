import type { PlaybookOptionSection } from "../playbookOptions";

export const host: PlaybookOptionSection[] = [
  {
    key: "symbiosis",
    label: "Symbiosis",
    description: "Choose the Benefits and Downside of your symbiosis.",
    kind: "fields",
    fields: [
      {
        key: "benefits",
        label: "Benefits (pick two)",
        kind: "multiselect",
        pick: 2,
        choices: [
          "Aligned motivations",
          "Unaging",
          "Can survive vacuum, pressure, and lack of air",
          "Immune to radiation",
          "Disease, drug, and poison resistance",
          "Subtle physical improvements",
          "Can't be possessed",
          "Can climb walls",
          "Efficient metabolism",
          "Non-physical symbiote",
        ],
      },
      {
        key: "downside",
        label: "Downsides (pick one)",
        kind: "select",
        choices: [
          "Limited communication",
          "Body timeshare",
          "Biological needs",
          "Personality conflicts",
          "Obvious mutations",
          "Distracting chatter",
          "Magical aura",
        ],
      },
    ],
  },
];
