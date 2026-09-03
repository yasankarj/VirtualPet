import {
  STAT_MIN,
  STAT_MAX,
  DECAY_PER_TICK,
  FEED_HUNGER_DELTA,
  FEED_ENERGY_DELTA,
  PLAY_HAPPINESS_DELTA,
  PLAY_HUNGER_DELTA,
  PLAY_ENERGY_DELTA,
  REST_DURATION_MS,
  REST_ENERGY_REGEN_PER_TICK,
  TICK_INTERVAL_MS,
  HEALTH_DECLINE_PER_TICK,
  HEALTH_RECOVERY_PER_TICK,
  CRITICAL_HUNGER_THRESHOLD,
  CRITICAL_HAPPINESS_THRESHOLD,
  CRITICAL_ENERGY_THRESHOLD,
  HAPPY_HUNGER_THRESHOLD,
  HAPPY_HAPPINESS_THRESHOLD,
  HAPPY_ENERGY_THRESHOLD,
  SICK_HEALTH_THRESHOLD,
} from "./constants";
import type { MoodState, PetState, PetStats } from "./types";

export function clamp(x: number): number {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, x));
}

function isCritical(stats: PetStats): boolean {
  return (
    stats.hunger >= CRITICAL_HUNGER_THRESHOLD ||
    stats.happiness <= CRITICAL_HAPPINESS_THRESHOLD ||
    stats.energy <= CRITICAL_ENERGY_THRESHOLD
  );
}

/** Health Rule (derived, FR1/FR4): declines while any stat is critical, else slowly recovers. */
export function computeHealth(stats: PetStats): number {
  return isCritical(stats)
    ? clamp(stats.health - HEALTH_DECLINE_PER_TICK)
    : clamp(stats.health + HEALTH_RECOVERY_PER_TICK);
}

/** Mood Rule (FR7): priority order, first match wins. */
export function computeMood(stats: PetStats): MoodState {
  if (stats.health <= SICK_HEALTH_THRESHOLD) return "SICK";
  if (stats.hunger >= CRITICAL_HUNGER_THRESHOLD) return "HUNGRY";
  if (stats.energy <= CRITICAL_ENERGY_THRESHOLD) return "TIRED";
  if (stats.happiness <= CRITICAL_HAPPINESS_THRESHOLD) return "SAD";
  if (
    stats.hunger < HAPPY_HUNGER_THRESHOLD &&
    stats.happiness >= HAPPY_HAPPINESS_THRESHOLD &&
    stats.energy >= HAPPY_ENERGY_THRESHOLD
  ) {
    return "HAPPY";
  }
  return "NEUTRAL";
}

/** Decay Rule: hunger up, happiness down always; energy down unless resting (Rest Rule governs energy while resting). */
export function applyDecay(state: PetState): PetState {
  const stats: PetStats = {
    ...state.stats,
    hunger: clamp(state.stats.hunger + DECAY_PER_TICK),
    happiness: clamp(state.stats.happiness - DECAY_PER_TICK),
    energy: state.isResting
      ? state.stats.energy
      : clamp(state.stats.energy - DECAY_PER_TICK),
  };
  return { ...state, stats };
}

/** Rest Rule (per-tick portion): energy regen, countdown, auto-wake. No-op if not resting. */
export function applyRestTick(state: PetState): PetState {
  if (!state.isResting) return state;

  const restRemainingMs = Math.max(0, state.restRemainingMs - TICK_INTERVAL_MS);
  const stats: PetStats = {
    ...state.stats,
    energy: clamp(state.stats.energy + REST_ENERGY_REGEN_PER_TICK),
  };

  return {
    ...state,
    stats,
    isResting: restRemainingMs > 0,
    restRemainingMs,
  };
}

/**
 * Tick Process (business-logic-model.md #1): decay -> rest tick -> recompute health.
 * Runs once per TICK_INTERVAL_MS while the app is open.
 */
export function tick(state: PetState): PetState {
  let next = applyDecay(state);
  next = applyRestTick(next);
  next = { ...next, stats: { ...next.stats, health: computeHealth(next.stats) } };
  return next;
}

/** Feed Action: no-op (defensive) if resting or hunger is already fully satisfied. No cooldown. */
export function applyFeed(state: PetState): PetState {
  if (state.isResting || state.stats.hunger <= STAT_MIN) {
    return state;
  }

  return {
    ...state,
    stats: {
      ...state.stats,
      hunger: clamp(state.stats.hunger + FEED_HUNGER_DELTA),
      energy: clamp(state.stats.energy + FEED_ENERGY_DELTA),
    },
  };
}

/**
 * Play Action: no-op (defensive) if resting, happiness is already maxed, or the pet has no
 * energy/health left to play with. No cooldown.
 */
export function applyPlay(state: PetState): PetState {
  if (
    state.isResting ||
    state.stats.happiness >= STAT_MAX ||
    state.stats.energy <= STAT_MIN ||
    state.stats.health <= STAT_MIN
  ) {
    return state;
  }

  return {
    ...state,
    stats: {
      ...state.stats,
      happiness: clamp(state.stats.happiness + PLAY_HAPPINESS_DELTA),
      hunger: clamp(state.stats.hunger + PLAY_HUNGER_DELTA),
      energy: clamp(state.stats.energy + PLAY_ENERGY_DELTA),
    },
  };
}

/** Rest Action (trigger only — waking is handled by applyRestTick/tick): no-op if already resting. */
export function applyRest(state: PetState): PetState {
  if (state.isResting) return state;

  return {
    ...state,
    isResting: true,
    restRemainingMs: REST_DURATION_MS,
  };
}
