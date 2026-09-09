import type { PlaybookOptionSection } from "../playbookOptions";

export const crooked: PlaybookOptionSection[] = [
  {
    key: "background",
    label: "Background",
    description: "You worked a less-than-legal job before you became a monster hunter. What did you do?",
    kind: "fields",
    fields: [
      {
        key: "job",
        label: "Background",
        kind: "select",
        choices: [
          "Hoodlum: You can use Tough instead of Charm to manipulate someone with threats of violence.",
          "Burglar: When you break into a secure location, roll +Sharp.",
          "Grifter: When you are about to manipulate someone, you can ask the Keeper \"What will convince this person to do what I want?\"",
          "Fixer: If you need to buy something, sell something, or hire someone, roll +Charm.",
          "Assassin: When you take your first shot at an unsuspecting target, do +2 Harm.",
          "Charlatan: When you want people to think you are using magic, roll +Cool.",
          "Pickpocket: When you steal something small, roll +Charm.",
        ],
      },
    ],
  },
  {
    key: "heat",
    label: "Heat",
    description: "You didn't get here without making enemies. Pick at least two and name the people involved.",
    kind: "repeatable",
    itemLabel: "Enemy",
    min: 2,
    max: 5,
    fields: [
      {
        key: "type",
        label: "Who",
        kind: "select",
        choices: [
          "A police detective who has made it a personal goal to put you away",
          "A rival from your background who never misses a chance to screw you over",
          "A well-connected criminal you pissed off",
          "Someone with special powers (a person or monster) who you took advantage of",
          "An old partner you betrayed in the middle of a job",
        ],
      },
      {
        key: "name",
        label: "Name",
        kind: "text",
        placeholder: "Their name",
      },
    ],
  },
  {
    key: "underworld",
    label: "Underworld",
    description: "Pick how you discovered about the real underworld.",
    kind: "fields",
    fields: [
      {
        key: "discovery",
        label: "How you discovered it",
        kind: "select",
        choices: [
          "The target of a job was a dangerous creature (vampire, werewolf, troll, or reptiloid)",
          "You worked with someone who was more than they seemed (sorcerer, demon, faerie, or psychic)",
          "You were hired by something weird (immortal, god, outsider, or witch)",
          "Things went south on a job (a horde of goblins, a hunger of ghouls, a dream-eater, or a salamander)",
        ],
      },
      {
        key: "detail",
        label: "Specific creature/entity",
        kind: "text",
        placeholder: "e.g. vampire, sorcerer, witch, dream-eater",
      },
    ],
  },
];
