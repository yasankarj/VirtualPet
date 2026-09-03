import { beforeEach, describe, expect, it } from "vitest";
import fc from "fast-check";
import { loadState, saveState } from "../../src/domain/persistence";
import { MAX_PET_NAME_LENGTH, STAT_MAX, STAT_MIN } from "../../src/domain/constants";
import type { PetState } from "../../src/domain/types";

const statArb = fc.integer({ min: STAT_MIN, max: STAT_MAX });
const msArb = fc.integer({ min: 0, max: 20000 });
const nameArb = fc.string({ minLength: 1, maxLength: MAX_PET_NAME_LENGTH });

const petStateArb: fc.Arbitrary<PetState> = fc.record({
  name: nameArb,
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

describe("property: save/load round-trip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadState(saveState(x)) reproduces x for any valid PetState", () => {
    fc.assert(
      fc.property(petStateArb, (petState) => {
        saveState(petState);
        expect(loadState()).toEqual(petState);
      }),
    );
  });
});
