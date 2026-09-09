import type { PlaybookOptionSection } from "../playbookOptions";

export const interfacePlaybook: PlaybookOptionSection[] = [
  {
    key: "integration",
    label: "Integration",
    description: "Pick Upgrades and Faults to describe how you interact with machines, then how you gained these abilities.",
    kind: "fields",
    fields: [
      {
        key: "upgrades",
        label: "Upgrades",
        kind: "multiselect",
        pick: 2,
        choices: [
          "Always connected",
          "Specialised tools",
          "Security specialist",
          "Intelligence database",
          "Aim-assist",
          "Heads-up display",
          "Everything's compatible",
          "Speed typing",
        ],
      },
      {
        key: "faults",
        label: "Faults",
        kind: "multiselect",
        pick: 2,
        choices: [
          "Need my gear",
          "Hackable brain",
          "Specialised maintenance",
          "Undisciplined",
          "Overhyped rep",
          "Overconfidence",
          "Buggy implants",
        ],
      },
      {
        key: "origin",
        label: "How you gained these abilities",
        kind: "select",
        choices: [
          "We Can Rebuild Them: You were rebuilt after a near-death, or actual death, experience. Who thought you were important enough to keep alive?",
          "Technopath: You have a magical relationship with machines. How did you gain or discover your powers?",
          "Volunteer: You volunteered to be upgraded. Who had the technology to do this to you?",
          "Skillz: Sheer genius and hard work. What event made your reputation, and how does it cause you trouble?",
          "Artificial: You were created this way. What was your original purpose? Have you transcended it?",
        ],
      },
    ],
  },
];
