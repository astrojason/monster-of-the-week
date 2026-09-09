import type { PlaybookOptionSection } from "../playbookOptions";

export const envoy: PlaybookOptionSection[] = [
  {
    key: "task",
    label: "Task",
    description: "You have been given a task by the Overseers. Pick one.",
    kind: "fields",
    fields: [
      {
        key: "role",
        label: "Task",
        kind: "select",
        choices: [
          "Guide: You are meant to guide people towards a desired end.",
          "Herald: You are meant to bring instructions to other people.",
          "Watcher: You are meant to search for signs of something.",
          "Witness: You are meant to record and observe ongoing events.",
        ],
      },
      {
        key: "detail",
        label: "Detail (what/who/what signs)",
        kind: "text",
        placeholder: "e.g. what you teach, what you record, what signs you watch for",
      },
    ],
  },
  {
    key: "overseers",
    label: "Overseers",
    description: "Describe your Overseers according to their Values and your Concerns.",
    kind: "fields",
    fields: [
      {
        key: "values",
        label: "Their Values",
        kind: "multiselect",
        pick: 2,
        allowCustom: true,
        choices: [
          "Order",
          "Freedom",
          "Safety",
          "Compassion",
          "Secrecy",
          "Knowledge",
          "Honesty",
          "Power",
          "Growth",
          "Truth",
        ],
      },
      {
        key: "concerns",
        label: "Your Concerns",
        kind: "select",
        allowCustom: true,
        choices: [
          "Overseers' internal politics",
          "Cryptic communication",
          "Strict rules",
          "Alien perspective",
          "Distant presence",
          "Secret underlying motives",
          "Purity",
          "Narrow-focused",
          "Big picture",
        ],
      },
    ],
  },
];
