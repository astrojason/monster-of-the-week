import type { PlaybookOptionSection } from "../playbookOptions";

export const initiate: PlaybookOptionSection[] = [
  {
    key: "sect",
    label: "Sect",
    description:
      "You are part of an ancient, secret order that slays monsters. Where are they from? How old are they? Are they religious? Why do they stay secret? How do they recruit? You also need to pick the Sect's traditions.",
    kind: "fields",
    fields: [
      {
        key: "description",
        label: "Sect description",
        kind: "text",
        placeholder: "Origin, age, secrecy, recruitment...",
      },
      {
        key: "good-traditions",
        label: "Good Traditions (pick two)",
        kind: "multiselect",
        pick: 2,
        choices: [
          "Knowledgable",
          "Ancient lore",
          "Magical lore",
          "Fighting arts",
          "Modernised",
          "Chapters everywhere",
          "Secular power",
          "Flexible tactics",
          "Open hierarchy",
          "Integrated in society",
          "Rich",
          "Nifty gadgets",
          "Magical items",
        ],
      },
      {
        key: "bad-traditions",
        label: "Bad Traditions (pick one)",
        kind: "select",
        choices: [
          "Dubious motives",
          "Tradition-bound",
          "Short-sighted",
          "Paranoid and secretive",
          "Closed hierarchy",
          "Factionalised",
          "Strict laws",
          "Mystical oaths",
          "Total obedience",
          "Tyrannical leaders",
          "Obsolete gear",
          "Poor",
        ],
      },
    ],
  },
];
