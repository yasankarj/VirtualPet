# Frontend Components — virtual-pet-web-app

Structure chosen: decomposed components (Q9: A).

## Component Hierarchy
```
App
 +-- PetDisplay   (mood image + label)
 +-- StatBar x4   (Hunger, Happiness, Energy, Health)
 +-- ActionPanel  (Feed, Play, Rest buttons)
```

## State Management
- **Single source of truth**: `App` holds `PetState` in a `useState` hook.
- **Game loop**: `App` runs one `useEffect` with `setInterval(tick, TICK_INTERVAL_MS)`, cleared on unmount. Each tick calls the tick-process logic (business-logic-model.md #1) and calls `setPetState`.
- **Actions**: `App` defines `handleFeed`, `handlePlay`, `handleRest` callbacks (each validates preconditions, applies the relevant rule, calls `setPetState`) and passes them down to `ActionPanel`.
- **Persistence**: a `useEffect` on `petState` change writes to `localStorage` (business-logic-model.md #6 save path); initial state is read synchronously via `useState(() => loadFromStorage())` (lazy initializer) so there's no flash of default values before the saved pet loads.
- **Derived values** (mood, Rest countdown display, "is action available" booleans) are computed inline from `petState` on each render — not stored as separate state, since they're pure functions of it.

## Components

### `App`
- **State**: `petState: PetState`
- **Responsibilities**: game loop timer, action handlers, load/save to `localStorage`, composes the three child components.
- **No props** (root component).

### `PetDisplay`
- **Props**: `{ mood: MoodState }`
- **Renders**: the mood-appropriate image/emoji and a short text label (e.g. "Happy", "Hungry", "Sick"). Pure presentational — computes nothing, just maps `mood` to an image asset and label via a lookup table.

### `StatBar`
- **Props**: `{ label: string, value: number, isDetrimental: boolean }`
- **Renders**: a labeled 0-100 bar/meter for one stat. `isDetrimental` (true only for Hunger) flips the color scale so a high value reads as "bad" (e.g. red at high Hunger) while for the other three stats a high value reads as "good" (e.g. green at high Happiness/Energy/Health) — same component, inverted color mapping.
- Reused 4 times in `App` (Hunger, Happiness, Energy, Health).

### `ActionPanel`
- **Props**: `{ onFeed: () => void, onPlay: () => void, onRest: () => void, isResting: boolean, restRemainingMs: number, hunger: number, happiness: number, energy: number, health: number }`
- **Renders**: three buttons (Feed, Play, Rest).
  - Feed: `disabled` when `isResting === true` **or** `hunger <= STAT_MIN` (already fully satisfied). No cooldown (CR#2, 2026-09-03) — label is always just "Feed".
  - Play: `disabled` when `isResting === true` **or** `happiness >= STAT_MAX` **or** `energy <= STAT_MIN` **or** `health <= STAT_MIN`. No cooldown (CR#2) — label is always just "Play".
  - Rest: `disabled` when `isResting === true`; while resting, shows a countdown to wake (e.g. "Sleeping... 7s"). Rest is the only button with a timed delay.
- **User interactions**: clicking an enabled button calls the corresponding `on*` callback; disabled buttons are inert (no click handler fires) — this is the UI-level enforcement backing the "defensive no-op" rule in business-logic-model.md.

## Form Validation
Not applicable — no form inputs in this app (pure display + button interactions).

## API Integration Points
Not applicable — no backend/API (NFR1, NFR3). All data flows through local component state and `localStorage`.
