# Business Logic Model — virtual-pet-web-app

Technology-agnostic description of the core engine. See `business-rules.md` for exact constants/formulas and `domain-entities.md` for data shapes.

## Overview
The app is a single client-side state machine (`PetState`) driven by one repeating **tick** process, plus three **actions** the player can trigger. There is no server; all logic runs in the browser.

## Core Processes

### 1. Tick Process (the "game loop")
Runs once every `TICK_INTERVAL_MS` **after the most recent player action, or after app start if no action has occurred yet** — the tick timer restarts on every Feed/Play/Rest (Action-Triggered Clock Restart, `business-rules.md`, Decay Pacing FR-DP1), so the interval is always a full `TICK_INTERVAL_MS` measured from that action, never a random shorter gap. On each tick, in order:
1. Apply the **Decay Rule** to Hunger/Happiness/Energy — all three are suspended while Resting; Hunger/Happiness are additionally grace-gated while awake (see Decay Rule in `business-rules.md`).
2. If Resting: apply **Rest Rule** (Energy regen, countdown, auto-wake).
3. Apply **Cooldown Countdown Rule** to Feed/Play.
4. Apply **Grace Countdown Rule** to the Hunger/Happiness grace timers.
5. Recompute **Health Rule** from the (now up-to-date) Hunger/Happiness/Energy.
6. Persist the resulting `PetState` (see Persistence Process).

### 2. Feed Action
Player-triggered. Validates the Feed cooldown and Resting-state precondition, then applies the **Feed Rule** (which also arms the Hunger grace period), restarts the Tick Process's timer (FR-DP1), then persists.

### 3. Play Action
Player-triggered. Validates the Play cooldown and Resting-state precondition, then applies the **Play Rule** (which also arms the Happiness grace period), restarts the Tick Process's timer (FR-DP1), then persists.

### 4. Rest Action
Player-triggered. Validates the pet isn't already Resting, then applies the **Rest Rule**'s trigger effect (enters Resting state), restarts the Tick Process's timer (FR-DP1), then persists. Waking up again is handled automatically by the Tick Process, not by a player action.

### 5. Mood Derivation
Not a stored process — it's a pure computation (**Mood Rule**) run from the current `PetStats` whenever the UI needs to render, to pick which mood image/label to show.

### 6. Persistence Process
- **On load** (app start): read `virtualPet.state.v3` from `localStorage`. If present and parseable, use it as the initial `PetState`. If absent or unparseable, use `NEW_PET_STARTING_STATS` with `name=DEFAULT_PET_NAME`, `isResting=false`, `restRemainingMs=0`, zeroed cooldowns, and zeroed graces.
- **On save** (after every tick and every action): serialize the current `PetState` and write it to `virtualPet.state.v3`.
- Consistent with FR2/FR5: no elapsed-time catch-up is computed on load — the restored state is exactly what was last saved, "frozen" as it was left.
- **Storage key bumped `v2` → `v3`** (Refresh/Naming NFR-NR1, shape change: new `name` field). No migration code — per the pre-existing documented policy (see `domain-entities.md`), an old `.v2` save is simply not found under the new key and falls back to a fresh default pet (acceptable, NFR5). This is now the second time this exact versioning policy has been exercised (first at `.v1`→`.v2` for Decay Pacing).

### 7. First-Launch Detection (new — Refresh/Naming FR-NR3)
Runs once, at app mount, **before** the Persistence Process's load step has a chance to write anything: check whether a valid `PetState` already exists under `virtualPet.state.v3`. If none exists, this is a genuinely first-ever launch — the initial naming prompt is shown (see Naming Action below) before/alongside the freshly-created default pet. If a valid save exists, the prompt is never shown, regardless of what the saved `name` is (including the default "Pet" from a previously-skipped prompt) — a skip is a one-time event, not a recurring one (FR-NR3).

### 8. Naming Action (new — Refresh/Naming FR-NR3/FR-NR4/FR-NR6)
Player-triggered (or auto-shown on first launch). Two outcomes:
- **Save**: the entered text is validated (**Name Validation Rule**); if valid, `PetState.name` is set to the trimmed name and the prompt closes; if invalid, an inline error is shown and the prompt stays open (Q4:A).
- **Skip** (first-launch only, via the dialog's large close control — Q2's "Other" answer): `PetState.name` is set to `DEFAULT_PET_NAME` ("Pet") and the prompt closes; the game proceeds normally (FR-NR4).
Does not restart the tick timer and does not go through cooldown/resting preconditions — naming is orthogonal to gameplay pacing.

### 9. Rename Action (new — Refresh/Naming FR-NR5/FR-NR6)
Player-triggered, any time, via the Rename control. Two outcomes:
- **Save**: same validation/effect as the Naming Action's Save path, but operating on an already-named pet (dialog is pre-filled with the current name).
- **Cancel** (via the dialog's close control): closes the dialog with no change to `PetState.name`.
Like the Naming Action, this does not restart the tick timer and is not gated by cooldowns/resting/grace state.

### 10. Refresh Action (new — Refresh/Naming FR-NR1/FR-NR2)
Player-triggered, via the Refresh control, no confirmation (NFR-NR3). Applies the **Reset Rule**: `PetState` is replaced with a fresh pet's stats/cooldowns/graces/resting state, with `name` carried over unchanged. Then, consistent with every other player action in this app, the tick timer restarts (Action-Triggered Clock Restart, `business-rules.md`) and the result is persisted.

## Data Flow
```
User clicks Feed/Play/Rest
        |
        v
  Validate preconditions (cooldown / resting)
        |
        v
  Apply rule -> new PetStats / PetState
        |
        v
  Persist to localStorage
        |
        v
  Re-render (mood + stat bars + cooldown UI update)

Tick timer (every TICK_INTERVAL_MS, restarted on each action)
        |
        v
  Decay (grace-gated) + Rest regen + cooldown countdown + grace countdown + Health rule
        |
        v
  Persist to localStorage
        |
        v
  Re-render

Naming (first launch) / Rename (any time)
        |
        v
  Validate name (trim, 1-20 chars)
        |
        +-- invalid --> show inline error, dialog stays open
        |
        v (valid, or Skip/Cancel)
  Update PetState.name (or leave unchanged on Skip/Cancel)
        |
        v
  Persist to localStorage
        |
        v
  Re-render (dialog closes)

Refresh (any time, no confirmation)
        |
        v
  Reset stats/cooldowns/graces/resting to fresh-pet defaults, keep name
        |
        v
  Restart tick timer + Persist to localStorage
        |
        v
  Re-render
```

## Error Handling
- **Corrupted/unparseable saved state**: treated as "no saved pet" — fall back to a fresh default pet rather than crashing (acceptable per NFR5, learning-project scope). This now also correctly re-triggers the first-launch naming prompt (FR-NR3), since an unparseable save is indistinguishable from no save at all.
- **Action attempted while on cooldown or while Resting**: a no-op from the engine's perspective — the UI is responsible for disabling the button so this path should not normally be reachable, but the rule functions themselves must still no-op safely if called (defensive, since it's cheap and avoids relying solely on UI state).
- **`localStorage` unavailable** (e.g. private browsing with storage disabled): writes fail silently; the app continues to function in-memory for the session. No error surfaced to the user — out of scope for a local learning project (NFR5).
- **Invalid name submitted** (new — Refresh/Naming): rejected by the Name Validation Rule before it ever reaches `PetState`; the dialog shows an inline message and stays open (Q4:A) rather than the engine silently truncating/coercing the input.
