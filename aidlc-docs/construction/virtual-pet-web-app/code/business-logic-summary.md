# Business Logic Summary — virtual-pet-web-app

## Files Created

| File | Purpose |
|---|---|
| `src/domain/types.ts` | `PetStats`, `PetState`, `MoodState` |
| `src/domain/constants.ts` | All tunable constants (NFR4) — ticks, deltas, Rest duration, thresholds, storage key |
| `src/domain/factory.ts` | `createNewPet()` |
| `src/domain/rules.ts` | Pure functions: `clamp`, `computeHealth`, `computeMood`, `applyDecay`, `applyRestTick`, `tick`, `applyFeed`, `applyPlay`, `applyRest` |
| `src/domain/persistence.ts` | `loadState`, `saveState` against `localStorage` key `virtualPet.state.v1`, with shape validation and fallback to a fresh pet on missing/corrupted data |

## Test Coverage

| File | Type | Covers |
|---|---|---|
| `tests/domain/rules.test.ts` | Example-based | Feed (hunger down, energy up, no-op while resting or at hunger=0)/Play (no-op while resting, at happiness=100/energy=0/health=0)/Rest effects and preconditions — no cooldown on Feed/Play (CR#2) — Health decline/recovery, full Mood priority order |
| `tests/domain/rules.property.test.ts` | Property-based (fast-check) | Clamping invariant — all stat fields stay within `[0, 100]` after any single op or arbitrary sequence of `tick`/`applyFeed`/`applyPlay`/`applyRest` from any valid starting state |
| `tests/domain/persistence.test.ts` | Example-based | Missing/unparseable/malformed saved data falls back to a fresh default pet; valid saved data is returned as-is |
| `tests/domain/persistence.property.test.ts` | Property-based (fast-check) | `loadState(saveState(x)) === x` round-trip for arbitrary valid `PetState` values |

Property-based scope matches the Requirements Analysis extension decision: pure functions and serialization round-trips only.

## Traceability
FR1 (stats), FR2 (decay), FR3 (actions, Rest delay), FR4 (neglect → Health decline, no death), FR5 (persistence, no closed-time catch-up), FR7 (mood derivation), NFR4 (tunable constants).
