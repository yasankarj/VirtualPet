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

## PetState (root entity, persisted)
| Field | Type | Meaning |
|---|---|---|
| `stats` | PetStats | Current Hunger/Happiness/Energy/Health |
| `isResting` | boolean | Whether the pet is currently in the Resting state (FR3) |
| `restRemainingMs` | number >= 0 | Time left in the Resting state (0 when not resting) |
| `cooldowns` | ActionCooldowns | Feed/Play cooldown state |

## MoodState (derived, not persisted — recomputed from PetState on every render)
Enum: `HAPPY | NEUTRAL | HUNGRY | TIRED | SAD | SICK`

Used to select the mood image and label (FR7). See `business-rules.md` for the priority order used to compute this from `PetStats`.

## Persisted Shape (localStorage)
Key: `virtualPet.state.v1`

```json
{
  "stats": { "hunger": 10, "happiness": 80, "energy": 80, "health": 100 },
  "isResting": false,
  "restRemainingMs": 0,
  "cooldowns": { "feedRemainingMs": 0, "playRemainingMs": 0 }
}
```

**Versioned key** (`.v1` suffix): if the shape changes later, bump to `.v2` and treat a missing/unparseable value as "no saved pet" (fall back to a freshly created default `PetState`) rather than attempting migration — acceptable for a local learning project per NFR5.
