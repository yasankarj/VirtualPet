# Business Rules — virtual-pet-web-app

All numeric constants below should be implemented as named, easily-tunable constants (NFR4) — not inlined magic numbers.

## Constants (from clarifying answers)

| Constant | Value | Source |
|---|---|---|
| `STAT_MIN` / `STAT_MAX` | 0 / 100 | FR1 |
| `TICK_INTERVAL_MS` | 1000 (1 second) | Q1: A |
| `DECAY_PER_TICK` | 5 | Q2: C ("5+ points per tick" — 5 chosen as the concrete value) |
| `FEED_HUNGER_DELTA` | -15 | Q3: A |
| `FEED_ENERGY_DELTA` | +10 | Change request 2026-09-03 (CR#2, Q5: B) |
| `PLAY_HAPPINESS_DELTA` | +20 | Q4: B |
| `PLAY_HUNGER_DELTA` | +15 | Q4: B |
| `PLAY_ENERGY_DELTA` | -15 | Q4: B |
| `REST_DURATION_MS` | 10000 (10 seconds) | Q5: B |
| `REST_ENERGY_REGEN_PER_TICK` | +5 | Design decision — matches `DECAY_PER_TICK` pace so Energy can fully recover (0→100) in one Rest cycle |
| `NEW_PET_STARTING_STATS` | hunger=10, happiness=80, energy=80, health=100 | Q8: A |

**Removed 2026-09-03 (change request CR#2)**: `ACTION_COOLDOWN_MS` no longer exists. Feed and Play have no cooldown at all — see Feed Rule / Play Rule below. `REST_DURATION_MS` is now the only timed delay in the game.

## Decay Rule (applies every tick while the app is open — FR2)
- `hunger = clamp(hunger + DECAY_PER_TICK)`
- `happiness = clamp(happiness - DECAY_PER_TICK)`
- `energy = clamp(energy - DECAY_PER_TICK)` — **except** while `isResting` is true, in which case Energy instead follows the Resting Rule below.
- Hunger and Happiness continue decaying even while the pet is Resting (only Energy's normal decay is suspended during Rest).
- `health` is never directly decayed by this rule — it is fully derived (see Health Rule).

## Feed Rule (FR3, revised by CR#2 2026-09-03)
Preconditions: `isResting == false` and `hunger > STAT_MIN` (0) — once Hunger has reached 0 the pet is fully satisfied and Feed has nothing left to do, so it stays disabled until Hunger rises again. **No cooldown.**
Effect: `hunger = clamp(hunger + FEED_HUNGER_DELTA)`, `energy = clamp(energy + FEED_ENERGY_DELTA)`.

## Play Rule (FR3, revised by CR#2 2026-09-03)
Preconditions: `isResting == false`, `happiness < STAT_MAX` (100), `energy > STAT_MIN` (0), and `health > STAT_MIN` (0) — Play is unavailable once Happiness is maxed out (nothing left to gain) or the pet has no Energy/Health left to play with. **No cooldown.**
Effect: `happiness = clamp(happiness + PLAY_HAPPINESS_DELTA)`, `hunger = clamp(hunger + PLAY_HUNGER_DELTA)`, `energy = clamp(energy + PLAY_ENERGY_DELTA)`.

## Rest Rule (FR3, Q5:B)
Preconditions: `isResting == false`.
Effect on trigger: `isResting = true`, `restRemainingMs = REST_DURATION_MS`. Feed and Play become unavailable for the duration.
Every tick while `isResting == true`:
- `energy = clamp(energy + REST_ENERGY_REGEN_PER_TICK)`
- `restRemainingMs = max(0, restRemainingMs - TICK_INTERVAL_MS)`
- When `restRemainingMs` reaches 0: `isResting = false` (pet wakes up automatically; Feed/Play become available again immediately, subject only to their own stat-boundary preconditions above).
Rest has no separate cooldown of its own beyond its duration — once awake, it can be triggered again immediately. As of CR#2 (2026-09-03), Rest is the *only* action in the game with a timed delay.

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

## Balance History — Feed Loop at Hunger=100
**Original issue** (pre-2026-09-03): with `TICK_INTERVAL_MS=1000`, `DECAY_PER_TICK=5`, and the original `ACTION_COOLDOWN_MS=5000`, the best possible Feed spam only netted `-15 + (5 x 5) = +10` Hunger per 5-second cycle — Hunger trended upward even under optimal play, eventually pinning at `STAT_MAX` (100) and staying there ("stuck feeding loop") since Feed remained enabled but could never win the race against decay.
**CR#1 fix** (2026-09-03): lowered `ACTION_COOLDOWN_MS` to `2000` (2 ticks), and disabled Feed once Hunger reached `STAT_MIN` (0).
**CR#2 fix** (2026-09-03, supersedes CR#1's cooldown value): removed `ACTION_COOLDOWN_MS` (and the cooldown mechanic) entirely from Feed and Play — Feed can now be used every tick, so it always nets `-15` Hunger per use versus `+5` decay per tick, permanently resolving the loop. Feed's disable-at-`hunger<=0` precondition from CR#1 is retained. Rest (`REST_DURATION_MS`) was never part of this issue and is unaffected; it is now the only timed delay left in the game.
