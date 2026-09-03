# Business Logic Model — virtual-pet-web-app

Technology-agnostic description of the core engine. See `business-rules.md` for exact constants/formulas and `domain-entities.md` for data shapes.

## Overview
The app is a single client-side state machine (`PetState`) driven by one repeating **tick** process, plus three **actions** the player can trigger. There is no server; all logic runs in the browser.

## Core Processes

### 1. Tick Process (the "game loop")
Runs once every `TICK_INTERVAL_MS` while the app is open (and only while open — FR2). On each tick, in order:
1. Apply the **Decay Rule** to Hunger/Happiness, and to Energy unless Resting.
2. If Resting: apply **Rest Rule** (Energy regen, countdown, auto-wake).
3. Apply **Cooldown Countdown Rule** to Feed/Play.
4. Recompute **Health Rule** from the (now up-to-date) Hunger/Happiness/Energy.
5. Persist the resulting `PetState` (see Persistence Process).

### 2. Feed Action
Player-triggered. Validates the Feed cooldown and Resting-state precondition, then applies the **Feed Rule**, then persists.

### 3. Play Action
Player-triggered. Validates the Play cooldown and Resting-state precondition, then applies the **Play Rule**, then persists.

### 4. Rest Action
Player-triggered. Validates the pet isn't already Resting, then applies the **Rest Rule**'s trigger effect (enters Resting state), then persists. Waking up again is handled automatically by the Tick Process, not by a player action.

### 5. Mood Derivation
Not a stored process — it's a pure computation (**Mood Rule**) run from the current `PetStats` whenever the UI needs to render, to pick which mood image/label to show.

### 6. Persistence Process
- **On load** (app start): read `virtualPet.state.v1` from `localStorage`. If present and parseable, use it as the initial `PetState`. If absent or unparseable, use `NEW_PET_STARTING_STATS` with `isResting=false`, `restRemainingMs=0`, and zeroed cooldowns.
- **On save** (after every tick and every action): serialize the current `PetState` and write it to `virtualPet.state.v1`.
- Consistent with FR2/FR5: no elapsed-time catch-up is computed on load — the restored state is exactly what was last saved, "frozen" as it was left.

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

Tick timer (every TICK_INTERVAL_MS)
        |
        v
  Decay + Rest regen + cooldown countdown + Health rule
        |
        v
  Persist to localStorage
        |
        v
  Re-render
```

## Error Handling
- **Corrupted/unparseable saved state**: treated as "no saved pet" — fall back to a fresh default pet rather than crashing (acceptable per NFR5, learning-project scope).
- **Action attempted while on cooldown or while Resting**: a no-op from the engine's perspective — the UI is responsible for disabling the button so this path should not normally be reachable, but the rule functions themselves must still no-op safely if called (defensive, since it's cheap and avoids relying solely on UI state).
- **`localStorage` unavailable** (e.g. private browsing with storage disabled): writes fail silently; the app continues to function in-memory for the session. No error surfaced to the user — out of scope for a local learning project (NFR5).
