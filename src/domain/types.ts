export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
}

export interface ActionCooldowns {
  feedRemainingMs: number;
  playRemainingMs: number;
}

export interface PetState {
  stats: PetStats;
  isResting: boolean;
  restRemainingMs: number;
  cooldowns: ActionCooldowns;
}

export type MoodState = "HAPPY" | "NEUTRAL" | "HUNGRY" | "TIRED" | "SAD" | "SICK";
