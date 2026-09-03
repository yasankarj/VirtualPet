# Integration Test Instructions

## Purpose
This is a **single-unit, client-only application** (`virtual-pet-web-app`) — there are no separate services or units to integrate (NFR1, NFR3: no backend, no API). "Integration" here means verifying that the domain layer (`src/domain/*`) and the UI layer (`src/components/*`, `src/App.tsx`) work correctly together, and that the app functions correctly when actually run in a browser — not just when its pieces are unit-tested in isolation.

## Test Scenarios

### Scenario 1: Domain Logic -> UI Rendering (automated)
- **Description**: `App` composes `loadState()`, the domain `rules.ts` functions, and the presentational components; verifies state changes from an action flow through to the rendered DOM.
- **Setup**: None — `tests/App.test.tsx` renders `<App />` with jsdom's `localStorage` cleared.
- **Test Steps**: Render `App`; assert default stat values; click the Feed button; assert the Hunger stat bar's text updates.
- **Expected Results**: Hunger stat bar reflects `applyFeed`'s clamped result after the click.
- **Cleanup**: None (jsdom environment is torn down per test file).
- **Status**: Automated, included in `npm test` (see `unit-test-instructions.md`).

### Scenario 2: Full app in a real browser (manual/headless smoke test)
- **Description**: Confirms the app actually renders and responds to user interaction outside of jsdom — real browser layout, CSS, and event handling.
- **Setup**: `npm run dev`, wait for `http://localhost:5173` to respond.
- **Test Steps**:
  1. Load the page; confirm `PetDisplay`, all 4 `StatBar`s, and the Feed/Play/Rest buttons are visible.
  2. Click **Feed**; confirm the Hunger stat bar value decreases (clamped at 0) and the Feed button becomes disabled showing a countdown (e.g. `Feed (5s)`).
  3. Click **Play** (when its cooldown allows); confirm Happiness increases, Hunger increases, Energy decreases.
  4. Click **Rest**; confirm Feed/Play become disabled and the Rest button shows a "Sleeping... Ns" countdown; wait for it to reach 0 and confirm the pet auto-wakes (buttons re-enable per their own cooldowns).
  5. Leave the tab open and observe stat bars changing on their own every second (decay tick).
  6. Refresh the page; confirm the pet's stats persist exactly as left (no closed-time catch-up decay, per FR2/FR5).
- **Expected Results**: All of the above hold; no errors in the browser console.
- **Cleanup**: Stop the dev server (`Ctrl+C`, or `lsof -ti:5173 -sTCP:LISTEN | xargs kill`).

### Scenario 3: Old `.v1` save data falls back cleanly under the new `.v2` key (Decay Pacing)
- **Description**: Confirms the storage-key bump (`virtualPet.state.v1` -> `.v2`, introduced by Decay Pacing NFR-DP3) behaves exactly per the project's documented no-migration policy — an old save is silently superseded by a fresh pet, not a crash or corrupted read.
- **Setup**: `npm run dev`; in the browser console (or via automation), write an old `.v1`-shaped object (no `graces` field) to `localStorage` under the key `"virtualPet.state.v1"`.
- **Test Steps**: Reload the page.
- **Expected Results**: The app shows a fresh default pet (`Hunger: 10`, `Happiness: 80`, etc.) — the old `.v1` data under the old key is never read (the app only ever reads `.v2`); no console errors.
- **Cleanup**: `localStorage.clear()`, stop the dev server.

## Setup Integration Test Environment

### 1. Start Required Services
```bash
npm run dev
```
No other services required — fully client-side.

### 2. Configure Service Endpoints
Not applicable — no backend/API endpoints.

## Run Integration Tests

### 1. Execute Integration Test Suite
Scenario 1 runs as part of `npm test` (`tests/App.test.tsx`). Scenario 2 is manual (or can be automated later with Playwright if the project grows).

### 2. Verify Service Interactions
Not applicable in the multi-service sense — see Scenario 1/2 above for the domain <-> UI interaction points actually exercised.

### 3. Cleanup
```bash
lsof -ti:5173 -sTCP:LISTEN | xargs -r kill
```

## Verified Result (2026-09-03, initial build)
Both scenarios were executed during Code Generation: `tests/App.test.tsx` passes (2/2). Scenario 2 was performed with a headless Chromium (Playwright) driving the live `npm run dev` server: pet display, 4 stat bars, and all 3 action buttons rendered correctly; clicking Feed dropped Hunger 10 -> 0 (clamped) and the button entered its 5s disabled/cooldown state; zero browser console errors. Screenshots confirmed the visual result matched expectations.

## Verified Result (2026-09-03, Hunger/Feed Rebalance change)
Re-ran both scenarios against the rebalanced constants. `tests/App.test.tsx` passes (2/2, now asserting against `FEED_HUNGER_DELTA` instead of a hardcoded value). Scenario 2 re-run headlessly (Chromium): clicking Feed dropped Hunger 10 -> 0 (clamped) as before, but the Feed button now correctly shows and clears a **3-second** cooldown (`Feed (3s)` -> `Feed`) instead of the old 5-second one, confirming `FEED_COOLDOWN_MS` is live end-to-end through the UI; zero browser console errors.

## Verified Result (2026-09-03, Decay Pacing change)
Re-ran Scenario 1 (`tests/App.test.tsx`, still 2/2, plus the new `tests/App.timing.test.tsx`, 1/1). Scenario 2 re-run headlessly with a longer observation window: idled 2.2s (Hunger ticked up twice, `10 -> 20` as expected), clicked Feed (Hunger `20 -> 0`, clamped), then confirmed Hunger stayed at exactly `0` for a full ~3 seconds afterward (600ms and again checked before the grace period expired) before ticking to `5` at the ~3.1s mark — proving both the clock-restart (FR-DP1) and the grace period (FR-DP2) are live end-to-end, not just correct in isolated unit tests. Scenario 3 (new) run headlessly: wrote an old `.v1`-shaped save (no `graces`) under the old key, reloaded, confirmed the app showed a fresh default pet (`Hunger: 10`, `Happiness: 80`) rather than the old save's `77`/`33` values. Zero browser console errors across all scenarios.
