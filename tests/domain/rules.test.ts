import { describe, expect, it } from "vitest";
import {
  applyFeed,
  applyPlay,
  applyRest,
  applyRestTick,
  computeHealth,
  computeMood,
} from "../../src/domain/rules";
import {
  FEED_ENERGY_DELTA,
  FEED_HUNGER_DELTA,
  PLAY_ENERGY_DELTA,
  PLAY_HAPPINESS_DELTA,
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
  it("decreases hunger and increases energy, with no cooldown", () => {
    const result = applyFeed(state({ stats: stats({ hunger: 50, energy: 50 }) }));
    expect(result.stats.hunger).toBe(50 + FEED_HUNGER_DELTA);
    expect(result.stats.energy).toBe(50 + FEED_ENERGY_DELTA);
  });

  it("is a no-op while resting", () => {
    const s = state({ isResting: true });
    expect(applyFeed(s)).toEqual(s);
  });

  it("is a no-op once hunger has reached 0", () => {
    const s = state({ stats: stats({ hunger: 0 }) });
    expect(applyFeed(s)).toEqual(s);
  });
});

describe("applyPlay", () => {
  it("adjusts happiness, hunger, and energy, with no cooldown", () => {
    const result = applyPlay(state({ stats: stats({ happiness: 50, hunger: 50, energy: 50 }) }));
    expect(result.stats.happiness).toBe(50 + PLAY_HAPPINESS_DELTA);
    expect(result.stats.hunger).toBe(50 + PLAY_HUNGER_DELTA);
    expect(result.stats.energy).toBe(50 + PLAY_ENERGY_DELTA);
  });

  it("is a no-op while resting", () => {
    const s = state({ isResting: true });
    expect(applyPlay(s)).toEqual(s);
  });

  it("is a no-op once happiness has reached 100", () => {
    const s = state({ stats: stats({ happiness: 100 }) });
    expect(applyPlay(s)).toEqual(s);
  });

  it("is a no-op once energy has reached 0", () => {
    const s = state({ stats: stats({ energy: 0 }) });
    expect(applyPlay(s)).toEqual(s);
  });

  it("is a no-op once health has reached 0", () => {
    const s = state({ stats: stats({ health: 0 }) });
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
