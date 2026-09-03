# Business Rules — virtual-pet-web-app

All numeric constants below should be implemented as named, easily-tunable constants (NFR4) — not inlined magic numbers.

## Constants (from clarifying answers; rebalanced by the Hunger/Feed Rebalance change — see `hunger-feed-rebalance-requirements.md`)

| Constant | Value | Source |
|---|---|---|
| `STAT_MIN` / `STAT_MAX` | 0 / 100 | FR1 |
| `TICK_INTERVAL_MS` | 1000 (1 second) | Q1: A |
| `DECAY_PER_TICK` | 5 | Q2: C ("5+ points per tick" — 5 chosen as the concrete value); unchanged by the rebalance |
| `FEED_HUNGER_DELTA` | **-20** (was -15) | Hunger/Feed Rebalance FR-RB1 |
| `FEED_COOLDOWN_MS` | **3000 (3 seconds)** (was part of shared `ACTION_COOLDOWN_MS` = 5000) | Hunger/Feed Rebalance FR-RB1 — split from Play's cooldown so Feed can be used more often |
| `PLAY_COOLDOWN_MS` | 5000 (5 seconds) | Hunger/Feed Rebalance — same value Play always had, now its own independent constant |
| `PLAY_HAPPINESS_DELTA` | **+30** (was +20) | Hunger/Feed Rebalance FR-RB3 |
| `PLAY_HUNGER_DELTA` | **+8** (was +15) | Hunger/Feed Rebalance FR-RB2 |
| `PLAY_ENERGY_DELTA` | -15 | Q4: B; unchanged by the rebalance |
| `REST_DURATION_MS` | 10000 (10 seconds) | Q5: B |
| `REST_ENERGY_REGEN_PER_TICK` | +5 | Design decision — matches `DECAY_PER_TICK` pace |
| `NEW_PET_STARTING_STATS` | hunger=10, happiness=80, energy=80, health=100 | Q8: A |
| `CRITICAL_HUNGER_THRESHOLD` / `HAPPY_HUNGER_THRESHOLD` / `CRITICAL_HAPPINESS_THRESHOLD` / `HAPPY_HAPPINESS_THRESHOLD` / `CRITICAL_ENERGY_THRESHOLD` / `HAPPY_ENERGY_THRESHOLD` / `SICK_HEALTH_THRESHOLD` | 80 / 40 / 20 / 60 / 20 / 60 / 20 | Q7: A; unchanged by the rebalance (FR-RB5 — neglect consequences stay exactly as strong as before) |
| `FEED_HUNGER_GRACE_MS` | **2000 (2 seconds)** | Decay Pacing FR-DP2 — strictly less than `FEED_COOLDOWN_MS` (3000) |
| `PLAY_HAPPINESS_GRACE_MS` | **3000 (3 seconds)** | Decay Pacing FR-DP3 — strictly less than `PLAY_COOLDOWN_MS` (5000) |
| `DEFAULT_PET_NAME` | **"Pet"** (new) | Refresh/Naming FR-NR4 |
| `MAX_PET_NAME_LENGTH` | **20** (new) | Refresh/Naming FR-NR6, Q6:A |

`ACTION_COOLDOWN_MS` is retired, replaced by the independent `FEED_COOLDOWN_MS` and `PLAY_COOLDOWN_MS` above.

## Decay Rule (applies every tick while the app is open — FR2; revised by Hunger/Feed Rebalance FR-RB4 and Decay Pacing FR-DP2/FR-DP3/FR-DP4)
- While `isResting == false`:
  - `hunger = graces.hungerGraceRemainingMs > 0 ? hunger : clamp(hunger + DECAY_PER_TICK)`
  - `happiness = graces.happinessGraceRemainingMs > 0 ? happiness : clamp(happiness - DECAY_PER_TICK)`
  - `energy = clamp(energy - DECAY_PER_TICK)` — **Energy is never grace-gated** (FR-DP4): Play's Energy cost is an intentional, un-buffered cost, not a decay artifact to smooth over.
- While `isResting == true`: Hunger, Happiness, and Energy are all **unchanged** by this rule — Energy instead follows the Resting Rule's regen below; Hunger and Happiness simply hold at their current values for the duration (Resting is a full pause, not a cost).
- `health` is never directly decayed by this rule — it is fully derived (see Health Rule).

## Feed Rule (FR3; rebalanced by Hunger/Feed Rebalance FR-RB1; grace added by Decay Pacing FR-DP2)
Preconditions: `feedRemainingMs == 0` and `isResting == false`.
Effect: `hunger = clamp(hunger + FEED_HUNGER_DELTA)`; `feedRemainingMs = FEED_COOLDOWN_MS`; `graces.hungerGraceRemainingMs = FEED_HUNGER_GRACE_MS`.

