import type { PlaybookOptionSection } from "../playbookOptions";

export const visitor: PlaybookOptionSection[] = [
  {
    key: "expatriation",
    label: "Expatriation",
    description: "What was your home culture like? Pick one or more from at least two lines.",
    kind: "fields",
    fields: [
      {
        key: "home-culture-1",
        label: "Home culture (line 1)",
        kind: "multiselect",
        allowCustom: true,
        choices: [
          "Feudal",
          "Imperial",
          "Democratic",
          "Theocratic",
          "Mercantile",
          "Egalitarian",
          "Meritocratic",
        ],
      },
      {
        key: "home-culture-2",
        label: "Home culture (line 2)",
        kind: "multiselect",
        allowCustom: true,
        choices: ["Lone homeworld", "Lone system", "Space habitats", "Interstellar", "Nomadic", "Scattered worlds"],
      },
      {
        key: "home-culture-3",
        label: "Home culture (line 3)",
        kind: "multiselect",
        allowCustom: true,
        choices: ["Caste system", "Wartorn", "Tyrannical", "Peaceful", "Rationalist", "High-tech", "Low-tech"],
      },
      {
        key: "why-left",
        label: "Why did you leave?",
        kind: "select",
        allowCustom: true,
        choices: [
          "You had to escape",
          "You're a scout, exploring new worlds",
          "You're a tourist, looking for interesting experiences",
          "You're an emissary",
        ],
      },
      {
        key: "why-stayed",
        label: "Why have you stayed on Earth?",
        kind: "select",
        allowCustom: true,
        choices: ["To befriend", "To teach", "To learn", "To protect it"],
      },
      {
        key: "pulls-back",
        label: "What pulls you back home?",
        kind: "select",
        allowCustom: true,
        choices: ["Relationships", "Enemies", "Obligations", "Homesickness"],
      },
    ],
  },
];
