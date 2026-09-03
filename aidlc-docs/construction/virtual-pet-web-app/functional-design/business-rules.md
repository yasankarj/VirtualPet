# Business Rules — virtual-pet-web-app

All numeric constants below should be implemented as named, easily-tunable constants (NFR4) — not inlined magic numbers.

## Constants (from clarifying answers)

| Constant | Value | Source |
|---|---|---|
| `STAT_MIN` / `STAT_MAX` | 0 / 100 | FR1 |
| `TICK_INTERVAL_MS` | 1000 (1 second) | Q1: A |
| `DECAY_PER_TICK` | 5 | Q2: C ("5+ points per tick" — 5 chosen as the concrete value) |
| `FEED_HUNGER_DELTA` | -15 | Q3: A |
| `PLAY_HAPPINESS_DELTA` | +20 | Q4: B |
| `PLAY_HUNGER_DELTA` | +15 | Q4: B |
| `PLAY_ENERGY_DELTA` | -15 | Q4: B |
| `REST_DURATION_MS` | 10000 (10 seconds) | Q5: B |
| `REST_ENERGY_REGEN_PER_TICK` | +5 | Design decision — matches `DECAY_PER_TICK` pace so Energy can fully recover (0→100) in one Rest cycle |
| `ACTION_COOLDOWN_MS` | 5000 (5 seconds) | Q6: B — applies to Feed and Play only |
| `NEW_PET_STARTING_STATS` | hunger=10, happiness=80, energy=80, health=100 | Q8: A |

## Decay Rule (applies every tick while the app is open — FR2)
- `hunger = clamp(hunger + DECAY_PER_TICK)`
- `happiness = clamp(happiness - DECAY_PER_TICK)`
- `energy = clamp(energy - DECAY_PER_TICK)` — **except** while `isResting` is true, in which case Energy instead follows the Resting Rule below.
- Hunger and Happiness continue decaying even while the pet is Resting (only Energy's normal decay is suspended during Rest).
- `health` is never directly decayed by this rule — it is fully derived (see Health Rule).

## Feed Rule (FR3)
Preconditions: `feedRemainingMs == 0` and `isResting == false`.
Effect: `hunger = clamp(hunger + FEED_HUNGER_DELTA)`; then `feedRemainingMs = ACTION_COOLDOWN_MS`.

## Play Rule (FR3)
Preconditions: `playRemainingMs == 0` and `isResting == false`.
Effect: `happiness = clamp(happiness + PLAY_HAPPINESS_DELTA)`, `hunger = clamp(hunger + PLAY_HUNGER_DELTA)`, `energy = clamp(energy + PLAY_ENERGY_DELTA)`; then `playRemainingMs = ACTION_COOLDOWN_MS`.

## Rest Rule (FR3, Q5:B)
Preconditions: `isResting == false`.
Effect on trigger: `isResting = true`, `restRemainingMs = REST_DURATION_MS`. Feed and Play become unavailable for the duration (regardless of their own cooldown state).
Every tick while `isResting == true`:
- `energy = clamp(energy + REST_ENERGY_REGEN_PER_TICK)`
- `restRemainingMs = max(0, restRemainingMs - TICK_INTERVAL_MS)`
- When `restRemainingMs` reaches 0: `isResting = false` (pet wakes up automatically; Feed/Play become available again, subject to their own independent cooldowns).
Rest has no separate cooldown of its own beyond its duration — once awake, it can be triggered again immediately.

## Cooldown Countdown Rule
Every tick: `feedRemainingMs = max(0, feedRemainingMs - TICK_INTERVAL_MS)`, `playRemainingMs = max(0, playRemainingMs - TICK_INTERVAL_MS)`.

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

## ⚠️ Design Note — Balance Caveat
With `TICK_INTERVAL_MS=1000` and `DECAY_PER_TICK=5`, Hunger rises 5/second. Feed (`-15`) is on a 5-second cooldown, so the best possible Feed spam only nets `-15 + (5 x 5) = +10` Hunger per 5-second cycle — **Hunger trends upward even under optimal play**, and will eventually cross the critical threshold (`>=80`), pulling Health down over time. This is a direct mathematical consequence of the chosen constants (Q1:A + Q2:C + Q3:A + Q6:B), not a contradiction in your answers — flagging it here because it means the pet will drift toward "critical" state by default rather than being sustainably keepable. Since NFR4 already requires these as tunable constants, this is safe to build as specified and rebalance later (e.g. raising `FEED_HUNGER_DELTA`, shortening `ACTION_COOLDOWN_MS` for Feed specifically, or lowering `DECAY_PER_TICK`) without any structural changes.
