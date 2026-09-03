# Unit Test Execution

## Run Unit Tests

### 1. Execute All Unit Tests
```bash
npm test
```
Runs Vitest once (`vitest run`) over every file under `tests/`, including the example-based tests and the fast-check property-based tests (Property-Based Testing extension: Partial scope — pure functions and serialization round-trips only, per `requirements.md` Extension Configuration).

For interactive/watch mode during development:
```bash
npm run test:watch
```

### 2. Review Test Results
- **Expected**: 54 tests pass, 0 failures, across 10 test files.
- **Test Coverage** (by area):
  - `tests/domain/rules.test.ts` (27 tests) — Feed/Play/Rest effects and no-op preconditions, Decay Rule while awake/resting/grace-gated, cooldown + grace countdown, Health decline/recovery, full Mood priority order
  - `tests/domain/rules.property.test.ts` (2 tests) — clamping invariant across arbitrary single ops and sequences (fixture includes `graces`)
  - `tests/domain/rules.balance.test.ts` (7 tests) — Hunger/Feed Rebalance + Decay Pacing sustainability invariants (FR-RB1–FR-RB5, FR-DP1–FR-DP6), including exact-margin regression checks
  - `tests/domain/persistence.test.ts` (5 tests) — missing/corrupted/`graces`-missing `localStorage` fallback, valid round-trip
  - `tests/domain/persistence.property.test.ts` (1 test) — `loadState(saveState(x)) === x` for arbitrary valid state (fixture includes `graces`)
  - `tests/components/StatBar.test.tsx` (3 tests), `PetDisplay.test.tsx` (2 tests), `ActionPanel.test.tsx` (4 tests)
  - `tests/App.test.tsx` (2 tests) — default-state render, Feed click updates the UI end-to-end
  - `tests/App.timing.test.tsx` (1 test) — fake-timer proof that the tick clock restarts on Feed (FR-DP1)
- **Test Report Location**: Console output from `npm test` (Vitest's default reporter); no separate report file is generated.

### 3. Fix Failing Tests
If tests fail:
1. Review the Vitest console output — it prints the failing assertion, expected vs. received values, and file:line.
2. Identify whether the failure is a code bug (fix `src/domain/*` or `src/components/*`) or a test bug (fix the test's expectation — e.g. an unclamped value).
3. Rerun `npm test` until all pass.

## Verified Result (2026-09-03, initial build)
`npm test` was run and passed: **40/40 tests, 8/8 files, 0 failures.** One real issue was found and fixed during this pass: a Node 22+/jsdom `localStorage` conflict in the test environment (resolved via `NODE_OPTIONS=--no-experimental-webstorage`, wired into the `test` script) and one incorrect test expectation in `App.test.tsx` (expected an unclamped negative Hunger value instead of the correctly clamped `0`).

## Verified Result (2026-09-03, Hunger/Feed Rebalance change)
`npm test` was run and passed: **47/47 tests, 9/9 files, 0 failures** (added the new `rules.balance.test.ts` file — 5 tests — plus 2 new `applyDecay` cases in `rules.test.ts`, for a net +7 over the previous 40). One issue was found and fixed during this pass: `App.test.tsx`'s Feed-click assertion hardcoded the literal `-15` instead of importing `FEED_HUNGER_DELTA` — it happened to still pass after the rebalance only because both `10-15` and `10-20` clamp to the same `0`, which would have silently masked a real regression. Fixed to import the constant instead of hardcoding the delta.

## Verified Result (2026-09-03, Decay Pacing change)
`npm test` was run and passed: **54/54 tests, 10/10 files, 0 failures** (net +7 over the previous 47: 3 new cases in `rules.test.ts`, 2 new exact-margin cases in `rules.balance.test.ts`, 1 new `persistence.test.ts` case, 1 new `App.timing.test.tsx` file). One issue was found and fixed during this pass that wasn't in the original Code Generation plan: `tests/domain/rules.property.test.ts` has its own separate `PetState` fixture builder (distinct from `persistence.property.test.ts`'s) that also needed a `graces` field — fast-check's shrinker immediately surfaced this via a `Cannot read properties of undefined (reading 'hungerGraceRemainingMs')` crash on its first run. Fixed by adding `graces` to that fixture too.
