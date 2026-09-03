# Decay Pacing ("Sudden" Feel After Feeding) — Requirements

## Intent Analysis Summary

- **User Request**: "the ticking seems to be too sudden. Means the hunger decays right away we feed it! How can we improve that." — followed by clarification that the core issue is the moments right after acting, not the idle/background pace, and that the fix should not go so far as to make Hunger effectively frozen during active feeding.
- **Request Type**: Enhancement — pacing/feel adjustment to an existing rule set, layered on top of the just-completed Hunger/Feed Rebalance (`hunger-feed-rebalance-requirements.md`)
- **Scope Estimate**: Single Component, but broader within it than the prior change — touches the orchestration layer (`src/App.tsx`'s tick scheduling) in addition to the domain logic layer (`src/domain/*`), since "align the decay clock to the action" means resetting the interval timer itself, not just a constant
- **Complexity Estimate**: Moderate — introduces new per-stat timing state (grace periods) into `PetState`, and changes how/when the tick loop fires, while preserving all sustainability guarantees from the prior change

## Background — Root Cause

`src/App.tsx` runs a single `setInterval(tick, TICK_INTERVAL_MS)` that fires on a fixed schedule fully independent of player actions. Clicking Feed can be followed by the next decay tick anywhere from ~0ms to ~1000ms later, purely by chance — read by the player as "hunger decays right away when we feed it." Clarification confirmed this is specifically about the moments right after acting (not the idle pace), and that the fix should smooth this out without eliminating decay entirely during active feeding.

## Functional Requirements

### FR-DP1 — Align Decay Timing to Player Actions
Whenever the player triggers Feed, Play, or Rest, the tick schedule restarts from that moment, so there is always a full, consistent window (matching `TICK_INTERVAL_MS`) before the next decay applies — eliminating the "sometimes instant, sometimes almost a full second" randomness. *(Source: Q1:B, Q2:D-component-A, Clarification Q1:A — post-action only, idle/background pacing unchanged)*

### FR-DP2 — Short Post-Feed Hunger Grace Period
After a successful Feed, Hunger decay is paused for a short grace period, **strictly shorter than `FEED_COOLDOWN_MS`**, so some Hunger decay can still occur between one Feed and the next even under optimal play — this is a smoothing measure, not a freeze. Exact duration is a Functional Design decision (see NFR-DP1). *(Source: Q2:D-component-B, Q4 as revised by Clarification Q2:B)*

### FR-DP3 — Short Post-Play Happiness Grace Period
Symmetric to FR-DP2: after a successful Play, Happiness decay is paused for a short grace period, strictly shorter than `PLAY_COOLDOWN_MS`. *(Source: Q3:A — apply the same treatment to Play/Happiness)*

### FR-DP4 — Energy Scoped Out of the Grace Mechanism (flagged design decision)
Energy does not get an additional post-Play grace period beyond FR-DP1's shared clock-alignment fix. Play's Energy reduction is an intentional cost of playing (not a decay artifact to smooth over), and Energy's recovery path remains Rest. **This narrows Q3's literal "(and Energy)" wording** — flagged here explicitly so it can be overridden at review if that wasn't the intent.

### FR-DP5 — Neglect Guardrail Unaffected
A player taking no actions must see identical behavior to the prior change: Hunger still crosses `CRITICAL_HUNGER_THRESHOLD` within the same ~14-second pace, Health still declines under sustained critical stats. Grace periods and clock-alignment only trigger on player actions, so total neglect is untouched by this change. *(Consistent with FR-RB5 from the prior change; reconfirmed here since Q5 opened the door to revisiting sustainability numbers)*

### FR-DP6 — Prior Sustainability Invariants Preserved (Strengthened, Not Loosened)
FR-RB1–FR-RB5 (from the Hunger/Feed Rebalance) continue to hold. Because grace periods only ever pause decay (never increase it, never reduce an action's restorative effect), this change can only make the existing "diligent play stays sustainable" invariants hold with *more* margin, never less — no invariant needs to be renegotiated, only re-verified with updated numbers in Functional Design.

## Non-Functional Requirements

### NFR-DP1 — Exact Grace Durations Deferred to Functional Design
Exact millisecond values for the Hunger and Happiness grace periods are determined in Functional Design, constrained by: `hungerGraceMs < FEED_COOLDOWN_MS` and `happinessGraceMs < PLAY_COOLDOWN_MS`, chosen so that at least one real decay tick can still land between consecutive optimal actions (i.e., the grace is a smoothing buffer, not a freeze).

### NFR-DP2 — Testable Pacing Behavior
Add tests verifying: (a) no decay tick can land within one full `TICK_INTERVAL_MS` of an action (FR-DP1), and (b) Hunger/Happiness decay does resume before the next optimally-timed Feed/Play (FR-DP2/FR-DP3 — proving this is a smoothing measure, not a freeze), building on the existing test patterns from the prior change (`rules.balance.test.ts`).

### NFR-DP3 — Tunability and Data Shape Preserved
New grace-period values remain named, tunable constants (extends NFR4/NFR-RB2). Any new `PetState` fields needed to track per-stat grace remaining are documented in an updated `domain-entities.md` and go through the existing versioned-persistence pattern (bump `PET_STATE_STORAGE_KEY` if the persisted shape changes, per the existing "Versioned key" rule in `domain-entities.md`).

## Explicitly Out of Scope
- Slowing the baseline/idle tick rate (`TICK_INTERVAL_MS`) — confirmed not wanted (Clarification Q1:A).
- Any change to Rest's own mechanics — Rest already fully pauses Hunger/Happiness/Energy decay for its duration (from the prior change); FR-DP1's clock-reset on Rest-trigger is a no-op in practice but included for consistency.
- Visual/animation polish (stat bar transitions) — Q1 confirmed the issue is timing, not visuals.

## Traceability

| Requirement | Answered By |
|---|---|
| FR-DP1 | Q1:B, Q2:D, Clarification Q1:A |
| FR-DP2 | Q2:D, Q4, Clarification Q2:B |
| FR-DP3 | Q3:A |
| FR-DP4 | Q3:A (narrowed — flagged for override) |
| FR-DP5 | Q5 context, FR-RB5 continuity |
| FR-DP6 | Q5:B (open to revisiting numbers) resolved as "strengthened, not loosened" |
| NFR-DP1 | Clarification Q2:B |
| NFR-DP2 | Continuity with NFR-RB1 |
| NFR-DP3 | Continuity with NFR4/NFR-RB2 |

## Key Requirements Summary

- Fix the "sudden" feeling by restarting the decay schedule on every player action (Feed/Play/Rest), removing the 0–1000ms random-timing gap, without slowing the idle-pace tick rate.
- Add short, deliberately-bounded grace periods after Feed (Hunger) and Play (Happiness) — shorter than each action's own cooldown, so decay is smoothed, not frozen, during active play.
- Energy is scoped out of the new grace mechanism (flagged, overridable).
- Neglect behavior and the prior change's sustainability invariants (FR-RB1–FR-RB5) are unaffected/strengthened, never loosened.
- Likely touches `src/App.tsx` (tick scheduling) and `src/domain/*` (new grace-tracking state) — larger footprint than the previous constants-only change.
