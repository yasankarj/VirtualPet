# Domain Entities — virtual-pet-web-app

## PetStats
All four fields are integers clamped to [0, 100].

| Field | Scale | Meaning at 0 | Meaning at 100 |
|---|---|---|---|
| `hunger` | Detrimental (higher = worse) | Fully satisfied | Starving |
| `happiness` | Beneficial (higher = better) | Miserable | Delighted |
| `energy` | Beneficial (higher = better) | Exhausted | Energetic |
| `health` | Beneficial (higher = better), derived | Critical | Full health |

## ActionCooldowns
Tracked as **remaining milliseconds**, not absolute timestamps — this keeps behavior consistent with FR2 (no time-elapsed catch-up while the app is closed): a cooldown in progress when the app closes resumes at the same remaining value when reopened, it does not keep counting down in the background.

| Field | Type | Meaning |
|---|---|---|
| `feedRemainingMs` | number >= 0 | Time left before Feed can be used again (0 = ready) |
| `playRemainingMs` | number >= 0 | Time left before Play can be used again (0 = ready) |

## DecayGraces (new — Decay Pacing FR-DP2/FR-DP3)
Same "remaining milliseconds" pattern as `ActionCooldowns`, for the same closed-app-consistency reason. While a grace value is > 0, the Decay Rule skips passive decay for that stat (see `business-rules.md`).

| Field | Type | Meaning |
|---|---|---|
| `hungerGraceRemainingMs` | number >= 0 | Time left before Hunger resumes passive decay after a Feed (0 = decaying normally) |
| `happinessGraceRemainingMs` | number >= 0 | Time left before Happiness resumes passive decay after a Play (0 = decaying normally) |

## PetState (root entity, persisted)
| Field | Type | Meaning |
|---|---|---|
| `name` | string, 1-20 chars (new — Refresh/Naming FR-NR7) | The pet's player-given name; `DEFAULT_PET_NAME` ("Pet") if the player skipped naming |
| `stats` | PetStats | Current Hunger/Happiness/Energy/Health |
| `isResting` | boolean | Whether the pet is currently in the Resting state (FR3) |
| `restRemainingMs` | number >= 0 | Time left in the Resting state (0 when not resting) |
| `cooldowns` | ActionCooldowns | Feed/Play cooldown state |
| `graces` | DecayGraces | Hunger/Happiness post-action decay-grace state (Decay Pacing) |

## MoodState (derived, not persisted — recomputed from PetState on every render)
Enum: `HAPPY | NEUTRAL | HUNGRY | TIRED | SAD | SICK`

Used to select the mood image and label (FR7). See `business-rules.md` for the priority order used to compute this from `PetStats`.

## Persisted Shape (localStorage)
Key: `virtualPet.state.v3` (bumped from `.v2` by Refresh/Naming — shape gained the `name` field)

```json
{
  "name": "Pet",
  "stats": { "hunger": 10, "happiness": 80, "energy": 80, "health": 100 },
  "isResting": false,
  "restRemainingMs": 0,
  "cooldowns": { "feedRemainingMs": 0, "playRemainingMs": 0 },
  "graces": { "hungerGraceRemainingMs": 0, "happinessGraceRemainingMs": 0 }
}
```

**Versioned key**: as documented at `.v1`'s introduction, a shape change bumps the key and a missing/unparseable value is treated as "no saved pet" (fall back to a freshly created default `PetState`) rather than attempting migration — acceptable for a local learning project per NFR5. `.v2` saves (from before this change) are simply not found under the new `.v3` key and fall back cleanly to a fresh, unnamed pet — which correctly re-triggers the first-launch naming prompt (FR-NR3), since from the app's point of view this genuinely is a pet it has no saved record of naming.

**First-launch detection** (new — Refresh/Naming FR-NR3): a separate `hasSavedPet()` check (distinct from `loadState()`) reads `localStorage` once on mount to determine whether a *valid* save already existed *before* this session started. This is checked independently of the `name` field's value, because a skipped naming prompt still writes a valid save (with `name = DEFAULT_PET_NAME`) — so "does a name already exist" cannot be used to decide whether to show the prompt; "did a save already exist at all" is the correct, and only, signal.
