# Monster of the Week - Campaign Tracker

A dark-themed campaign tracker for the Monster of the Week TTRPG. Track hunters, mysteries, sessions, and transcripts.

## Features

- **Hunter Dashboard** - View all hunters with stats, moves, gear, and interactive trackers
- **Luck/Harm/Experience Trackers** - Click to toggle boxes, visual alerts for DOOMED and Level Up states
- **Hunter Images** - Upload and manage hunter portraits with client-side compression
- **Mysteries & Sessions** - Organize your campaign into mysteries with session notes
- **Transcript Rendering** - Upload markdown transcripts and view them formatted in-app
- **Two-tier Auth** - Player (limited) and Keeper (full access) password levels

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
2. Enable **Firestore Database** (start in test mode or configure rules below)
3. Get your Firebase config from Project Settings > General > Your apps > Web app

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.local.example .env.local
```

Set your player and keeper passwords in `.env.local`.

### 4. Firebase Security Rules

#### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> **Note:** These are permissive rules suitable for a private campaign tracker. For production with public access, add proper authentication and restrict writes.
>
> **Storage:** Not required. Images are stored as base64 in Firestore and transcripts are stored as text in session documents.

### 5. Seed Initial Hunters

```bash
npm run seed
```

This creates the 5 starting hunters: Benny (Gumshoe), Tennyson (Celebrity), Tracy (Mundane), Alma (Spooky), and Sol (Forged).

### 6. Run Development Server

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

- **Player Password** - View all hunters, toggle Luck/Harm/Experience on any hunter, upload images
- **Keeper Password** - Full access: edit all hunter details, create hunters, manage mysteries/sessions, upload transcripts
