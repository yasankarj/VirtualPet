import { NEW_PET_STARTING_STATS } from "./constants";
import type { PetState } from "./types";

export function createNewPet(): PetState {
  return {
    stats: { ...NEW_PET_STARTING_STATS },
    isResting: false,
    restRemainingMs: 0,
  };
}
