import type { Playbook } from "../playbooks";
import type { PlaybookOptionSection } from "../playbookOptions";
import { actionScientist } from "./action-scientist";
import { celebrity } from "./celebrity";
import { changeling } from "./changeling";
import { chosen } from "./chosen";
import { covenant } from "./covenant";
import { crooked } from "./crooked";
import { curseEater } from "./curse-eater";
import { divine } from "./divine";
import { envoy } from "./envoy";
import { expert } from "./expert";
import { flake } from "./flake";
import { forged } from "./forged";
import { gumshoe } from "./gumshoe";
import { hex } from "./hex";
import { host } from "./host";
import { initiate } from "./initiate";
import { interfacePlaybook } from "./interface";
import { monstrous } from "./monstrous";
import { mundane } from "./mundane";
import { pararomantic } from "./pararomantic";
import { professional } from "./professional";
import { searcher } from "./searcher";
import { snoop } from "./snoop";
import { spellSlinger } from "./spell-slinger";
import { spooktacular } from "./spooktacular";
import { spooky } from "./spooky";
import { visitor } from "./visitor";
import { wronged } from "./wronged";

export const PLAYBOOK_OPTION_DEFAULTS: Record<Playbook, PlaybookOptionSection[]> = {
  "Action Scientist": actionScientist,
  Celebrity: celebrity,
  Changeling: changeling,
  Chosen: chosen,
  Covenant: covenant,
  Crooked: crooked,
  "Curse-eater": curseEater,
  Divine: divine,
  Envoy: envoy,
  Expert: expert,
  Flake: flake,
  Forged: forged,
  Gumshoe: gumshoe,
  Hex: hex,
  Host: host,
  Initiate: initiate,
  Interface: interfacePlaybook,
  Monstrous: monstrous,
  Mundane: mundane,
  Pararomantic: pararomantic,
  Professional: professional,
  Searcher: searcher,
  Snoop: snoop,
  "Spell-slinger": spellSlinger,
  Spooktacular: spooktacular,
  Spooky: spooky,
  Visitor: visitor,
  Wronged: wronged,
};
