import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { applyFeed, applyPlay, applyRest, tick } from "../../src/domain/rules";
import { STAT_MAX, STAT_MIN } from "../../src/domain/constants";
import type { PetState } from "../../src/domain/types";

const statArb = fc.integer({ min: STAT_MIN, max: STAT_MAX });
const msArb = fc.integer({ min: 0, max: 20000 });

const petStateArb: fc.Arbitrary<PetState> = fc.record({
  stats: fc.record({
    hunger: statArb,
    happiness: statArb,
    energy: statArb,
    health: statArb,
  }),
  isResting: fc.boolean(),
  restRemainingMs: msArb,
  cooldowns: fc.record({
    feedRemainingMs: msArb,
    playRemainingMs: msArb,
  }),
  graces: fc.record({
    hungerGraceRemainingMs: msArb,
    happinessGraceRemainingMs: msArb,
  }),
});

type Op = "tick" | "feed" | "play" | "rest";
const opArb: fc.Arbitrary<Op> = fc.constantFrom("tick", "feed", "play", "rest");

function applyOp(state: PetState, op: Op): PetState {
  switch (op) {
    case "tick":
      return tick(state);
    case "feed":
      return applyFeed(state);
    case "play":
      return applyPlay(state);
    case "rest":
      return applyRest(state);
  }
}

describe("property: stats stay within [STAT_MIN, STAT_MAX]", () => {
  it("holds after any single operation from any valid state", () => {
    fc.assert(
      fc.property(petStateArb, opArb, (initial, op) => {
        const result = applyOp(initial, op);
        for (const value of Object.values(result.stats)) {
          expect(value).toBeGreaterThanOrEqual(STAT_MIN);
          expect(value).toBeLessThanOrEqual(STAT_MAX);
        }
      }),
    );
  });

  it("holds after any sequence of operations from any valid state", () => {
    fc.assert(
      fc.property(petStateArb, fc.array(opArb, { minLength: 0, maxLength: 50 }), (initial, ops) => {
        const result = ops.reduce(applyOp, initial);
        for (const value of Object.values(result.stats)) {
          expect(value).toBeGreaterThanOrEqual(STAT_MIN);
          expect(value).toBeLessThanOrEqual(STAT_MAX);
        }
      }),
    );
  });
});
