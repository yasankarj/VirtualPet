import { describe, expect, it } from "vitest";
import {
  applyCooldownCountdown,
  applyDecay,
  applyFeed,
  applyGraceCountdown,
  applyPlay,
  applyRest,
  applyRestTick,
  computeHealth,
  computeMood,
  renamePet,
  resetPet,
  validateName,
} from "../../src/domain/rules";
import {
  DECAY_PER_TICK,
  DEFAULT_PET_NAME,
  FEED_COOLDOWN_MS,
  FEED_HUNGER_DELTA,
  FEED_HUNGER_GRACE_MS,
  MAX_PET_NAME_LENGTH,
  PLAY_COOLDOWN_MS,
  PLAY_ENERGY_DELTA,
  PLAY_HAPPINESS_DELTA,
  PLAY_HAPPINESS_GRACE_MS,
  PLAY_HUNGER_DELTA,
  REST_DURATION_MS,
  REST_ENERGY_REGEN_PER_TICK,
  TICK_INTERVAL_MS,
} from "../../src/domain/constants";
import { createNewPet } from "../../src/domain/factory";
import type { PetState, PetStats } from "../../src/domain/types";

function stats(overrides: Partial<PetStats> = {}): PetStats {
  return { hunger: 50, happiness: 50, energy: 50, health: 50, ...overrides };
}

function state(overrides: Partial<PetState> = {}): PetState {
  return { ...createNewPet(), stats: stats(), ...overrides };
}

describe("applyFeed", () => {
  it("decreases hunger and sets the feed cooldown", () => {
    const result = applyFeed(state({ stats: stats({ hunger: 50 }) }));
    expect(result.stats.hunger).toBe(50 + FEED_HUNGER_DELTA);
    expect(result.cooldowns.feedRemainingMs).toBe(FEED_COOLDOWN_MS);
    expect(result.graces.hungerGraceRemainingMs).toBe(FEED_HUNGER_GRACE_MS);
  });

  it("is a no-op while on cooldown", () => {
    const s = state({ cooldowns: { feedRemainingMs: 1000, playRemainingMs: 0 } });
    expect(applyFeed(s)).toEqual(s);
  });

  it("is a no-op while resting", () => {
    const s = state({ isResting: true });
    expect(applyFeed(s)).toEqual(s);
  });
});

describe("applyPlay", () => {
  it("adjusts happiness, hunger, and energy, and sets the play cooldown", () => {
    const result = applyPlay(state({ stats: stats({ happiness: 50, hunger: 50, energy: 50 }) }));
    expect(result.stats.happiness).toBe(50 + PLAY_HAPPINESS_DELTA);
    expect(result.stats.hunger).toBe(50 + PLAY_HUNGER_DELTA);
    expect(result.stats.energy).toBe(50 + PLAY_ENERGY_DELTA);
    expect(result.cooldowns.playRemainingMs).toBe(PLAY_COOLDOWN_MS);
    expect(result.graces.happinessGraceRemainingMs).toBe(PLAY_HAPPINESS_GRACE_MS);
  });

  it("is a no-op while on cooldown", () => {
    const s = state({ cooldowns: { feedRemainingMs: 0, playRemainingMs: 1000 } });
    expect(applyPlay(s)).toEqual(s);
  });

  it("is a no-op while resting", () => {
    const s = state({ isResting: true });
    expect(applyPlay(s)).toEqual(s);
  });
});

