import type { PlaybookOptionSection } from "../playbookOptions";

export const divine: PlaybookOptionSection[] = [
  {
    key: "mission",
    label: "Mission",
    description: "You have been put on Earth for a purpose. Pick one.",
    kind: "fields",
    fields: [
      {
        key: "purpose",
        label: "Mission",
        kind: "select",
        choices: [
          "You are here to fight the schemes of an Adversary.",
          "The End of Days approaches. Your role is to guide these hunters and prevent it from coming to pass.",
          "The End of Days approaches. Your role is to guide these hunters and ensure it comes to pass.",
          "You have been exiled. You must work for the cause of Good without drawing attention from your brothers and sisters, as they are bound to execute you for your crimes.",
          "One of the other hunters has a crucial role to play in events to come. You must prepare them for their role, and protect them at any cost.",
        ],
      },
    ],
  },
];
