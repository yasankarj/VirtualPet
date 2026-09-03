# Frontend Components — virtual-pet-web-app

Structure chosen: decomposed components (Q9: A).

## Component Hierarchy
```
App
 +-- PetDisplay    (pet name + Rename control + mood image/label)
 +-- StatBar x4    (Hunger, Happiness, Energy, Health)
 +-- ActionPanel   (Feed, Play, Rest buttons)
 +-- RefreshButton (bottom of the page)
 +-- NameDialog    (conditionally rendered overlay — "initial" or "rename" mode)
```

## State Management
- **Single source of truth**: `App` holds `PetState` in a `useState` hook.
- **Game loop**: `App` runs one `useEffect` with `setInterval(tick, TICK_INTERVAL_MS)`, cleared on unmount. Each tick calls the tick-process logic (business-logic-model.md #1) and calls `setPetState`.
- **Actions**: `App` defines `handleFeed`, `handlePlay`, `handleRest` callbacks (each validates preconditions, applies the relevant rule, calls `setPetState`) and passes them down to `ActionPanel`.
- **Persistence**: a `useEffect` on `petState` change writes to `localStorage` (business-logic-model.md #6 save path); initial state is read synchronously via `useState(() => loadState())` (lazy initializer) so there's no flash of default values before the saved pet loads.
- **Derived values** (mood, cooldown-remaining display, "is action available" booleans) are computed inline from `petState` on each render — not stored as separate state, since they're pure functions of it.
- **First-launch naming** (new): `App` adds `showNamingPrompt: boolean`, initialized via `useState(() => !hasSavedPet())` — a second lazy initializer evaluated at the same mount-time point as the `petState` one, so it captures whether a save existed *before* this session wrote anything (business-logic-model.md #7). Saving or skipping the prompt sets this to `false`.
- **Rename** (new): `App` adds `showRenameDialog: boolean` (default `false`), toggled by the Rename control in `PetDisplay` and by the rename dialog's Save/Cancel.
- **Refresh** (new): `App` defines `handleRefresh` — applies the Reset Rule, restarts the tick timer (same pattern as Feed/Play/Rest), calls `setPetState`. No confirmation step (NFR-NR3).

## Components

### `App`
- **State**: `petState: PetState`, `showNamingPrompt: boolean`, `showRenameDialog: boolean`
- **Responsibilities**: game loop timer, action handlers (Feed/Play/Rest/Refresh), naming/rename dialog visibility, load/save to `localStorage`, composes the child components.
- **No props** (root component).

### `PetDisplay`
- **Props**: `{ name: string, mood: MoodState, onRenameClick: () => void }`
- **Renders**: the pet's name as a heading, with a small Rename control next to it (calls `onRenameClick` — opens the rename dialog in `App`); below that, the existing mood-appropriate image/emoji and short text label (e.g. "Happy", "Hungry", "Sick"). The mood-mapping part stays pure/presentational, as before; the name/Rename portion is new (Refresh/Naming FR-NR5).

### `RefreshButton` (new — Refresh/Naming FR-NR1)
- **Props**: `{ onRefresh: () => void }`
- **Renders**: a single control at the bottom of the page. Styled as a clearly secondary/utility action (visually distinct from the primary Feed/Play/Rest buttons in `ActionPanel`), since it's a "start over" utility rather than core gameplay.
- **User interactions**: click calls `onRefresh` immediately — **no confirmation step** (NFR-NR3, Q3:B).

### `NameDialog` (new — Refresh/Naming FR-NR3/FR-NR4/FR-NR5/FR-NR6)
- **Props**: `{ mode: "initial" | "rename", currentName?: string, onSave: (name: string) => void, onDismiss: () => void }`
- **Renders**: a modal overlay (Q1:C — "modal overlay... should be game-friendly, not a typical web-app modal": styled as an in-theme dialog — rounded/playful frame consistent with the pet's mood-art aesthetic, an animated entrance, and a mode-appropriate heading, e.g. "🐾 Name Your Pet!" for `initial` vs. "✏️ Rename [current name]" for `rename` — rather than a generic gray browser-style popup):
  - A text input, pre-filled with `currentName` when `mode === "rename"`, empty (with a placeholder like "Enter a name...") when `mode === "initial"`.
  - A **large close (×) control** in the corner (Q2's "Other" answer) — clicking it, or pressing Escape, calls `onDismiss` immediately. Clicking the modal backdrop does **not** dismiss it (deliberate: avoids an accidental skip/cancel from a stray click, since Q2/Q3 only specified the × control and Escape as intentional dismiss actions).
  - A Save button — validates the input via the **Name Validation Rule**; on success calls `onSave(trimmedName)`; on failure shows an inline error message below the input and keeps the dialog open (Q4:A) — the input's current (invalid) text is preserved so the player can correct it rather than retype it.
- **Mode-driven meaning of dismiss** (Q3:A — same reusable component): in `App`, `onDismiss` is wired differently per mode — for `initial` it assigns `DEFAULT_PET_NAME` (Skip, FR-NR4); for `rename` it simply closes the dialog with no change (Cancel). The component itself doesn't know or care which — it just reports "the player closed this without saving."

### `StatBar`
- **Props**: `{ label: string, value: number, isDetrimental: boolean }`
- **Renders**: a labeled 0-100 bar/meter for one stat. `isDetrimental` (true only for Hunger) flips the color scale so a high value reads as "bad" (e.g. red at high Hunger) while for the other three stats a high value reads as "good" (e.g. green at high Happiness/Energy/Health) — same component, inverted color mapping.
- Reused 4 times in `App` (Hunger, Happiness, Energy, Health).

### `ActionPanel`
- **Props**: `{ onFeed: () => void, onPlay: () => void, onRest: () => void, feedRemainingMs: number, playRemainingMs: number, isResting: boolean, restRemainingMs: number }`
- **Renders**: three buttons (Feed, Play, Rest).
  - Feed/Play: `disabled` when their respective `*RemainingMs > 0` **or** `isResting === true`; shows a countdown (e.g. "Feed (3s)") while disabled.
  - Rest: `disabled` when `isResting === true`; while resting, shows a countdown to wake (e.g. "Sleeping... 7s").
- **User interactions**: clicking an enabled button calls the corresponding `on*` callback; disabled buttons are inert (no click handler fires) — this is the UI-level enforcement backing the "defensive no-op" rule in business-logic-model.md.

## Form Validation (new — Refresh/Naming; previously "not applicable")
The `NameDialog`'s text input is the app's only form input. Validation is entirely delegated to the domain layer's **Name Validation Rule** (`business-rules.md`) — the component never re-implements the trim/length check itself, it just calls `validateName(input)` on Save and either proceeds (valid) or renders the returned failure as an inline error (invalid) (Q4:A). No native HTML `maxlength`/`required` constraints are relied upon for correctness (though `maxlength={MAX_PET_NAME_LENGTH}` may still be set as a minor input-experience nicety) — the single source of truth stays the shared `validateName` function, consistent with keeping business rules out of components.

## API Integration Points
Not applicable — no backend/API (NFR1, NFR3). All data flows through local component state and `localStorage`.
