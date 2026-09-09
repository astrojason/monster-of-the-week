import type { PlaybookOptionSection } from "../playbookOptions";

export const monstrous: PlaybookOptionSection[] = [
  {
    key: "monster-breed",
    label: "Monster Breed",
    description: "Define your monstrous breed by picking an origin, a curse, moves, and natural attacks.",
    kind: "fields",
    fields: [
      {
        key: "origin",
        label: "Were you always this way, or transformed?",
        kind: "select",
        choices: ["Always this way", "Originally human and transformed somehow"],
      },
      {
        key: "alignment",
        label: "Were you always fighting to be good, or evil and changed sides?",
        kind: "select",
        choices: ["Always fighting to be good", "Was evil and changed sides"],
      },
      {
        key: "curse",
        label: "Curse",
        kind: "select",
        choices: [
          "Feed: You must subsist on living humans—it might take the form of blood, brains, or spiritual essence but it must be from people. You need to act under pressure to resist feeding whenever a perfect opportunity presents itself.",
          "Vulnerability: Pick a substance. You suffer +1 harm when you suffer harm from it. If you are bound or surrounded by it, you must act under pressure to use your powers.",
          "Pure Drive: One emotion rules you. Pick from: hunger, hate, anger, fear, jealousy, greed, joy, pride, envy, lust, or cruelty. Whenever you have a chance to indulge that emotion, you must do so immediately, or act under pressure to resist.",
          "Dark Master: You have an evil lord who doesn't know you changed sides. They still give you orders, and they do not tolerate refusal. Or failure.",
        ],
      },
      {
        key: "curse-details",
        label: "Curse specifics (substance, emotion, or dark master's identity)",
        kind: "text",
        placeholder: "e.g. silver, hunger, the orc overlord",
      },
      {
        key: "natural-attacks",
        label: "Natural Attacks — pick a Base and add an extra to it, or two Bases",
        kind: "multiselect",
        pick: 2,
        choices: [
          "Base: teeth (3-harm intimate)",
          "Base: claws (2-harm hand)",
          "Base: magical force (1-harm magical close)",
          "Base: life-drain (1-harm intimate life-drain)",
          "Extra: Add +1 harm to a base",
          "Extra: Add ignore-armour to a base",
          "Extra: Add an extra range to a base (add intimate, hand, or close)",
        ],
      },
    ],
  },
];
