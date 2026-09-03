# Functional Design Plan — Decay Pacing (unit: virtual-pet-web-app)

## Approach

Requirements deferred exact grace durations to this stage, constrained only by `hungerGraceMs < FEED_COOLDOWN_MS` and `happinessGraceMs < PLAY_COOLDOWN_MS` (NFR-DP1). I worked out concrete values and verified them against the FR-RB1–FR-RB5 invariants from the prior change (must hold, per FR-DP6). No open ambiguity remains, so — same as the previous Functional Design pass — there are no embedded `[Answer]:` questions; the design itself is what's up for review.

## Design

### 1. Align the tick schedule to player actions (FR-DP1)
`App.tsx` currently runs one `useEffect` that starts a `setInterval(tick, TICK_INTERVAL_MS)` once, on mount, and never restarts it. Add a `tickEpoch` counter in `App` state; include it in that `useEffect`'s dependency array. Every action handler (`handleFeed`/`handlePlay`/`handleRest`) increments `tickEpoch` after applying its rule, which tears down and restarts the interval — so the next tick is always a full `TICK_INTERVAL_MS` after the most recent action, never a random 0–1000ms gap. Cooldown countdown, Rest tick, and Health recompute move together with decay (they're the same bundled `tick()` call) — this is a deliberate, bounded trade-off: if a player fires two *different* actions within the same second (e.g., Feed then Play back-to-back), the shared clock restarts again before the first restart's tick fired. This never corrupts state (values only change on discrete `tick()` calls), it can only delay a tick by a further ~1s in that specific back-to-back scenario — accepted as within the spirit of "restart the decay countdown from that moment" (Q2:A).

### 2. New grace-tracking state (FR-DP2/FR-DP3)
Add to `PetState`:
```ts
export interface DecayGraces {
  hungerGraceRemainingMs: number;
  happinessGraceRemainingMs: number;
}
```
`PetState.graces: DecayGraces`, alongside the existing `cooldowns`. New constants:
- `FEED_HUNGER_GRACE_MS = 2000` (2 seconds — strictly less than `FEED_COOLDOWN_MS` = 3000)
- `PLAY_HAPPINESS_GRACE_MS = 3000` (3 seconds — strictly less than `PLAY_COOLDOWN_MS` = 5000)

`applyFeed` additionally sets `graces.hungerGraceRemainingMs = FEED_HUNGER_GRACE_MS`. `applyPlay` additionally sets `graces.happinessGraceRemainingMs = PLAY_HAPPINESS_GRACE_MS`. A new **Grace Countdown Rule** decrements both every tick (`max(0, remaining - TICK_INTERVAL_MS)`), mirroring the existing Cooldown Countdown Rule, applied after decay in the same tick.

### 3. Revised Decay Rule (FR-DP2/FR-DP3/FR-DP4)
While awake: Hunger decays *unless* `graces.hungerGraceRemainingMs > 0` (skip that tick's Hunger decay). Happiness decays *unless* `graces.happinessGraceRemainingMs > 0`. **Energy always decays when awake, regardless of any grace** (FR-DP4 — Play's Energy cost stays an immediate, un-buffered cost). While Resting, all three remain fully suspended exactly as the prior change established (unchanged).

### 4. Persistence (NFR-DP3)
Bump `PET_STATE_STORAGE_KEY` from `virtualPet.state.v1` to `virtualPet.state.v2`. No migration code — per the already-documented policy in `domain-entities.md`, an old `.v1` save simply won't be found under the new key, and `loadState` falls back to a fresh default pet (acceptable, NFR5). `createNewPet()` (factory) gets `graces: { hungerGraceRemainingMs: 0, happinessGraceRemainingMs: 0 }` in its default.

## Invariant Re-Verification (FR-DP6 — must still hold, will hold with more margin)

With `FEED_HUNGER_GRACE_MS=2000` over a 3-tick (`FEED_COOLDOWN_MS`=3000ms) Feed cycle: 2 ticks skipped, 1 tick of real Hunger decay (`+5`). One Feed removes `20`. **Net per cycle: -15** (was -5 before this change, was +10 before the original rebalance). ✅ FR-RB1 strengthened.

With `PLAY_HAPPINESS_GRACE_MS=3000` over a 5-tick (`PLAY_COOLDOWN_MS`=5000ms) Play cycle: 3 ticks skipped, 2 ticks of real Happiness decay (`-10` total). One Play adds `30`. **Net per cycle: +20** (was +5 before this change). ✅ FR-RB3 strengthened.

Feed+Play combined (30s window, 10 feeds + 6 plays): Hunger decay now only occurs on 10 of the 30 ticks (1 per 3-tick Feed cycle) = `50` total decay; Feed removes `200`; Play still adds `48` (grace doesn't affect Play's own instant Hunger increase). **Net: -102** (was -2). ✅ FR-RB2 strengthened.

Neglect guardrail (FR-RB5/FR-DP5): no actions -> `graces` stay at 0 the entire time -> Decay Rule behaves exactly as before the grace mechanism existed -> Hunger still crosses `CRITICAL_HUNGER_THRESHOLD` at tick 14, Health still then declines. **Unchanged.** ✅

## Plan Steps

- [x] Update `business-logic-model.md`: Tick Process description (decay now checks graces), a new step 0 describing the action-triggered clock restart, and the Persistence Process's storage key.
- [x] Update `business-rules.md`: Constants table (`FEED_HUNGER_GRACE_MS`, `PLAY_HAPPINESS_GRACE_MS`), Decay Rule (grace-gated), Feed/Play Rules (set grace on trigger), new Grace Countdown Rule, note on the action-triggered clock restart and its bounded back-to-back-actions trade-off, updated invariant numbers.
- [x] Update `domain-entities.md`: new `DecayGraces` type, `PetState.graces` field, bumped storage key (`virtualPet.state.v2`), note on why no migration code is needed (existing documented policy).
- [x] `frontend-components.md`: confirmed no changes needed — `App`'s internal `tickEpoch` state is an implementation detail, not a new prop/component.
- [x] Defined invariant-test scenarios for Code Generation: (a) no decay tick lands within one `TICK_INTERVAL_MS` of an action (component-level test with fake timers, since the timer restart lives in `App.tsx`); (b) Hunger/Happiness decay does resume before the next optimally-timed Feed/Play (grace expires before cooldown); (c) re-run the FR-RB1/FR-RB2/FR-RB3 balance simulations with the new grace numbers baked in; (d) old `.v1`-keyed `localStorage` data falls back to a fresh pet under the new `.v2` key.
