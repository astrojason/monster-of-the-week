export const PLAYBOOKS = [
  "Action Scientist",
  "Celebrity",
  "Changeling",
  "Chosen",
  "Covenant",
  "Crooked",
  "Curse-eater",
  "Divine",
  "Envoy",
  "Expert",
  "Flake",
  "Forged",
  "Gumshoe",
  "Hex",
  "Host",
  "Initiate",
  "Interface",
  "Monstrous",
  "Mundane",
  "Pararomantic",
  "Professional",
  "Searcher",
  "Snoop",
  "Spell-slinger",
  "Spooktacular",
  "Spooky",
  "Visitor",
  "Wronged",
] as const;

export type Playbook = (typeof PLAYBOOKS)[number];
export const PLAYBOOK_LIST: string[] = [...PLAYBOOKS].sort();

export function playbookSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}
