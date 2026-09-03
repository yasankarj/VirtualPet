export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
}

export interface PetState {
  stats: PetStats;
  isResting: boolean;
  restRemainingMs: number;
}

export type MoodState = "HAPPY" | "NEUTRAL" | "HUNGRY" | "TIRED" | "SAD" | "SICK";
