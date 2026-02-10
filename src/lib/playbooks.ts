export const PLAYBOOKS = [
  "Chosen",
  "Crooked",
  "Divine",
  "Expert",
  "Flake",
  "Gumshoe",
  "Hex",
  "Initiate",
  "Monstrous",
  "Mundane",
  "Professional",
  "Spell-slinger",
  "Spooky",
  "Wronged",
  "Celebrity",
  "Forged",
  "Hard Case",
  "Pararomantic",
  "Searcher",
  "Snoop",
] as const;

export type Playbook = (typeof PLAYBOOKS)[number];
export const PLAYBOOK_LIST: string[] = [...PLAYBOOKS];