describe("applyRest / applyRestTick", () => {
  it("enters the resting state with full duration on trigger", () => {
    const result = applyRest(state({ isResting: false }));
    expect(result.isResting).toBe(true);
    expect(result.restRemainingMs).toBe(REST_DURATION_MS);
  });

  it("is a no-op if already resting", () => {
    const s = state({ isResting: true, restRemainingMs: 3000 });
    expect(applyRest(s)).toEqual(s);
  });

  it("regenerates energy and counts down while resting", () => {
    const s = state({ isResting: true, restRemainingMs: 3000, stats: stats({ energy: 50 }) });
    const result = applyRestTick(s);
    expect(result.stats.energy).toBe(50 + REST_ENERGY_REGEN_PER_TICK);
    expect(result.restRemainingMs).toBe(3000 - TICK_INTERVAL_MS);
    expect(result.isResting).toBe(true);
  });

  it("auto-wakes when the rest duration elapses", () => {
    const s = state({ isResting: true, restRemainingMs: TICK_INTERVAL_MS });
    const result = applyRestTick(s);
    expect(result.restRemainingMs).toBe(0);
    expect(result.isResting).toBe(false);
  });

  it("is a no-op if not resting", () => {
    const s = state({ isResting: false });
    expect(applyRestTick(s)).toEqual(s);
  });
});

describe("applyDecay", () => {
  it("decays hunger up, happiness down, and energy down while awake", () => {
    const s = state({ isResting: false, stats: stats({ hunger: 50, happiness: 50, energy: 50 }) });
    const result = applyDecay(s);
    expect(result.stats.hunger).toBe(50 + DECAY_PER_TICK);
    expect(result.stats.happiness).toBe(50 - DECAY_PER_TICK);
    expect(result.stats.energy).toBe(50 - DECAY_PER_TICK);
  });

  it("leaves hunger, happiness, and energy unchanged while resting (FR-RB4)", () => {
    const s = state({ isResting: true, stats: stats({ hunger: 50, happiness: 50, energy: 50 }) });
    expect(applyDecay(s)).toEqual(s);
  });

  it("skips only Hunger decay while its grace is active (FR-DP2) — Happiness/Energy still decay", () => {
    const s = state({
      isResting: false,
      stats: stats({ hunger: 50, happiness: 50, energy: 50 }),
      graces: { hungerGraceRemainingMs: 1000, happinessGraceRemainingMs: 0 },
    });
    const result = applyDecay(s);
    expect(result.stats.hunger).toBe(50);
    expect(result.stats.happiness).toBe(50 - DECAY_PER_TICK);
    expect(result.stats.energy).toBe(50 - DECAY_PER_TICK);
  });

  it("skips only Happiness decay while its grace is active (FR-DP3) — Hunger/Energy still decay", () => {
    const s = state({
      isResting: false,
      stats: stats({ hunger: 50, happiness: 50, energy: 50 }),
      graces: { hungerGraceRemainingMs: 0, happinessGraceRemainingMs: 1000 },
    });
    const result = applyDecay(s);
    expect(result.stats.hunger).toBe(50 + DECAY_PER_TICK);
    expect(result.stats.happiness).toBe(50);
    expect(result.stats.energy).toBe(50 - DECAY_PER_TICK);
  });
});

describe("applyCooldownCountdown", () => {
  it("counts down both cooldowns without going below zero", () => {
    const s = state({ cooldowns: { feedRemainingMs: 1500, playRemainingMs: 500 } });
    const result = applyCooldownCountdown(s);
    expect(result.cooldowns.feedRemainingMs).toBe(500);
    expect(result.cooldowns.playRemainingMs).toBe(0);
  });
});

describe("applyGraceCountdown", () => {
  it("counts down both grace timers without going below zero", () => {
    const s = state({ graces: { hungerGraceRemainingMs: 1500, happinessGraceRemainingMs: 500 } });
    const result = applyGraceCountdown(s);
    expect(result.graces.hungerGraceRemainingMs).toBe(500);
    expect(result.graces.happinessGraceRemainingMs).toBe(0);
  });
});

