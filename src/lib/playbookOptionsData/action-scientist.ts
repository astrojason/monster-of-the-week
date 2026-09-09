import type { PlaybookOptionSection } from "../playbookOptions";

export const actionScientist: PlaybookOptionSection[] = [
  {
    key: "area-of-study",
    label: "Area of Study",
    description: "Pick one focus for your research and training.",
    kind: "fields",
    fields: [
      {
        key: "focus",
        label: "Focus",
        kind: "select",
        choices: [
          "Physics and Cosmology: You can tell when something is altering the basic laws of reality around you.",
          "Biology and Chemistry: When you examine a mysterious substance, ask the Keeper what the source is.",
          "Neurology and Psychology: When you're talking to someone and assessing their motives, roll +Sharp.",
          "Computers and Electronics: When you access a secure computer system or electronic device, or change what it does, roll +Cool.",
          "Violence: You may roll +Sharp to kick some ass instead of +Tough.",
          "Mechanics and Engineering: When you fix machinery, it takes much less time than expected.",
          "Space: You have +1 ongoing with rocketry or astronaut stuff.",
        ],
      },
    ],
  },
];
