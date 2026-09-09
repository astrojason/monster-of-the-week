import type { PlaybookOptionSection } from "../playbookOptions";

export const expert: PlaybookOptionSection[] = [
  {
    key: "haven",
    label: "Haven",
    description: "You have set up a haven, a safe place to work. Pick three options for your haven.",
    kind: "fields",
    fields: [
      {
        key: "options",
        label: "Haven options",
        kind: "multiselect",
        pick: 3,
        choices: [
          "Lore Library: +1 forward to investigate the mystery when using historical/reference works.",
          "Mystical Library: +1 forward for use magic when preparing with occult tomes and grimoires.",
          "Protection Spells: Your haven is safe from monsters — they cannot enter.",
          "Armory: A stockpile of mystical and rare monster-killing weapons and items.",
          "Infirmary: You can heal people, with space for one or two to recuperate.",
          "Workshop: A space for building and repairing guns, cars and other gadgets.",
          "Oubliette: A room isolated from every kind of monster, spirit and magic you know about.",
          "Panic Room: Essential supplies, protected by normal and mystical means.",
          "Magical Laboratory: A mystical lab with ingredients and tools for casting spells.",
        ],
      },
    ],
  },
];
