# Frontend Components Summary — virtual-pet-web-app

## Files Created

| File | Maps to (frontend-components.md) |
|---|---|
| `src/components/StatBar.tsx` | `StatBar` — reusable 0-100 bar, `isDetrimental` flips the color scale (red-at-high for Hunger, green-at-high for the rest) |
| `src/components/PetDisplay.tsx` | `PetDisplay` — mood → emoji/label lookup (`src/assets/moods.ts`), pure presentational |
| `src/components/ActionPanel.tsx` | `ActionPanel` — Feed/Play/Rest buttons; disabled + countdown text driven by cooldown/resting props |
| `src/App.tsx` | `App` — holds `PetState`, runs the tick interval, action handlers, `localStorage` persistence effect, composes the three child components |
| `src/assets/moods.ts` | Mood → emoji/label table (FR7: simple AI-placeholder art, not copyrighted imagery) |
| `src/main.tsx`, `src/index.css` | App entry point and styling |

`data-testid` attributes follow `{component}-{element-role}`: `pet-display`, `stat-bar-{label}`, `action-panel-feed-button`, `action-panel-play-button`, `action-panel-rest-button`.

## Test Coverage

| File | Covers |
|---|---|
| `tests/components/StatBar.test.tsx` | Label/value text, color direction for detrimental vs. beneficial stats |
| `tests/components/PetDisplay.test.tsx` | Correct label per mood |
| `tests/components/ActionPanel.test.tsx` | Click fires callback when enabled; disabled + countdown text during cooldown; Feed/Play disabled and Rest countdown shown while resting |
| `tests/App.test.tsx` | Default stats render with no saved state; clicking Feed updates the Hunger stat display end-to-end |

## Traceability
FR7 (visual representation, stat display), NFR2 (single-page layout, obvious cooldown state).

## Refresh Game & Pet Naming/Renaming (2026-09-03)

### Files Modified/Created
| File | Maps to (frontend-components.md) |
|---|---|
| `src/components/NameDialog.tsx` (new) | `NameDialog` — themed modal, shared by first-launch naming and rename via `mode` prop |
| `src/components/RefreshButton.tsx` (new) | `RefreshButton` — single no-confirmation control at the bottom of the page |
| `src/components/PetDisplay.tsx` | Now shows the pet's name plus a Rename control alongside the mood art |
| `src/App.tsx` | New `showNamingPrompt`/`showRenameDialog` state, `handleRefresh`, composes the two new components |
| `src/index.css` | Themed modal styling (animated entrance, close button, input, inline error), pet name row, Refresh button styling |

New `data-testid`s: `pet-display-name`, `pet-display-rename-button`, `refresh-button`, `name-dialog`, `name-dialog-input`, `name-dialog-save-button`, `name-dialog-close-button`, `name-dialog-error`.

### Test Coverage
| File | Covers |
|---|---|
| `tests/components/PetDisplay.test.tsx` | Renders the pet's name; rename button fires `onRenameClick` |
| `tests/components/NameDialog.test.tsx` | Mode-driven heading/labels; valid save trims and calls `onSave`; empty/whitespace-only submission shows inline error without calling `onSave`; input capped at `MAX_PET_NAME_LENGTH`; close button calls `onDismiss`; rename mode pre-fills from `currentName` |
| `tests/components/RefreshButton.test.tsx` | Click fires `onRefresh` |
| `tests/App.naming.test.tsx` | End-to-end naming/rename/refresh flows through `App` (see `business-logic-summary.md` for the full list) |

### Traceability
FR-NR1 (Refresh control), FR-NR3–FR-NR5 (naming/rename UI), FR-NR6 (inline validation feedback).

## Deployment Artifacts (Step 9)
N/A — static client-only app (NFR5: no cloud hosting, no backend). `npm run build` (Vite scaffold, `package.json` script) produces the static `dist/` bundle; no additional deployment configuration is required for this learning project.
