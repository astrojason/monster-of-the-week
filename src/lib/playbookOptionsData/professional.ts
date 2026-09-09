import type { PlaybookOptionSection } from "../playbookOptions";

export const professional: PlaybookOptionSection[] = [
  {
    key: "agency",
    label: "Agency",
    description: "Decide who you work for and what their goal is, then pick two resource tags and two red tape tags.",
    kind: "fields",
    fields: [
      {
        key: "who",
        label: "Who do you work for? (black-budget government department, secret military unit, clandestine police team, a private individual's crusade, a corporation, a scientific team, or...)",
        kind: "text",
      },
      {
        key: "goal",
        label: "Is the Agency's goal to...",
        kind: "select",
        allowCustom: true,
        choices: ["Destroy monsters", "Study the supernatural", "Protect people", "Gain power"],
      },
      {
        key: "resources",
        label: "Resource tags",
        kind: "multiselect",
        pick: 2,
        choices: [
          "Well-armed",
          "Well-financed",
          "Rigorous training",
          "Official pull",
          "Cover identities",
          "Offices all over",
          "Good intel",
          "Recognised authority",
          "Weird tech gadgets",
          "Support teams",
        ],
      },
      {
        key: "red-tape",
        label: "Red Tape tags",
        kind: "multiselect",
        pick: 2,
        choices: [
          "Dubious motives",
          "Bureaucratic",
          "Secretive hierarchy",
          "Cryptic missions",
          "Hostile superiors",
          "Inter-departmental rivalry",
          "Budget cuts",
          "Take no prisoners policy",
          "Live capture policy",
        ],
      },
    ],
  },
];
