import type { PlaybookOptionSection } from "../playbookOptions";

export const wronged: PlaybookOptionSection[] = [
  {
    key: "who-you-lost",
    label: "Who You Lost",
    description: "Pick one or more of who you lost, and name them.",
    kind: "repeatable",
    itemLabel: "Person lost",
    min: 1,
    max: 5,
    fields: [
      {
        key: "relation",
        label: "Relation",
        kind: "select",
        choices: ["Your parent(s)", "Your sibling(s)", "Your spouse/partner", "Your child(ren)", "Your best friend(s)"],
      },
      { key: "name", label: "Name", kind: "text", placeholder: "Who was it?" },
    ],
  },
  {
    key: "prey",
    label: "What Did It?",
    description: "With the Keeper's agreement, pick the monster breed.",
    kind: "fields",
    fields: [{ key: "prey", label: "My prey", kind: "text", placeholder: "Monster breed" }],
  },
  {
    key: "why-couldnt-save-them",
    label: "Why couldn't you save them?",
    description: "You were (pick one or more):",
    kind: "fields",
    fields: [
      {
        key: "reasons",
        label: "You were",
        kind: "multiselect",
        choices: ["At fault", "Selfish", "Injured", "Weak", "Slow", "Scared", "In denial", "Complicit"],
      },
    ],
  },
];
