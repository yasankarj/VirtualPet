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

## Verified Result (2026-09-03)
Both scenarios were executed during Code Generation: `tests/App.test.tsx` passes (2/2). Scenario 2 was performed with a headless Chromium (Playwright) driving the live `npm run dev` server: pet display, 4 stat bars, and all 3 action buttons rendered correctly; clicking Feed dropped Hunger 10 -> 0 (clamped) and the button entered its 5s disabled/cooldown state; zero browser console errors. Screenshots confirmed the visual result matched expectations.
