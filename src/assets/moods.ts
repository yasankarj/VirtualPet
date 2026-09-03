import type { MoodState } from "../domain/types";

export interface MoodArt {
  emoji: string;
  label: string;
}

// Simple emoji placeholder art (FR7) — no photographic or copyrighted imagery.
export const MOOD_ART: Record<MoodState, MoodArt> = {
  HAPPY: { emoji: "\u{1F60A}", label: "Happy" },
  NEUTRAL: { emoji: "\u{1F610}", label: "Neutral" },
  HUNGRY: { emoji: "\u{1F924}", label: "Hungry" },
  TIRED: { emoji: "\u{1F634}", label: "Tired" },
  SAD: { emoji: "\u{1F622}", label: "Sad" },
  SICK: { emoji: "\u{1F912}", label: "Sick" },
};