describe("computeHealth", () => {
  it("declines when hunger is critical", () => {
    const before = stats({ hunger: 80, happiness: 50, energy: 50, health: 50 });
    expect(computeHealth(before)).toBeLessThan(50);
  });

  it("declines when happiness is critical", () => {
    const before = stats({ hunger: 10, happiness: 20, energy: 50, health: 50 });
    expect(computeHealth(before)).toBeLessThan(50);
  });

  it("declines when energy is critical", () => {
    const before = stats({ hunger: 10, happiness: 50, energy: 20, health: 50 });
    expect(computeHealth(before)).toBeLessThan(50);
  });

  it("recovers slowly when no stat is critical", () => {
    const before = stats({ hunger: 10, happiness: 80, energy: 80, health: 50 });
    expect(computeHealth(before)).toBeGreaterThan(50);
  });
});

describe("validateName", () => {
  it("returns the trimmed name when valid", () => {
    expect(validateName("  Rex  ")).toBe("Rex");
  });

  it("returns null for an empty string", () => {
    expect(validateName("")).toBeNull();
  });

  it("returns null for a whitespace-only string", () => {
    expect(validateName("   ")).toBeNull();
  });

  it("returns null when the trimmed name exceeds MAX_PET_NAME_LENGTH", () => {
    expect(validateName("a".repeat(MAX_PET_NAME_LENGTH + 1))).toBeNull();
  });

  it("accepts a name exactly at MAX_PET_NAME_LENGTH", () => {
    const name = "a".repeat(MAX_PET_NAME_LENGTH);
    expect(validateName(name)).toBe(name);
  });
});

describe("renamePet", () => {
  it("sets the trimmed name when valid", () => {
    const result = renamePet(state({ name: "Old" }), "  New Name  ");
    expect(result.name).toBe("New Name");
  });

  it("is a no-op when the new name is invalid", () => {
    const s = state({ name: "Old" });
    expect(renamePet(s, "   ")).toEqual(s);
  });
});

describe("resetPet", () => {
  it("resets stats, cooldowns, graces, and resting state to fresh-pet defaults", () => {
    const s = state({
      name: "Rex",
      stats: stats({ hunger: 90, happiness: 5, energy: 5, health: 10 }),
      isResting: true,
      restRemainingMs: 4000,
      cooldowns: { feedRemainingMs: 1000, playRemainingMs: 2000 },
      graces: { hungerGraceRemainingMs: 500, happinessGraceRemainingMs: 1500 },
    });
    const result = resetPet(s);
    expect(result).toEqual(createNewPet("Rex"));
  });

  it("preserves the pet's current name", () => {
    const result = resetPet(state({ name: "Rex" }));
    expect(result.name).toBe("Rex");
  });

  it("preserves DEFAULT_PET_NAME for a pet that was never explicitly named", () => {
    const result = resetPet(state({ name: DEFAULT_PET_NAME }));
    expect(result.name).toBe(DEFAULT_PET_NAME);
  });
});

describe("computeMood", () => {
  it("prioritizes SICK over every other condition", () => {
    expect(computeMood(stats({ health: 10, hunger: 90, energy: 5, happiness: 5 }))).toBe("SICK");
  });

  it("returns HUNGRY when hunger is critical and health is fine", () => {
    expect(computeMood(stats({ health: 100, hunger: 90, energy: 50, happiness: 50 }))).toBe("HUNGRY");
  });

  it("returns TIRED when energy is critical and hunger/health are fine", () => {
    expect(computeMood(stats({ health: 100, hunger: 10, energy: 15, happiness: 50 }))).toBe("TIRED");
  });

  it("returns SAD when happiness is critical and nothing higher-priority applies", () => {
    expect(computeMood(stats({ health: 100, hunger: 10, energy: 50, happiness: 10 }))).toBe("SAD");
  });

  it("returns HAPPY when all stats are in the happy range", () => {
    expect(computeMood(stats({ health: 100, hunger: 20, energy: 70, happiness: 70 }))).toBe("HAPPY");
  });

  it("returns NEUTRAL otherwise", () => {
    expect(computeMood(stats({ health: 100, hunger: 50, energy: 50, happiness: 50 }))).toBe("NEUTRAL");
  });
});
