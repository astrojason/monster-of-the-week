import type { PlaybookOptionSection } from "../playbookOptions";

export const curseEater: PlaybookOptionSection[] = [
  {
    key: "how-it-works",
    label: "How Consuming Magic Works",
    description: "When you consume/absorb evil magic, how does it work?",
    kind: "fields",
    fields: [
      {
        key: "method",
        label: "Method",
        kind: "select",
        allowCustom: true,
        choices: [
          "You lay your hands on it and a visible glowing smoke transports the curse",
          "You ritually eat some part of it",
          "You closely embrace the cursed thing and spend several minutes bonding with it",
          "You have an amulet that you must hold against it",
        ],
      },
    ],
  },
  {
    key: "corruption",
    label: "Corruption",
    description: "Okay 0-7, Lost. Gained when you consume evil magic.",
    kind: "fields",
    fields: [
      {
        key: "level",
        label: "Corruption marked",
        kind: "number",
        max: 7,
        placeholder: "0",
      },
    ],
  },
  {
    key: "consumed-magic",
    label: "Consumed Magic",
    description: "Record each curse you've consumed: the magic, the power it offers, and the downside it asks.",
    kind: "repeatable",
    itemLabel: "Consumed magic",
    min: 0,
    max: 10,
    fields: [
      { key: "magic", label: "Magic / curse", kind: "text", placeholder: "What was the curse?" },
      { key: "power", label: "Power", kind: "text", placeholder: "What power does it offer?" },
      { key: "downside", label: "Downside", kind: "text", placeholder: "What downside does it ask?" },
    ],
  },
];
