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

export interface DecayGraces {
  hungerGraceRemainingMs: number;
  happinessGraceRemainingMs: number;
}

export interface PetState {
  name: string;
  stats: PetStats;
  isResting: boolean;
  restRemainingMs: number;
  cooldowns: ActionCooldowns;
  graces: DecayGraces;
}

export type MoodState = "HAPPY" | "NEUTRAL" | "HUNGRY" | "TIRED" | "SAD" | "SICK";
