import { PET_STATE_STORAGE_KEY } from "./constants";
import { createNewPet } from "./factory";
import type { PetState } from "./types";

function isValidPetState(value: unknown): value is PetState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  const stats = v.stats as Record<string, unknown> | undefined;
  const cooldowns = v.cooldowns as Record<string, unknown> | undefined;
  const graces = v.graces as Record<string, unknown> | undefined;

  return (
    typeof v.name === "string" &&
    typeof stats === "object" &&
    stats !== null &&
    typeof stats.hunger === "number" &&
    typeof stats.happiness === "number" &&
    typeof stats.energy === "number" &&
    typeof stats.health === "number" &&
    typeof v.isResting === "boolean" &&
    typeof v.restRemainingMs === "number" &&
    typeof cooldowns === "object" &&
    cooldowns !== null &&
    typeof cooldowns.feedRemainingMs === "number" &&
    typeof cooldowns.playRemainingMs === "number" &&
    typeof graces === "object" &&
    graces !== null &&
    typeof graces.hungerGraceRemainingMs === "number" &&
    typeof graces.happinessGraceRemainingMs === "number"
  );
}

/**
 * Loads saved pet state. Missing, corrupted, or unparseable data falls back to a fresh
 * default pet rather than throwing (business-logic-model.md Error Handling; NFR5).
 */
export function loadState(): PetState {
  try {
    const raw = localStorage.getItem(PET_STATE_STORAGE_KEY);
    if (!raw) return createNewPet();

    const parsed: unknown = JSON.parse(raw);
    return isValidPetState(parsed) ? parsed : createNewPet();
  } catch {
    return createNewPet();
  }
}

/** Persists pet state. Write failures (e.g. storage unavailable) are swallowed per NFR5. */
export function saveState(state: PetState): void {
  try {
    localStorage.setItem(PET_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — app continues in-memory for the session (business-logic-model.md).
  }
}

/**
 * True only if a currently-valid PetState already exists under the storage key — used to gate the
 * first-launch naming prompt (Refresh/Naming FR-NR3), independent of loadState's fallback behavior
 * (a previously-skipped naming prompt still saves a valid PetState, so this must not be re-derived
 * from whether `name` equals the default).
 */
export function hasSavedPet(): boolean {
  try {
    const raw = localStorage.getItem(PET_STATE_STORAGE_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    return isValidPetState(parsed);
  } catch {
    return false;
  }
}
