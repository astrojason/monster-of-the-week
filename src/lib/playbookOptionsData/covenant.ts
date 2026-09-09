import type { PlaybookOptionSection } from "../playbookOptions";

export const covenant: PlaybookOptionSection[] = [
  {
    key: "friendship",
    label: "Friendship",
    description: "You start with an ally. Pick a type and a style, then describe the ally.",
    kind: "fields",
    fields: [
      {
        key: "type",
        label: "Type",
        kind: "select",
        choices: [
          "Watson: An individual, extra-competent ally.",
          "Rolodex: An ally team with various skills; tends to operate individually.",
          "Unit: A small group that usually operates as a team.",
        ],
      },
      {
        key: "description",
        label: "Describe the ally",
        kind: "select",
        allowCustom: true,
        choices: [
          "Long-time coworker",
          "Good buddy",
          "Supernatural creature",
          "Romantic interest",
          "Friendly employer",
          "Loyal retainer",
          "Mutually cursed",
          "Something else",
        ],
      },
    ],
  },
];
