import type { PlaybookOptionSection } from "../playbookOptions";

export const spellSlinger: PlaybookOptionSection[] = [
  {
    key: "combat-magic",
    label: "Combat Magic",
    description:
      "Your combat spells can combine any of your base spells with any of your effects. Pick three total, with at least one base.",
    kind: "fields",
    fields: [
      {
        key: "bases",
        label: "Bases",
        kind: "multiselect",
        choices: [
          "Blast: 2-harm magic close obvious loud",
          "Ball: 1-harm magic area close obvious loud",
          "Missile: 1-harm magic far obvious loud",
          "Wall: 1-harm magic barrier close 1-armour obvious loud",
        ],
      },
      {
        key: "effects",
        label: "Effects",
        kind: "multiselect",
        choices: [
          'Fire: Add "+2 harm fire" to a base. If you get a 10+ on a combat magic roll, the fire won\'t spread.',
          'Force or Wind: Add "+1 harm forceful" to a base, or "+1 armour" to a wall.',
          'Lightning or Entropy: Add "+1 harm messy" to a base.',
          'Frost or Ice: Adds "-1 harm +2 armour" to a wall, or "+1 harm restraining" to other bases.',
          'Earth: Add "forceful restraining" to a base.',
          'Necromantic: Add "life-drain" to a base.',
        ],
      },
    ],
  },
  {
    key: "tools-and-techniques",
    label: "Tools and Techniques",
    description: "To use your combat magic effectively, you rely on a collection of tools and techniques. Cross off one; you'll need the rest.",
    kind: "fields",
    fields: [
      {
        key: "crossed-off",
        label: "Cross off one (you lack this)",
        kind: "select",
        choices: ["Consumables", "Foci", "Gestures", "Incantations"],
      },
    ],
  },
];
