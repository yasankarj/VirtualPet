# Code Generation Plan — virtual-pet-web-app

**Single source of truth for Code Generation Part 2.** Execute steps in order; mark `[x]` immediately on completion.

## Unit Context
- **Stack**: React + TypeScript, Vite (build tool), Vitest + @testing-library/react (unit tests), fast-check (property-based tests — partial scope per NFR4 extension config)
- **Backend**: None — fully client-side (NFR1, NFR3). No API Layer or Repository Layer steps.
- **Code location**: workspace root (`/Users/yasankaj/Code/Learning/AIDLC`), greenfield single unit → `src/`, `tests/`
- **Source artifacts**: `aidlc-docs/construction/virtual-pet-web-app/functional-design/{business-logic-model,business-rules,domain-entities,frontend-components}.md`
- **Story/requirement traceability**: FR1–FR7, NFR1–NFR5 (see `aidlc-docs/inception/requirements/requirements.md`)
- **Automation-friendly UI**: all interactive elements get `data-testid` using `{component}-{element-role}` naming (e.g. `action-panel-feed-button`)

## Steps

### Step 1: Project Structure Setup (greenfield)
- [ ] Scaffold Vite + React + TypeScript project at workspace root (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`)
- [ ] Add Vitest + @testing-library/react + jsdom + fast-check as dev dependencies, configure `vite.config.ts` test block
- [ ] Create `src/`, `src/domain/`, `src/components/`, `src/assets/`, `tests/` directory structure

### Step 2: Business Logic Generation
*Traces: FR1, FR2, FR3, FR4, FR5, FR7, NFR4 — business-logic-model.md, business-rules.md, domain-entities.md*
- [ ] `src/domain/types.ts` — `PetStats`, `ActionCooldowns`, `PetState`, `MoodState` types (domain-entities.md)
- [ ] `src/domain/constants.ts` — all tunable constants (business-rules.md Constants table)
- [ ] `src/domain/rules.ts` — pure functions: `clamp`, `applyDecay`, `applyFeed`, `applyPlay`, `applyRest` (trigger), `applyRestTick`, `applyCooldownCountdown`, `computeHealth`, `computeMood`, `tick` (composes decay + rest + cooldown + health per business-logic-model.md #1)
- [ ] `src/domain/persistence.ts` — `loadState`, `saveState` for `localStorage` key `virtualPet.state.v1`, with corrupted/missing-data fallback to `createNewPet()`
- [ ] `src/domain/factory.ts` — `createNewPet()` using `NEW_PET_STARTING_STATS`

### Step 3: Business Logic Unit Testing
*Property-Based Testing extension: Partial — applies here to pure functions & serialization round-trip (per requirements.md Extension Configuration)*
- [ ] `tests/domain/rules.test.ts` — example-based tests for `applyFeed`, `applyPlay`, `applyRest`/`applyRestTick`, `computeHealth`, `computeMood` (priority order), `applyCooldownCountdown`
- [ ] `tests/domain/rules.property.test.ts` — fast-check property tests: all stat fields always stay within `[STAT_MIN, STAT_MAX]` after any sequence of `tick`/`applyFeed`/`applyPlay`/`applyRest` operations (clamping invariant)
- [ ] `tests/domain/persistence.test.ts` — example tests: corrupted/missing `localStorage` falls back to new-pet default
- [ ] `tests/domain/persistence.property.test.ts` — fast-check property test: `loadState(saveState(x)) === x` round-trip for arbitrary valid `PetState`

### Step 4: Business Logic Summary
- [ ] Write `aidlc-docs/construction/virtual-pet-web-app/code/business-logic-summary.md` documenting files created and test coverage

### Step 5: Frontend Components Generation
*Traces: FR7, NFR2 — frontend-components.md*
- [ ] `src/components/StatBar.tsx` — reusable stat bar (`label`, `value`, `isDetrimental` props), `data-testid="stat-bar-{label}"`
- [ ] `src/components/PetDisplay.tsx` — mood image/emoji + label lookup table, `data-testid="pet-display"`
- [ ] `src/components/ActionPanel.tsx` — Feed/Play/Rest buttons with disabled + countdown display, `data-testid="action-panel-feed-button"` / `-play-button` / `-rest-button`
- [ ] `src/App.tsx` — root component: `useState` lazy-init from `loadState()`, tick `useInterval`/`useEffect`, action handlers, persistence `useEffect`, composes `PetDisplay` + 4x `StatBar` + `ActionPanel`
- [ ] `src/assets/` — simple emoji/placeholder mood art mapping (no copyrighted imagery, per FR7 resolution)
- [ ] `src/main.tsx`, `src/index.css` — app entry point and minimal styling

### Step 6: Frontend Components Unit Testing
- [ ] `tests/components/StatBar.test.tsx` — renders value, applies correct color direction for `isDetrimental`
- [ ] `tests/components/PetDisplay.test.tsx` — renders correct image/label per mood
- [ ] `tests/components/ActionPanel.test.tsx` — buttons disabled during cooldown/resting, click fires callback when enabled, countdown text shown
- [ ] `tests/App.test.tsx` — integration-style: initial render shows default pet when no saved state; clicking Feed updates Hunger stat display

### Step 7: Frontend Components Summary
- [ ] Write `aidlc-docs/construction/virtual-pet-web-app/code/frontend-components-summary.md` documenting components, test coverage, and how they map to frontend-components.md

### Step 8: Documentation Generation
- [ ] `README.md` (workspace root) — project description, how to run (`npm install`, `npm run dev`), how to test (`npm test`), tunable constants pointer (`src/domain/constants.ts`)

### Step 9: Deployment Artifacts Generation
- [ ] N/A — static client-only app (NFR5: no cloud hosting/backend). `npm run build` (already provided by Vite scaffold) is the only "deployment artifact"; no additional config needed. Documented as N/A in code summary, not skipped silently.

## Steps Not Applicable (and why)
- **API Layer Generation/Testing/Summary** — no backend (NFR1, NFR3)
- **Repository Layer Generation/Testing/Summary** — no backend/database; persistence is `localStorage` via `src/domain/persistence.ts`, covered in Step 2/3
- **Database Migration Scripts** — no database
