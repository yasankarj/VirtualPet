# Code Generation Plan — Refresh Game & Pet Naming/Renaming (unit: virtual-pet-web-app)

**Workspace root**: `/Users/yasankaj/Code/Learning/AIDLC` (existing project — modify in place, no new scaffolding needed)
**Source of truth**: `aidlc-docs/construction/virtual-pet-web-app/functional-design/*.md` (as updated for this change)

## Steps

### Domain Layer

- [x] **Step 1 — `src/domain/types.ts`**: add `name: string` as a new field on `PetState`.
- [x] **Step 2 — `src/domain/constants.ts`**: add `DEFAULT_PET_NAME = "Pet"` and `MAX_PET_NAME_LENGTH = 20`; bump `PET_STATE_STORAGE_KEY` from `virtualPet.state.v2` to `virtualPet.state.v3`.
- [x] **Step 3 — `src/domain/factory.ts`**: `createNewPet` takes an optional `name: string = DEFAULT_PET_NAME` parameter and includes it in the returned `PetState`.
- [x] **Step 4 — `src/domain/rules.ts`**: add `validateName(raw: string): string | null` (trim, reject empty or over `MAX_PET_NAME_LENGTH`), `renamePet(state, newName): PetState` (defensive no-op on invalid name), `resetPet(state): PetState` (delegates to `createNewPet(state.name)` — same fresh-pet defaults, name carried over).
- [x] **Step 5 — `src/domain/persistence.ts`**: `isValidPetState` requires `typeof v.name === "string"`; add `hasSavedPet(): boolean` (true only if a currently-valid `PetState` already exists under the storage key — used to gate the first-launch naming prompt, independent of `loadState`'s fallback behavior).

### Domain Layer — Tests

- [x] **Step 6 — `tests/domain/rules.test.ts`**: add `describe` blocks for `validateName` (valid/trims/empty/over-limit), `renamePet` (valid rename, no-op on invalid), `resetPet` (stats/cooldowns/graces/resting reset to fresh-pet defaults, name preserved).
- [x] **Step 7 — `tests/domain/persistence.test.ts`**: add a case — saved data missing the `name` field falls back to a fresh default pet (mirrors the existing missing-`graces` case); add a `describe("hasSavedPet")` block (false when nothing/invalid saved, true after a valid save).
- [x] **Step 8 — `tests/domain/rules.property.test.ts`** and **`tests/domain/persistence.property.test.ts`**: add a `name` generator (`fc.string({ minLength: 1, maxLength: MAX_PET_NAME_LENGTH })`) to each file's `petStateArb` so the fixtures type-check against the updated `PetState` (same fix pattern used when `graces` was added).

### Frontend Layer

- [x] **Step 9 — new `src/components/NameDialog.tsx`**: modal component, `{ mode: "initial" | "rename", currentName?: string, onSave: (name: string) => void, onDismiss: () => void }`. Themed heading per mode, text input (pre-filled in `rename` mode), a large close (×) control (Escape key mirrors it; backdrop click does nothing), Save button that calls `validateName` and either calls `onSave` or shows an inline error and keeps the dialog open. `data-testid`s: `name-dialog`, `name-dialog-input`, `name-dialog-save-button`, `name-dialog-close-button`, `name-dialog-error`.
- [x] **Step 10 — new `src/components/RefreshButton.tsx`**: `{ onRefresh: () => void }`, single button, no confirmation, `data-testid="refresh-button"`.
- [x] **Step 11 — `src/components/PetDisplay.tsx`**: add `name: string` and `onRenameClick: () => void` props; render the name plus a Rename control (`data-testid`s: `pet-display-name`, `pet-display-rename-button`) alongside the existing mood art.
- [x] **Step 12 — `src/App.tsx`**: add `showNamingPrompt` state (lazy-initialized from `!hasSavedPet()`) and `showRenameDialog` state (default `false`); add `handleRefresh` (applies `resetPet`, restarts the tick clock like the other actions); wire `PetDisplay`'s new props; conditionally render `NameDialog` (mode `"initial"`, dismiss just hides the prompt — the fresh pet's name is already `DEFAULT_PET_NAME` from Step 3, so no extra state write is needed on skip) and `NameDialog` (mode `"rename"`, dismiss hides it with no change); render `RefreshButton` at the bottom of the page.
- [x] **Step 13 — `src/index.css`**: styles for the modal (backdrop, themed dialog frame, animated entrance, close button, input, inline error), the pet name row + rename control, and the Refresh button (styled as a secondary/utility action, distinct from the primary `ActionPanel` buttons).

### Frontend Layer — Tests

- [x] **Step 14 — `tests/components/PetDisplay.test.tsx`**: update existing tests for the new `name`/`onRenameClick` props; add a case asserting the Rename button fires `onRenameClick`.
- [x] **Step 15 — new `tests/components/NameDialog.test.tsx`**: renders correct heading/button labels per `mode`; Save with a valid name calls `onSave` with the trimmed value; Save with an invalid name (empty/whitespace-only/over 20 chars) shows the inline error and does not call `onSave`; clicking the close button calls `onDismiss`; `rename` mode pre-fills the input from `currentName`.
- [x] **Step 16 — new `tests/components/RefreshButton.test.tsx`**: click fires `onRefresh`.
- [x] **Step 17 — `tests/App.test.tsx`** and **`tests/App.timing.test.tsx`**: change `beforeEach` to seed `localStorage` with `saveState(createNewPet())` (via `hasSavedPet()` returning `true`) instead of only `localStorage.clear()`, so these existing tests (which predate naming and aren't about it) continue to render straight into the normal game view without the first-launch prompt appearing.
- [x] **Step 18 — new `tests/App.naming.test.tsx`**: with a genuinely empty `localStorage`, asserts the naming prompt appears on first render; Skip (close button) assigns `DEFAULT_PET_NAME` and never reappears on a subsequent mount; entering a valid name and saving sets and persists it; an invalid submission shows the inline error and keeps the prompt open. With a pre-seeded saved pet: the prompt never appears; opening Rename pre-fills the current name, Cancel leaves it unchanged, Save with a new valid name updates the displayed name and persists it; clicking Refresh immediately (no dialog) resets the stat bars to `NEW_PET_STARTING_STATS` and clears any active Feed/Play cooldown, while the pet's name stays exactly as it was.

### Documentation

- [x] **Step 19 — `aidlc-docs/construction/virtual-pet-web-app/code/business-logic-summary.md`**: append a "Refresh Game & Pet Naming/Renaming" section documenting the new files/functions/tests, storage key bump to `.v3`.
- [x] **Step 20 — `aidlc-docs/construction/virtual-pet-web-app/code/frontend-components-summary.md`**: append the same for the new/changed components and their tests, new `data-testid`s.

## Story/Requirement Traceability
| Step(s) | Requirement |
|---|---|
| 1, 2, 3, 5 | FR-NR7 (name persistence), NFR-NR1 (storage key bump) |
| 4, 6 | FR-NR6 (validation), FR-NR5 (rename) |
| 4 (resetPet), 6 | FR-NR1, FR-NR2, NFR-NR2 (reset preserves name, no invariant regression) |
| 5, 7 | FR-NR3 (first-launch detection) |
| 9, 12, 15, 18 | FR-NR3, FR-NR4 (initial naming + skip default) |
| 9, 11, 12, 14, 15, 18 | FR-NR5 (rename, any time) |
| 10, 12, 16, 18 | FR-NR1, NFR-NR3 (refresh, no confirmation) |

This plan is the single source of truth for this stage's Part 2 (Generation) — steps will be executed and checked off in order.
