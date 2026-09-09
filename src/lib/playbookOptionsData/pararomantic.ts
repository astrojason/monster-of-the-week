import type { PlaybookOptionSection } from "../playbookOptions";

export const pararomantic: PlaybookOptionSection[] = [
  {
    key: "relationship-status",
    label: "Relationship Status",
    description: "Loving (0) to Broken (7) — mark a box whenever you spend a point of Luck.",
    kind: "fields",
    fields: [
      {
        key: "track",
        label: "Relationship Status (Loving 0 – Broken 7)",
        kind: "number",
        max: 7,
      },
    ],
  },
  {
    key: "supernatural-guide",
    label: "Supernatural Guide",
    description: "Your connection to a supernatural being who is your guide into the world beyond.",
    kind: "fields",
    fields: [
      {
        key: "secret",
        label: "Is your relationship secret?",
        kind: "select",
        choices: ["Secret", "Not secret"],
      },
      {
        key: "creature",
        label: "What kind of creature is your Guide, and how does your relationship work?",
        kind: "text",
      },
      {
        key: "power",
        label: "What kind of power do they possess?",
        kind: "text",
      },
    ],
  },
  {
    key: "moves-picked",
    label: "Pararomantic Moves (pick two, beyond Supernatural Guide)",
    kind: "fields",
    fields: [
      {
        key: "picks",
        label: "Moves",
        kind: "multiselect",
        pick: 2,
        choices: [
          "Bonding Time",
          "Dark Desires",
          "The Power of Love",
          "Do As The Supernatural Do",
          "I Am Theirs And They Are Mine",
          "Monster Empathy",
          "Spirit Touched",
        ],
      },
    ],
  },
  {
    key: "gift",
    label: "Gift from your Guide",
    kind: "fields",
    fields: [
      {
        key: "gift",
        label: "Gift",
        kind: "select",
        allowCustom: true,
        choices: [
          "Part of their body, e.g. a vial of blood, lock of hair, tears in a phial, fairy dust. It either helps you heal, or counts as a weakness against a specific sort of monster.",
          "Piece of jewelery, e.g. a golden ring, tribal pendant, silver locket. It either provides 1-armour magic or protects you from the powers of a specific sort of monster.",
          "A memento of the time when they were human, e.g. a portrait/photo from life, diary, favourite hat, doll, or lighter. Provides +1 on bond abuse rolls.",
          'A strange or antique weapon, e.g. a family sword, ancient staff, holy mace (2-harm hand messy). Additionally, add "magic," "silver," "holy," or "iron" to the weapon.',
        ],
      },
    ],
  },
  {
    key: "fate-of-your-love",
    label: "Fate Of Your Love",
    description: "The reason your love with your Guide is forbidden or doomed. Invent it, or leave it to the Keeper.",
    kind: "fields",
    fields: [
      {
        key: "reason",
        label: "Reason",
        kind: "text",
      },
    ],
  },
];
