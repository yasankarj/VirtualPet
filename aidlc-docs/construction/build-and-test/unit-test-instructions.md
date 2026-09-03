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
- **Expected**: 40 tests pass, 0 failures, across 8 test files.
- **Test Coverage** (by area):
  - `tests/domain/rules.test.ts` (22 tests) — Feed/Play/Rest effects and no-op preconditions, cooldown countdown, Health decline/recovery, full Mood priority order
  - `tests/domain/rules.property.test.ts` (2 tests) — clamping invariant across arbitrary single ops and sequences
  - `tests/domain/persistence.test.ts` (4 tests) — missing/corrupted `localStorage` fallback, valid round-trip
  - `tests/domain/persistence.property.test.ts` (1 test) — `loadState(saveState(x)) === x` for arbitrary valid state
  - `tests/components/StatBar.test.tsx` (3 tests), `PetDisplay.test.tsx` (2 tests), `ActionPanel.test.tsx` (4 tests)
  - `tests/App.test.tsx` (2 tests) — default-state render, Feed click updates the UI end-to-end
- **Test Report Location**: Console output from `npm test` (Vitest's default reporter); no separate report file is generated.

### 3. Fix Failing Tests
If tests fail:
1. Review the Vitest console output — it prints the failing assertion, expected vs. received values, and file:line.
2. Identify whether the failure is a code bug (fix `src/domain/*` or `src/components/*`) or a test bug (fix the test's expectation — e.g. an unclamped value).
3. Rerun `npm test` until all pass.

## Verified Result (2026-09-03)
`npm test` was run and passed: **40/40 tests, 8/8 files, 0 failures.** One real issue was found and fixed during this pass: a Node 22+/jsdom `localStorage` conflict in the test environment (resolved via `NODE_OPTIONS=--no-experimental-webstorage`, wired into the `test` script) and one incorrect test expectation in `App.test.tsx` (expected an unclamped negative Hunger value instead of the correctly clamped `0`).