## Play Rule (FR3; rebalanced by Hunger/Feed Rebalance FR-RB2/FR-RB3; grace added by Decay Pacing FR-DP3)
Preconditions: `playRemainingMs == 0` and `isResting == false`.
Effect: `happiness = clamp(happiness + PLAY_HAPPINESS_DELTA)`, `hunger = clamp(hunger + PLAY_HUNGER_DELTA)`, `energy = clamp(energy + PLAY_ENERGY_DELTA)`; `playRemainingMs = PLAY_COOLDOWN_MS`; `graces.happinessGraceRemainingMs = PLAY_HAPPINESS_GRACE_MS`. (Note: Play's own instant Hunger increase is unaffected by any Hunger grace in progress — grace only gates *passive decay*, never an action's direct effect.)

## Rest Rule (FR3, Q5:B; Hunger/Happiness suspension added by Hunger/Feed Rebalance FR-RB4)
Preconditions: `isResting == false`.
Effect on trigger: `isResting = true`, `restRemainingMs = REST_DURATION_MS`. Feed and Play become unavailable for the duration (regardless of their own cooldown state).
Every tick while `isResting == true`:
- `energy = clamp(energy + REST_ENERGY_REGEN_PER_TICK)`
- Hunger and Happiness are left unchanged (see Decay Rule above — Resting suspends their decay too, not just Energy's).
- `restRemainingMs = max(0, restRemainingMs - TICK_INTERVAL_MS)`
- When `restRemainingMs` reaches 0: `isResting = false` (pet wakes up automatically; Feed/Play become available again, subject to their own independent cooldowns).
Rest has no separate cooldown of its own beyond its duration — once awake, it can be triggered again immediately.

## Cooldown Countdown Rule
Every tick: `feedRemainingMs = max(0, feedRemainingMs - TICK_INTERVAL_MS)`, `playRemainingMs = max(0, playRemainingMs - TICK_INTERVAL_MS)`.

## Grace Countdown Rule (Decay Pacing FR-DP2/FR-DP3)
Every tick: `graces.hungerGraceRemainingMs = max(0, graces.hungerGraceRemainingMs - TICK_INTERVAL_MS)`, `graces.happinessGraceRemainingMs = max(0, graces.happinessGraceRemainingMs - TICK_INTERVAL_MS)` — applied after the Decay Rule reads the (pre-countdown) values for this tick, mirroring the Cooldown Countdown Rule's ordering.

## Action-Triggered Clock Restart (Decay Pacing FR-DP1)
Not a stat-mutation rule — a scheduling rule. Whenever the player successfully triggers Feed, Play, or Rest, the recurring tick timer restarts from that moment, so the next `tick()` call (decay + rest tick + cooldown countdown + grace countdown + health recompute, all still bundled together) always fires a full `TICK_INTERVAL_MS` after the action — never sooner. This removes the previous 0–1000ms random gap between an action and the next decay application.
**Accepted bounded trade-off**: since cooldown/health/grace countdown ride along with decay in the same bundled tick, firing two *different* actions within the same ~1s window (e.g. Feed then Play back-to-back) restarts the clock again before the first restart's tick fires, delaying that tick a little further. This never corrupts state — values still only change on discrete `tick()` calls — it only bounds how soon the next tick lands in that specific rapid-multi-action scenario.

## Health Rule (derived, FR1/FR4, Q7:A)
A stat combination is "critical" when: `hunger >= 80 OR happiness <= 20 OR energy <= 20`.
Every tick:
- If critical: `health = clamp(health - DECAY_PER_TICK)`
- Else (all three stats in a safe range): `health = clamp(health + 2)` (slow recovery — recovering is intentionally slower than declining)

## Mood Rule (FR7) — priority order, first match wins
1. `health <= 20` → **SICK**
2. `hunger >= 80` → **HUNGRY**
3. `energy <= 20` → **TIRED**
4. `happiness <= 20` → **SAD**
5. `hunger < 40 AND happiness >= 60 AND energy >= 60` → **HAPPY**
6. otherwise → **NEUTRAL**

Priority exists because multiple conditions can be true at once (e.g. both hungry and tired) — Health takes top priority since it reflects overall neglect, followed by the stat currently in the most urgent state.

## Clamping Rule
`clamp(x) = max(STAT_MIN, min(STAT_MAX, x))` — applied after every stat mutation (decay, action effects, rest regen, health rule).

## Name Validation Rule (new — Refresh/Naming FR-NR6)
`validateName(raw: string): string | null`
- Trim leading/trailing whitespace from `raw`.
- If the trimmed result has length 0, or length > `MAX_PET_NAME_LENGTH` (20), the name is **invalid**: return `null`.
- Otherwise return the trimmed string as the valid name.
This is the single source of truth for name validity — both the initial naming prompt and the Rename dialog call it before accepting a submission (Q4:A — invalid submissions are rejected with an inline message, not silently coerced).

## Rename Rule (new — Refresh/Naming FR-NR5/FR-NR6)
Preconditions: none (FR-NR5 — usable any time, not gated by cooldowns/resting/grace state).
Effect: `name = validateName(newName)`. If `validateName` returns `null`, this is a **defensive no-op** (state unchanged) — mirrors the existing no-op-on-invalid-precondition pattern used by `applyFeed`/`applyPlay`/`applyRest`. In practice the UI always validates before calling this (Q4:A), so the no-op path only guards against being called incorrectly.

## Reset Rule / "Refresh" (new — Refresh/Naming FR-NR1/FR-NR2)
Preconditions: none — always available, no confirmation (NFR-NR3).
Effect: produces a fresh pet exactly as `createNewPet` would for a brand-new pet — `stats` reset to `NEW_PET_STARTING_STATS`, both `cooldowns` to 0, both `graces` to 0, `isResting = false`, `restRemainingMs = 0` — **except `name`, which is carried over unchanged** from the pet being reset (Clarification Q1:A). This is intentionally the *only* difference from creating a brand-new pet: Reset never touches `name`, and never re-triggers the naming prompt (that stays gated purely by first-launch detection, `domain-entities.md`).

## ✅ Design Note — Balance Caveat Resolved (Hunger/Feed Rebalance; strengthened by Decay Pacing)
The original constants (`FEED_HUNGER_DELTA=-15` on a shared 5s cooldown) guaranteed Hunger climbed to maximum regardless of play quality (`-15 + 5x5 = +10` net per cycle), permanently pinning Health critical. This has been rebalanced — see `hunger-feed-rebalance-requirements.md` for the full analysis — and further strengthened by the Decay Pacing change's grace periods (`hunger-decay-pacing-requirements.md`). The invariants below form the ongoing design contract for this rule set and should be preserved by any future tuning:

- **Feed-only sustainability** (FR-RB1): decay accrued over one `FEED_COOLDOWN_MS` window (now grace-gated — only 1 of 3 ticks decays), minus one Feed, must be ≤ 0. *(Current: `5x1 - 20 = -15`, was `-5` pre-Decay-Pacing.)*
- **Feed+Play combined sustainability** (FR-RB2): decay accrued over a window containing both diligent Feed and diligent Play cycles (grace-gated), minus their combined Hunger effects, must remain ≤ 0. *(Current: over 30s — 10 feeds, 6 plays — Hunger decays on only 10 of 30 ticks — `50 - 200 + 48 = -102`, was `-2` pre-Decay-Pacing.)*
- **Play-only Happiness sustainability** (FR-RB3): decay accrued over one `PLAY_COOLDOWN_MS` window (grace-gated — only 2 of 5 ticks decay), minus one Play's Happiness gain, must be ≤ 0 (i.e. Happiness net ≥ 0). *(Current: `10 - 30 = -20`, i.e. net +20, was net +5 pre-Decay-Pacing.)*
- **Rest is a pause, not a cost** (FR-RB4): Hunger/Happiness must not change during Resting.
- **Neglect guardrail** (FR-RB5): a player taking no actions must still see Hunger cross `CRITICAL_HUNGER_THRESHOLD` within the same ~14s as before the rebalance, and Health must still decline under sustained critical stats. Grace periods only ever trigger on player actions, so this is **exactly unchanged** by Decay Pacing. Any future tuning that weakens this guardrail should be treated as a deliberate difficulty change, not a side effect.
- **Grace bounded below cooldown** (FR-DP2/FR-DP3, new): `FEED_HUNGER_GRACE_MS < FEED_COOLDOWN_MS` and `PLAY_HAPPINESS_GRACE_MS < PLAY_COOLDOWN_MS` must always hold, so at least one real decay tick still lands between consecutive optimally-timed actions — grace smooths decay, it must never fully freeze it.

These invariants should be encoded as simulation-based tests (NFR-RB1/NFR-DP2) rather than checked only by single-value assertions, since they depend on the interaction of several constants together — see the Code Generation plan for the specific scenarios.

**Reset does not touch this design contract** (NFR-NR2, Refresh/Naming): the Reset Rule above only ever sets stats/cooldowns/graces/resting back to the same starting values `createNewPet` already uses — it introduces no new decay/action math, so none of the invariants above are affected by this change.
