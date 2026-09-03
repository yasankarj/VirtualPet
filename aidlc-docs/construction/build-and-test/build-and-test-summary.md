# Build and Test Summary

## Build Status
- **Build Tool**: Vite 5.x + TypeScript 5.x (`tsc -b && vite build`)
- **Build Status**: Success
- **Build Artifacts**: `dist/index.html`, `dist/assets/index-*.js` (147.17 kB / 47.30 kB gzip), `dist/assets/index-*.css` (0.88 kB / 0.45 kB gzip)
- **Build Time**: ~330ms

## Test Execution Summary

### Unit Tests
- **Total Tests**: 40
- **Passed**: 40
- **Failed**: 0
- **Coverage**: Not measured via a coverage tool (no coverage NFR defined); all domain rules, persistence, and components have dedicated example-based tests, plus 2 property-based test suites (clamping invariant, save/load round-trip) per the Partial Property-Based Testing extension
- **Status**: Pass

### Integration Tests
- **Test Scenarios**: 2 (domain->UI automated via `tests/App.test.tsx`; full-app manual/headless browser smoke test)
- **Passed**: 2
- **Failed**: 0
- **Status**: Pass

### Performance Tests
- **Status**: N/A — no performance NFR defined for this single-user client-only learning project (see `performance-test-instructions.md`)

### Additional Tests
- **Contract Tests**: N/A — no services/APIs (single client-only unit)
- **Security Tests**: N/A — Security Baseline extension opted out at Requirements Analysis
- **E2E Tests**: Covered by the integration-test-instructions.md Scenario 2 (headless-browser smoke test of the full user flow: load, Feed, Play, Rest, tick decay, refresh-persistence)

## Issues Found and Fixed During This Stage
1. **Node 22+ / jsdom `localStorage` conflict**: Node's experimental global `localStorage` shadowed jsdom's implementation inside Vitest's environment, causing all persistence-related tests to fail with `Cannot read properties of undefined`. Fixed by adding `cross-env NODE_OPTIONS=--no-experimental-webstorage` to the `test`/`test:watch` scripts and pinning `engines.node >= 22` in `package.json`.
2. **Incorrect test expectation**: `tests/App.test.tsx` originally asserted an unclamped negative Hunger value after a Feed click; corrected to the properly clamped `0`, matching the domain layer's actual (correct) behavior.

## Overall Status
- **Build**: Success
- **All Tests**: Pass (40/40 unit, 2/2 integration/smoke)
- **Ready for Operations**: Yes

## Next Steps
Ready to proceed to the Operations phase (currently a placeholder in this workflow) for future deployment/monitoring planning.

---

## Hunger/Feed Rebalance (2026-09-03)

### Build Status
- **Build Status**: Success — `tsc -b && vite build`, 0 errors, `dist/` output size effectively unchanged (~147.18 kB JS)

### Test Execution Summary

#### Unit Tests
- **Total Tests**: 47 (was 40) — added `tests/domain/rules.balance.test.ts` (5 tests, FR-RB1–FR-RB5 invariants) and 2 new `applyDecay` cases in `rules.test.ts`
- **Passed**: 47
- **Failed**: 0
- **Status**: Pass

#### Integration Tests
- **Test Scenarios**: 2 (same as original — domain→UI automated, full-app headless smoke test), both re-run against the rebalanced constants
- **Passed**: 2
- **Failed**: 0
- **Status**: Pass — confirmed live in the browser that Feed's cooldown is now 3s (was 5s) via the `Feed (3s)` button label, and Hunger still clamps correctly at 0

#### Additional Tests
- **Contract/Security/E2E**: Unchanged from original assessment — N/A / covered by Scenario 2 respectively (see above)

### Issues Found and Fixed During This Stage
1. **Stale hardcoded test value**: `tests/App.test.tsx` asserted Hunger dropped by a hardcoded `-15` instead of importing `FEED_HUNGER_DELTA`. It coincidentally still passed after the rebalance (`10-15` and `10-20` both clamp to `0`), which would have silently masked a real regression. Fixed to import the constant.

### Overall Status
- **Build**: Success
- **All Tests**: Pass (47/47 unit, 2/2 integration/smoke)
- **Sustainability invariants (FR-RB1–FR-RB5)**: Verified — see `tests/domain/rules.balance.test.ts` and the resolved Design Note in `business-rules.md`
- **Ready for Operations**: Yes (no change to operational posture — still a placeholder)

---

## Decay Pacing (2026-09-03)

### Build Status
- **Build Status**: Success — `tsc -b && vite build`, 0 errors, `dist/` output size effectively unchanged (~147.83 kB JS)

### Test Execution Summary

#### Unit Tests
- **Total Tests**: 54 (was 47) — added 3 new cases in `rules.test.ts` (grace-gated decay x2, `applyGraceCountdown`), 2 exact-margin cases in `rules.balance.test.ts`, 1 new `persistence.test.ts` case, 1 new `App.timing.test.tsx` file
- **Passed**: 54
- **Failed**: 0
- **Status**: Pass

#### Integration Tests
- **Test Scenarios**: 3 (2 existing, re-run; 1 new — old `.v1` save fallback, per NFR-DP3)
- **Passed**: 3
- **Failed**: 0
- **Status**: Pass — confirmed live in the browser that Hunger holds flat for a full ~3s after Feed (was near-instant resumption before this change) before resuming decay, and that an old `.v1` save is cleanly superseded by a fresh pet rather than crashing or leaking stale data

#### Additional Tests
- **Contract/Security/E2E**: Unchanged from original assessment — N/A / covered by the integration scenarios respectively

### Issues Found and Fixed During This Stage
1. **Missing test fixture field found only by property-testing shrinkage**: `tests/domain/rules.property.test.ts`'s `PetState` fixture builder (separate from `persistence.property.test.ts`'s) was missing the new `graces` field — not caught during Code Generation planning since it wasn't the file that plan explicitly named. fast-check's shrinker found a `Cannot read properties of undefined` crash on the very first test run and reduced it to a minimal counterexample. Fixed by adding `graces` to that fixture too.

### Overall Status
- **Build**: Success
- **All Tests**: Pass (54/54 unit, 3/3 integration/smoke)
- **Pacing invariants (FR-DP1–FR-DP6)**: Verified — see `tests/domain/rules.balance.test.ts`, `tests/App.timing.test.tsx`, and the resolved Design Note in `business-rules.md`; all prior FR-RB1–FR-RB5 sustainability invariants re-verified and strengthened, never loosened
- **Persistence versioning (NFR-DP3)**: Verified live — old `.v1` saves fall back cleanly to a fresh pet under the new `.v2` key
- **Ready for Operations**: Yes (no change to operational posture — still a placeholder)
