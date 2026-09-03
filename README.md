# Monster of the Week - Campaign Tracker

A dark-themed campaign tracker for the Monster of the Week TTRPG. Track hunters, mysteries, sessions, and transcripts.

## Features

- **Hunter Dashboard** - View all hunters with stats, moves, gear, and interactive trackers
- **Luck/Harm/Experience Trackers** - Click to toggle boxes, visual alerts for DOOMED and Level Up states
- **Hunter Images** - Upload and manage hunter portraits with client-side compression
- **Mysteries & Sessions** - Organize your campaign into mysteries with session notes
- **Transcript Rendering** - Upload markdown transcripts and view them formatted in-app
- **Google Sign-In + Grants** - Real per-person auth via Firebase Auth; a Keeper grants Player or Keeper access to specific Google accounts from an in-app admin screen

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Firebase (Firestore only - no Storage needed)
- Deployed on Vercel

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database**
3. Enable **Authentication** > Sign-in method > **Google**
4. Get your Firebase config from Project Settings > General > Your apps > Web app

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.local.example .env.local
```

### 4. Firestore Security Rules

Deploy the rules in `firestore.rules` (via `firebase deploy --only firestore:rules`, or paste them into Firestore > Rules in the console). They require every reader/writer to be signed in with Google *and* have a matching document in the `grants` collection; a Keeper can additionally write anything, a Player is restricted to specific fields.

> **Storage:** Not required. Images are stored as base64 in Firestore and transcripts are stored as text in session documents.

### 5. Bootstrap the first Keeper

Nobody can use the in-app admin screen (`/admin`) until at least one `grants` document exists, so create the first one by hand in the Firestore console **before** deploying the rules above:

- Collection: `grants`
- Document ID: your Google account's email address, lowercased (e.g. `you@example.com`)
- Fields: `{ email: "you@example.com", role: "keeper", addedAt: <any number>, addedBy: "bootstrap" }`

After that, sign in with Google in the app and use the Admin page to grant access to your players.

### 6. Seed Initial Hunters

```bash
npm run seed
```

This creates the 5 starting hunters: Benny (Gumshoe), Tennyson (Celebrity), Tracy (Mundane), Alma (Spooky), and Sol (Forged).

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` to Vercel project settings
4. Deploy

## Roles

Access is granted per Google account via the `grants` collection (managed from `/admin` by a Keeper):

- **Player** - View all hunters; edit trackers, details, image, and player notes only on hunters their account is assigned to (a hunter can have multiple co-owners; set via "Played By (accounts)" on the hunter, keeper-only field)
- **Keeper** - Full access: everything a Player can do on every hunter, plus create hunters/mysteries/sessions, edit mystery/session metadata, edit Keeper-only notes, assign hunters to accounts, and manage grants
