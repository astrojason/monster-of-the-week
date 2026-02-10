export interface HunterStats {
  charm: number;
  cool: number;
  sharp: number;
  tough: number;
  weird: number;
}

export interface Hunter {
  id: string;
  name: string;
  playbook: string;
  playedBy: string;
  stats: HunterStats;
  moves: string[];
  gear: string[];
  luck: number;
  harm: number;
  experience: number;
  notes: string;
  imageUrl: string;
  imageData: string;
}

export interface Mystery {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed";
  createdAt: number;
}

export interface Session {
  id: string;
  sessionNumber: number;
  date: string;
  summary: string;
  transcript: string;
  transcriptName: string;
  createdAt: number;
}

export type Role = "player" | "keeper" | null;
