import { NEW_PET_STARTING_STATS } from "./constants";
import type { PetState } from "./types";

export function createNewPet(): PetState {
  return {
    stats: { ...NEW_PET_STARTING_STATS },
    isResting: false,
    restRemainingMs: 0,
    cooldowns: { feedRemainingMs: 0, playRemainingMs: 0 },
    graces: { hungerGraceRemainingMs: 0, happinessGraceRemainingMs: 0 },
  };
}
