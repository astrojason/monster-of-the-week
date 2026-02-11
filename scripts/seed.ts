import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Load env vars - run with: npx tsx --env-file=.env.local scripts/seed.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const hunters = [
  {
    name: "Alma",
    playbook: "Spooky",
    playedBy: "Stephen",
    stats: { charm: 0, cool: -1, sharp: 1, tough: 1, weird: 2 },
    moves: ["Telepathy", "Hex", "The Sight"],
    gear: ["Old grimoire", "Protective amulet"],
    luck: 0,
    harm: 0,
    experience: 0,
    notes: "",
    playerNotes: "",
    keeperNotes: "",
    imageUrl: "",
    imageData: "",
  },
  {
    name: "Benny",
    playbook: "Gumshoe",
    playedBy: "Kevin",
    stats: { charm: 1, cool: 1, sharp: 2, tough: 0, weird: -1 },
    moves: ["The Nose for Trouble", "Pay a Visit", "Stake Out"],
    gear: ["Snub-nosed revolver", "Magnifying glass", "Trench coat"],
    luck: 0,
    harm: 0,
    experience: 0,
    notes: "",
    playerNotes: "",
    keeperNotes: "",
    imageUrl: "",
    imageData: "",
  },
  {
    name: "Sol",
    playbook: "Forged",
    playedBy: "Craig",
    stats: { charm: -1, cool: 1, sharp: 0, tough: 2, weird: 1 },
    moves: ["Unstoppable", "Built for Battle", "Mechanical Mind"],
    gear: ["Reinforced fists", "Toolkit"],
    luck: 0,
    harm: 0,
    experience: 0,
    notes: "",
    playerNotes: "",
    keeperNotes: "",
    imageUrl: "",
    imageData: "",
  },
  {
    name: "Tennyson",
    playbook: "Celebrity",
    playedBy: "Brandon",
    stats: { charm: 2, cool: 1, sharp: 0, tough: -1, weird: 1 },
    moves: ["Fame", "Entourage", "Stage Presence"],
    gear: ["Designer sunglasses", "Smartphone", "Business cards"],
    luck: 0,
    harm: 0,
    experience: 0,
    notes: "",
    playerNotes: "",
    keeperNotes: "",
    imageUrl: "",
    imageData: "",
  },
  {
    name: "Tracy",
    playbook: "Mundane",
    playedBy: "Pamela",
    stats: { charm: 1, cool: 1, sharp: 0, tough: 1, weird: -1 },
    moves: ["What Could Go Wrong?", "Panic Button", "Trust Me"],
    gear: ["Baseball bat", "First aid kit", "Flashlight"],
    luck: 0,
    harm: 0,
    experience: 0,
    notes: "",
    playerNotes: "",
    keeperNotes: "",
    imageUrl: "",
    imageData: "",
  },
];

async function seed() {
  console.log("Checking for existing hunters...");
  const existing = await getDocs(collection(db, "hunters"));
  if (!existing.empty) {
    console.log(`Found ${existing.size} existing hunters. Skipping seed to avoid duplicates.`);
    console.log("Delete existing hunters first if you want to re-seed.");
    process.exit(0);
  }

  console.log("Seeding hunters...");
  for (const hunter of hunters) {
    const docRef = await addDoc(collection(db, "hunters"), hunter);
    console.log(`  Created: ${hunter.name} (${hunter.playbook}) - ${docRef.id}`);
  }
  console.log("Done! Created 5 hunters.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
