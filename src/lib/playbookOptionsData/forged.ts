import type { PlaybookOptionSection } from "../playbookOptions";

export const forged: PlaybookOptionSection[] = [
  {
    key: "partner",
    label: "Partner",
    description: "Choose another hunter or create an ally to be your wielder/partner, then pick two bonds and one burden.",
    kind: "fields",
    fields: [
      {
        key: "bonds",
        label: "Bonds",
        kind: "multiselect",
        pick: 2,
        allowCustom: true,
        choices: ["Telepathic link", "Locational awareness", "Imitate your partner", "Speaking in each other's name"],
      },
      {
        key: "burden",
        label: "Burden",
        kind: "select",
        allowCustom: true,
        choices: ["Emotional bleed-over", "Dire curse", "Dread enemy", "Separation pains", "Covetous seeker"],
      },
    ],
  },
  {
    key: "dual-nature",
    label: "Dual Nature",
    description: "You may freely transform between your human and weapon shapes. Pick your base range, benefits, and flaw.",
    kind: "fields",
    fields: [
      {
        key: "range",
        label: "Range",
        kind: "select",
        choices: ["Intimate", "Hand", "Close", "Far"],
      },
      {
        key: "benefits",
        label: "Benefits",
        kind: "multiselect",
        pick: 2,
        choices: [
          'Magic: Add the "magic" tag',
          "Vicious: You deal +1 harm",
          "Precise: You deal +1 harm",
          'Life Drain: Add the "life-drain" tag; you may heal your wielder instead of yourself',
          "Reach: Add another range",
          "Defensive: Add 1-armour for your wielder",
          'Sweeping: Add the "area" tag',
          'Elemental: Add matching tags such as "fire," "wind," "lightning," "mind," or "darkness"',
        ],
      },
      {
        key: "flaw",
        label: "Flaw",
        kind: "select",
        choices: ["Conspicuous", "Distinctive", "Restricted", "Unwieldy", "Charging"],
      },
    ],
  },
  {
    key: "origin",
    label: "Origin",
    kind: "fields",
    fields: [
      {
        key: "forging",
        label: "Forging",
        kind: "select",
        allowCustom: true,
        choices: [
          "You always thought you were human.",
          "You gained sentience by the perfection of your maker's craft.",
          "You used to be a supernatural being.",
          "A magical accident resulted in your creation.",
          "You were created to fulfil an obligation.",
          "\"You know what? I don't remember.\"",
        ],
      },
      {
        key: "partnering",
        label: "Partnering",
        kind: "select",
        allowCustom: true,
        choices: [
          "Your partner displayed great faith and devotion.",
          "Your partner solved puzzles requiring wit and wisdom.",
          "Your partner won your allegiance through power and might.",
          "You were created specifically for your partner.",
          "Your partner swore to perform a task and you are to aid them.",
          "You met through sheer luck and happenstance.",
        ],
      },
    ],
  },
];
