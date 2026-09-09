import { collection, doc, getDocs, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { playbookSlug } from "./playbooks";
import { PLAYBOOK_OPTION_DEFAULTS } from "./playbookOptionsData";
import type { PlaybookOptionSection } from "./playbookOptions";

export const PLAYBOOK_OPTION_OVERRIDES_COLLECTION = "playbookOptionOverrides";

export type PlaybookOptionOverrides = Record<string, PlaybookOptionSection[]>;

export async function loadPlaybookOptionOverrides(): Promise<PlaybookOptionOverrides> {
  const snap = await getDocs(collection(db, PLAYBOOK_OPTION_OVERRIDES_COLLECTION));
  const overrides: PlaybookOptionOverrides = {};
  snap.docs.forEach((d) => {
    const data = d.data() as { sections?: PlaybookOptionSection[] };
    if (Array.isArray(data.sections)) overrides[d.id] = data.sections;
  });
  return overrides;
}

export function getDefaultSections(playbook: string): PlaybookOptionSection[] {
  return PLAYBOOK_OPTION_DEFAULTS[playbook as keyof typeof PLAYBOOK_OPTION_DEFAULTS] ?? [];
}

/** The sections actually in effect for a playbook: its admin override if one exists, else the built-in default. */
export function getEffectiveSections(playbook: string, overrides: PlaybookOptionOverrides): PlaybookOptionSection[] {
  const slug = playbookSlug(playbook);
  return overrides[slug] ?? getDefaultSections(playbook);
}

export async function savePlaybookOptionOverride(playbook: string, sections: PlaybookOptionSection[]): Promise<void> {
  await setDoc(doc(db, PLAYBOOK_OPTION_OVERRIDES_COLLECTION, playbookSlug(playbook)), { sections });
}

export async function resetPlaybookOptionOverride(playbook: string): Promise<void> {
  await deleteDoc(doc(db, PLAYBOOK_OPTION_OVERRIDES_COLLECTION, playbookSlug(playbook)));
}
