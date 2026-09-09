import type { PlaybookOptionSection } from "../playbookOptions";

export const snoop: PlaybookOptionSection[] = [
  {
    key: "crew",
    label: "Crew",
    description:
      "Decide if your crew is the other hunters, or if you have an entourage. If it's an entourage, there are up to three of them — pick a name and job for each (bystanders).",
    kind: "repeatable",
    itemLabel: "Crew member",
    min: 0,
    max: 3,
    fields: [
      {
        key: "name",
        label: "Name",
        kind: "text",
      },
      {
        key: "job",
        label: "Job",
        kind: "select",
        choices: [
          "Camera",
          "Sound",
          "Editing",
          "Dogsbody",
          "Researcher",
          "Driver",
          "Director",
          "Producer",
          "Bodyguard",
        ],
      },
    ],
  },
];
