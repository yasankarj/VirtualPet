# Functional Design Plan — Hunger/Feed Rebalance (unit: virtual-pet-web-app)

## Approach

Requirements (Q7:B) deferred exact numbers to this stage. I worked out a concrete, internally-consistent set of constant changes that satisfies FR-RB1–FR-RB5 by simulation/arithmetic (shown below), rather than leaving open questions — the numbers are fully derivable from the sustainability invariants you already approved. No genuine ambiguity remains, so there are no embedded `[Answer]:` questions in this plan; the numbers themselves are what's up for your review at the approval gate.

## Proposed Constant Changes

| Constant | Current | Proposed | Why |
|---|---|---|---|
| `DECAY_PER_TICK` | 5 | **unchanged (5)** | Keeps the existing pace/feel; the fix is achieved through the action-side levers instead. |
| `FEED_HUNGER_DELTA` | -15 | **-20** | Stronger single-Feed effect. |
| `ACTION_COOLDOWN_MS` (shared) | 5000 | **split into `FEED_COOLDOWN_MS` and `PLAY_COOLDOWN_MS`** | Feed and Play no longer need the same cadence — decoupling is what makes Feed viable without also having to speed up Play. |
| `FEED_COOLDOWN_MS` (new) | — | **3000** | Feed usable more often. |
| `PLAY_COOLDOWN_MS` (new) | — | **5000 (unchanged from today's value)** | No need to touch Play's cadence once its own deltas are rebalanced (below). |
| `PLAY_HUNGER_DELTA` | +15 | **+8** | Play still costs Hunger (keeps the "playing works up an appetite" flavor from FR3), but no longer large enough to cancel out Feed's fix when a player does both diligently. |
| `PLAY_HAPPINESS_DELTA` | +20 | **+30** | Makes diligent Play net-positive for Happiness instead of net-negative (fixes the same root-cause pattern for Happiness, per FR-RB3). |
| `CRITICAL_HUNGER_THRESHOLD`, `HAPPY_HUNGER_THRESHOLD`, `CRITICAL_HAPPINESS_THRESHOLD`, `HAPPY_HAPPINESS_THRESHOLD` | 80 / 40 / 20 / 60 | **unchanged** | Not needed — neglect consequences (FR-RB5) stay exactly as strong as today; only the "diligent play" side of the equation changes. |
| Rest decay suspension | Energy only | **Hunger and Happiness decay also suspended while `isResting`** | Mirrors the existing Energy behavior (`isResting ? unchanged : decay`) — Rest becomes a genuine pause instead of a guaranteed Hunger/Happiness spike (FR-RB4). |

## Verification (the invariants from FR-RB1/FR-RB2/FR-RB3, checked against the numbers above)

- **FR-RB1** (Feed-only cycle, net ≤ 0): one `FEED_COOLDOWN_MS` (3s) accrues `5 x 3 = 15` Hunger decay; one Feed removes `20` → **net -5 per cycle** (sustainable, with margin). ✅
- **FR-RB2** (Feed + Play combined, Play must not undo FR-RB1): over a 30s window, a player feeding every 3s (10 feeds) and playing every 5s (6 plays) accrues `5 x 30 = 150` Hunger decay, minus `20 x 10 = 200` from Feed, plus `8 x 6 = 48` from Play → **net -2 over 30s** (still sustainable). ✅
- **FR-RB3** (Play-only cycle, Happiness net ≥ 0): one `PLAY_COOLDOWN_MS` (5s) accrues `5 x 5 = 25` Happiness decay; one Play adds `30` → **net +5 per cycle**. ✅
- **FR-RB4**: Rest suspends Hunger/Happiness decay exactly like Energy's decay is already suspended — implemented as a small addition to `applyDecay`, no new state fields needed. ✅
- **FR-RB5** (neglect guardrail): a player who never feeds/plays sees identical behavior to today — Hunger still climbs 5/sec while awake, still crosses `CRITICAL_HUNGER_THRESHOLD` (80) from the starting value (10) in 14 seconds, Health still declines. Nothing here was loosened. ✅

## Plan Steps

- [x] Update `business-rules.md`: revise the Decay Rule (Rest suspends Hunger/Happiness too), Feed Rule, Play Rule, and the Constants table with the new values above; replace the old "⚠️ Design Note — Balance Caveat" with a note recording that this rebalance resolves it, plus the invariants above stated as the ongoing design contract.
- [x] Update `business-logic-model.md`: reflect `FEED_COOLDOWN_MS`/`PLAY_COOLDOWN_MS` replacing the single `ACTION_COOLDOWN_MS`, and the Rest tick now touching Hunger/Happiness as well as Energy.
- [x] `domain-entities.md`: confirmed no changes needed (no new fields — `PetState`/`PetStats`/`ActionCooldowns` shapes are unaffected).
- [x] `frontend-components.md`: confirmed no changes needed (UI reads the same stat/cooldown shapes, doesn't care about specific cooldown durations).
- [x] Defined the exact invariant-test scenarios (for NFR-RB1) to hand to Code Generation: (a) N-cycle simulation of optimal Feed-only play → Hunger trends ≤ starting value; (b) N-cycle simulation of optimal Feed+Play → Hunger trends ≤ starting value; (c) N-cycle simulation of optimal Play-only → Happiness trends ≥ starting value; (d) simulation of a full Rest cycle → Hunger/Happiness unchanged, Energy regenerates as before; (e) simulation of total neglect → Hunger crosses critical within the same ~14s as today, Health declines.
