import { describe, expect, it } from "vitest";
import { applyFeed, applyPlay, tick } from "../../src/domain/rules";
import {
  CRITICAL_HUNGER_THRESHOLD,
  DECAY_PER_TICK,
  FEED_COOLDOWN_MS,
  PLAY_COOLDOWN_MS,
  REST_DURATION_MS,
  REST_ENERGY_REGEN_PER_TICK,
  TICK_INTERVAL_MS,
} from "../../src/domain/constants";
import { createNewPet } from "../../src/domain/factory";
import type { PetState, PetStats } from "../../src/domain/types";

/**
 * Balance invariant tests (NFR-RB1) — see the "Balance Caveat Resolved" note in
 * aidlc-docs/construction/virtual-pet-web-app/functional-design/business-rules.md
 * for the invariants (FR-RB1..FR-RB5) these scenarios verify.
 */

const FEED_CYCLE_TICKS = FEED_COOLDOWN_MS / TICK_INTERVAL_MS;
const PLAY_CYCLE_TICKS = PLAY_COOLDOWN_MS / TICK_INTERVAL_MS;

function stats(overrides: Partial<PetStats> = {}): PetStats {
  return { hunger: 50, happiness: 50, energy: 50, health: 50, ...overrides };
}

function state(overrides: Partial<PetState> = {}): PetState {
  return { ...createNewPet(), stats: stats(), ...overrides };
}

describe("FR-RB1: optimal Feed-only play keeps Hunger sustainable", () => {
  it("does not let Hunger trend upward over several Feed cooldown cycles", () => {
    let s = state({ stats: stats({ hunger: 50 }) });
    const startingHunger = s.stats.hunger;

    for (let i = 0; i < FEED_CYCLE_TICKS * 6; i++) {
      if (s.cooldowns.feedRemainingMs === 0 && !s.isResting) {
        s = applyFeed(s);
      }
      s = tick(s);
    }

    expect(s.stats.hunger).toBeLessThanOrEqual(startingHunger);
  });

  it("nets exactly -15 Hunger per Feed cooldown cycle, per the Decay Pacing design contract", () => {
    let s = state({ stats: stats({ hunger: 60 }) });

    for (let i = 0; i < FEED_CYCLE_TICKS; i++) {
      if (s.cooldowns.feedRemainingMs === 0 && !s.isResting) {
        s = applyFeed(s);
      }
      s = tick(s);
    }

    expect(s.stats.hunger).toBe(45);
  });
});

describe("FR-RB2: optimal Feed + Play combined does not undo Hunger sustainability", () => {
  it("does not let Hunger trend upward when both actions are used diligently", () => {
    let s = state({ stats: stats({ hunger: 50 }) });
    const startingHunger = s.stats.hunger;

    for (let i = 0; i < 30; i++) {
      if (s.cooldowns.feedRemainingMs === 0 && !s.isResting) {
        s = applyFeed(s);
      }
      if (s.cooldowns.playRemainingMs === 0 && !s.isResting) {
        s = applyPlay(s);
      }
      s = tick(s);
    }

    expect(s.stats.hunger).toBeLessThanOrEqual(startingHunger);
  });
});

describe("FR-RB3: optimal Play-only play keeps Happiness sustainable", () => {
  it("does not let Happiness trend downward over several Play cooldown cycles", () => {
    let s = state({ stats: stats({ happiness: 50 }) });
    const startingHappiness = s.stats.happiness;

    for (let i = 0; i < PLAY_CYCLE_TICKS * 4; i++) {
      if (s.cooldowns.playRemainingMs === 0 && !s.isResting) {
        s = applyPlay(s);
      }
      s = tick(s);
    }

    expect(s.stats.happiness).toBeGreaterThanOrEqual(startingHappiness);
  });

  it("nets exactly +20 Happiness per Play cooldown cycle, per the Decay Pacing design contract", () => {
    let s = state({ stats: stats({ happiness: 50 }) });

    for (let i = 0; i < PLAY_CYCLE_TICKS; i++) {
      if (s.cooldowns.playRemainingMs === 0 && !s.isResting) {
        s = applyPlay(s);
      }
      s = tick(s);
    }

    expect(s.stats.happiness).toBe(70);
  });
});

describe("FR-RB4: Resting pauses Hunger and Happiness (not just Energy)", () => {
  it("leaves Hunger/Happiness unchanged and regenerates Energy across a full Rest cycle", () => {
    let s = state({
      isResting: true,
      restRemainingMs: REST_DURATION_MS,
      stats: stats({ hunger: 50, happiness: 50, energy: 30 }),
    });

    const restTicks = REST_DURATION_MS / TICK_INTERVAL_MS;
    for (let i = 0; i < restTicks; i++) {
      s = tick(s);
    }

    expect(s.stats.hunger).toBe(50);
    expect(s.stats.happiness).toBe(50);
    expect(s.stats.energy).toBe(30 + restTicks * REST_ENERGY_REGEN_PER_TICK);
    expect(s.isResting).toBe(false);
    expect(s.restRemainingMs).toBe(0);
  });
});

describe("FR-RB5: total neglect is unaffected by the rebalance (guardrail)", () => {
  it("still crosses the critical Hunger threshold at the same pace as before, and Health then declines", () => {
    let s = createNewPet();
    const startingHunger = s.stats.hunger;
    const expectedTicksToCritical = Math.ceil(
      (CRITICAL_HUNGER_THRESHOLD - startingHunger) / DECAY_PER_TICK,
    );

    let ticksElapsed = 0;
    while (s.stats.hunger < CRITICAL_HUNGER_THRESHOLD) {
      s = tick(s);
      ticksElapsed++;
    }

    expect(ticksElapsed).toBe(expectedTicksToCritical);

    const healthAtCritical = s.stats.health;
    s = tick(s);
    expect(s.stats.health).toBeLessThan(healthAtCritical);
  });
});
