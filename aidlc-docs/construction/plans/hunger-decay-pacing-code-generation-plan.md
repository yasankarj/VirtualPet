# Code Generation Plan — Decay Pacing (unit: virtual-pet-web-app)

**Type**: Brownfield modification, all target files already exist except one new test file.

**Source of truth**: `aidlc-docs/construction/virtual-pet-web-app/functional-design/{business-rules,business-logic-model,domain-entities}.md`.

**Two findings from re-reading the current code that the Functional Design docs didn't need to call out, but Code Generation does:**
- `src/domain/persistence.ts`'s `isValidPetState` validator checks `stats` and `cooldowns` shape but has no equivalent check for the new `graces` field — needs extending, otherwise malformed/partial saved data could pass validation and later crash on `undefined.hungerGraceRemainingMs`.
- `tests/domain/persistence.property.test.ts`'s `petStateArb` fast-check arbitrary builds `PetState` objects without a `graces` field — this is now a type error against the updated `PetState`, not just a coverage gap, so it must be updated for the suite to even compile.

## Steps

- [x] **Step 1 — `src/domain/types.ts`**: add `DecayGraces` interface (`hungerGraceRemainingMs`, `happinessGraceRemainingMs`), add `graces: DecayGraces` to `PetState`.

- [x] **Step 2 — `src/domain/constants.ts`**: add `FEED_HUNGER_GRACE_MS = 2000`, `PLAY_HAPPINESS_GRACE_MS = 3000`; bump `PET_STATE_STORAGE_KEY` from `"virtualPet.state.v1"` to `"virtualPet.state.v2"`.

- [x] **Step 3 — `src/domain/factory.ts`**: `createNewPet()` returns `graces: { hungerGraceRemainingMs: 0, happinessGraceRemainingMs: 0 }` alongside the existing zeroed cooldowns.

- [x] **Step 4 — `src/domain/rules.ts`**:
  - `applyDecay`: gate Hunger decay on `graces.hungerGraceRemainingMs === 0`, gate Happiness decay on `graces.happinessGraceRemainingMs === 0`; Energy decay stays ungated (FR-DP4).
  - `applyFeed`: additionally set `graces.hungerGraceRemainingMs = FEED_HUNGER_GRACE_MS` on success (not on the no-op paths).
  - `applyPlay`: additionally set `graces.happinessGraceRemainingMs = PLAY_HAPPINESS_GRACE_MS` on success.
  - New `applyGraceCountdown(state)`: mirrors `applyCooldownCountdown` — `max(0, remaining - TICK_INTERVAL_MS)` for both grace fields.
  - `tick()`: insert `applyGraceCountdown` between `applyCooldownCountdown` and the Health recompute, per the documented 6-step Tick Process.

- [x] **Step 5 — `src/domain/persistence.ts`**: extend `isValidPetState` to also require `graces` to be an object with numeric `hungerGraceRemainingMs`/`happinessGraceRemainingMs`.

- [x] **Step 6 — `src/App.tsx`**: add a `tickEpoch` counter (`useState(0)`), include it in the tick-interval `useEffect`'s dependency array, and increment it (via a small `restartTickClock` helper) at the end of each of `onFeed`/`onPlay`/`onRest` — implementing FR-DP1 (Action-Triggered Clock Restart) exactly as designed.

- [x] **Step 7 — Business Logic Unit Testing: `tests/domain/rules.test.ts`**:
  - `applyFeed`/`applyPlay` tests: assert the relevant grace field is set to `FEED_HUNGER_GRACE_MS`/`PLAY_HAPPINESS_GRACE_MS`.
  - `applyDecay` describe block: add two new cases — Hunger grace active skips Hunger decay only (Happiness/Energy still decay normally); Happiness grace active skips Happiness decay only.
  - New `applyGraceCountdown` describe block, mirroring the existing `applyCooldownCountdown` tests.

- [x] **Step 8 — Business Logic Unit Testing: `tests/domain/rules.balance.test.ts`**: the existing 5 scenarios' directional assertions (`toBeLessThanOrEqual`/`toBeGreaterThanOrEqual`) still hold and need no logic changes, but tighten them to the exact re-verified margins from Functional Design (`-15`/cycle Feed-only, `+20`/cycle Play-only, `-102`/30s combined) for stronger regression protection, per NFR-DP2.

- [x] **Step 9 — `tests/domain/persistence.test.ts`**: add a case — saved data with a valid `stats`/`cooldowns` shape but missing/malformed `graces` falls back to a fresh default pet (proves Step 5's validator extension actually works).

- [x] **Step 10 — `tests/domain/persistence.property.test.ts`**: add `graces: fc.record({ hungerGraceRemainingMs: msArb, happinessGraceRemainingMs: msArb })` to `petStateArb` (required for the file to type-check against the updated `PetState`, in addition to coverage).

- [x] **Step 11 — New: `tests/App.timing.test.tsx`**: component-level test using `vi.useFakeTimers()` and synchronous `fireEvent.click` (not `userEvent`, to keep timer control deterministic) verifying FR-DP1: after clicking Feed, advancing fake time by just under `TICK_INTERVAL_MS` produces no further Hunger change beyond Feed's own instant effect; advancing to exactly `TICK_INTERVAL_MS` after the click (not after the original interval's start) produces the next tick.

- [x] **Step 12 — Business Logic Summary**: update `aidlc-docs/construction/virtual-pet-web-app/code/business-logic-summary.md` to record the new files/fields, the storage key bump, and the new test coverage.

No API/Repository/Frontend-Components/Deployment steps — same rationale as the prior change (client-only app, and per Functional Design, `frontend-components.md` needs no changes since `tickEpoch` is `App`'s internal implementation detail, not a new prop).

## Traceability
| Step | Requirement(s) |
|---|---|
| 1, 3, 5, 10 | Data shape for FR-DP2/FR-DP3 (`graces`), NFR-DP3 (persistence correctness) |
| 2 | NFR-DP1 (grace constants), NFR-DP3 (storage key) |
| 4 | FR-DP1 (via App, Step 6), FR-DP2, FR-DP3, FR-DP4 |
| 6 | FR-DP1 |
| 7, 8, 11 | NFR-DP2 (testable pacing behavior) |
| 9 | NFR-DP3 (persistence correctness) |
