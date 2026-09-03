# Business Logic Summary — virtual-pet-web-app

## Files Created

| File | Purpose |
|---|---|
| `src/domain/types.ts` | `PetStats`, `ActionCooldowns`, `DecayGraces`, `PetState`, `MoodState` |
| `src/domain/constants.ts` | All tunable constants (NFR4) — ticks, deltas, cooldowns, grace durations, thresholds, storage key |
| `src/domain/factory.ts` | `createNewPet()` |
| `src/domain/rules.ts` | Pure functions: `clamp`, `computeHealth`, `computeMood`, `applyDecay`, `applyRestTick`, `applyCooldownCountdown`, `applyGraceCountdown`, `tick`, `applyFeed`, `applyPlay`, `applyRest` |
| `src/domain/persistence.ts` | `loadState`, `saveState` against `localStorage` key `virtualPet.state.v2`, with shape validation (including `graces`) and fallback to a fresh pet on missing/corrupted data |
| `src/App.tsx` | React root component — owns `PetState`, the tick-interval timer (restarted on every action via a `tickEpoch` counter), and action handlers |

## Test Coverage

| File | Type | Covers |
|---|---|---|
| `tests/domain/rules.test.ts` | Example-based | Feed/Play/Rest effects and preconditions (no-op on cooldown/resting), Decay Rule while awake and while resting, cooldown countdown, Health decline/recovery, full Mood priority order |
| `tests/domain/rules.property.test.ts` | Property-based (fast-check) | Clamping invariant — all stat fields stay within `[0, 100]` after any single op or arbitrary sequence of `tick`/`applyFeed`/`applyPlay`/`applyRest` from any valid starting state |
| `tests/domain/rules.balance.test.ts` | Simulation-based (NFR-RB1/NFR-DP2) | The 5 sustainability invariants from the Hunger/Feed Rebalance (FR-RB1–FR-RB5), including exact-margin regression checks for FR-RB1/FR-RB3 re-verified after Decay Pacing (-15/+20 per cycle) |
| `tests/domain/persistence.test.ts` | Example-based | Missing/unparseable/malformed saved data (including data missing the `graces` field) falls back to a fresh default pet; valid saved data is returned as-is |
| `tests/domain/persistence.property.test.ts` | Property-based (fast-check) | `loadState(saveState(x)) === x` round-trip for arbitrary valid `PetState` values (including `graces`) |
| `tests/App.timing.test.tsx` | Component-based, fake timers (NFR-DP2) | FR-DP1: the tick timer restarts on Feed, so the cooldown display only advances a full `TICK_INTERVAL_MS` after the click, never sooner |

Property-based scope matches the Requirements Analysis extension decision: pure functions and serialization round-trips only.

## Traceability
FR1 (stats), FR2 (decay), FR3 (actions/cooldowns), FR4 (neglect → Health decline, no death), FR5 (persistence, no closed-time catch-up), FR7 (mood derivation), NFR4 (tunable constants).

## Hunger/Feed Rebalance (2026-09-03)
`FEED_HUNGER_DELTA` -15→-20; `PLAY_HAPPINESS_DELTA` +20→+30; `PLAY_HUNGER_DELTA` +15→+8; shared `ACTION_COOLDOWN_MS` (5000) split into `FEED_COOLDOWN_MS` (3000) and `PLAY_COOLDOWN_MS` (5000); `applyDecay` now suspends Hunger/Happiness (not just Energy) while resting. Resolves the guaranteed Hunger-climbs-to-max issue flagged in the original "Balance Caveat" note — see `aidlc-docs/construction/virtual-pet-web-app/functional-design/business-rules.md` and `aidlc-docs/inception/requirements/hunger-feed-rebalance-requirements.md` (FR-RB1–FR-RB5) for the full design contract.

## Decay Pacing (2026-09-03)
Fixes the "sudden" feel where Hunger could resume decaying almost immediately after Feeding. Two changes: (1) `App.tsx`'s tick timer now restarts on every Feed/Play/Rest (`tickEpoch` counter) instead of running on a fixed schedule independent of player actions (FR-DP1); (2) new `PetState.graces` field (`hungerGraceRemainingMs`/`happinessGraceRemainingMs`) pauses Hunger decay for `FEED_HUNGER_GRACE_MS` (2000ms) after a Feed and Happiness decay for `PLAY_HAPPINESS_GRACE_MS` (3000ms) after a Play — each strictly shorter than that action's own cooldown, so decay is smoothed, not frozen (FR-DP2/FR-DP3). Energy is intentionally excluded from grace-gating (FR-DP4). Storage key bumped `virtualPet.state.v1` → `.v2` (shape change, no migration code per the pre-existing documented policy — old saves fall back to a fresh pet). All FR-RB1–FR-RB5 sustainability invariants re-verified and strengthened, never loosened — see `aidlc-docs/inception/requirements/hunger-decay-pacing-requirements.md` (FR-DP1–FR-DP6) for the full design contract.
