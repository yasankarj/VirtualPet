import {
  STAT_MIN,
  STAT_MAX,
  DECAY_PER_TICK,
  FEED_HUNGER_DELTA,
  PLAY_HAPPINESS_DELTA,
  PLAY_HUNGER_DELTA,
  PLAY_ENERGY_DELTA,
  REST_DURATION_MS,
  REST_ENERGY_REGEN_PER_TICK,
  ACTION_COOLDOWN_MS,
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

/** Cooldown Countdown Rule: Feed/Play cooldowns tick down every tick regardless of resting state. */
export function applyCooldownCountdown(state: PetState): PetState {
  return {
    ...state,
    cooldowns: {
      feedRemainingMs: Math.max(0, state.cooldowns.feedRemainingMs - TICK_INTERVAL_MS),
      playRemainingMs: Math.max(0, state.cooldowns.playRemainingMs - TICK_INTERVAL_MS),
    },
  };
}

/**
 * Tick Process (business-logic-model.md #1): decay -> rest tick -> cooldown countdown -> recompute health.
 * Runs once per TICK_INTERVAL_MS while the app is open.
 */
export function tick(state: PetState): PetState {
  let next = applyDecay(state);
  next = applyRestTick(next);
  next = applyCooldownCountdown(next);
  next = { ...next, stats: { ...next.stats, health: computeHealth(next.stats) } };
  return next;
}

/** Feed Action: no-op (defensive) if on cooldown or resting. */
export function applyFeed(state: PetState): PetState {
  if (state.cooldowns.feedRemainingMs > 0 || state.isResting) return state;

  return {
    ...state,
    stats: { ...state.stats, hunger: clamp(state.stats.hunger + FEED_HUNGER_DELTA) },
    cooldowns: { ...state.cooldowns, feedRemainingMs: ACTION_COOLDOWN_MS },
  };
}

/** Play Action: no-op (defensive) if on cooldown or resting. */
export function applyPlay(state: PetState): PetState {
  if (state.cooldowns.playRemainingMs > 0 || state.isResting) return state;

  return {
    ...state,
    stats: {
      ...state.stats,
      happiness: clamp(state.stats.happiness + PLAY_HAPPINESS_DELTA),
      hunger: clamp(state.stats.hunger + PLAY_HUNGER_DELTA),
      energy: clamp(state.stats.energy + PLAY_ENERGY_DELTA),
    },
    cooldowns: { ...state.cooldowns, playRemainingMs: ACTION_COOLDOWN_MS },
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
