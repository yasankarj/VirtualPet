# Domain Entities — virtual-pet-web-app

## PetStats
All four fields are integers clamped to [0, 100].

| Field | Scale | Meaning at 0 | Meaning at 100 |
|---|---|---|---|
| `hunger` | Detrimental (higher = worse) | Fully satisfied | Starving |
| `happiness` | Beneficial (higher = better) | Miserable | Delighted |
| `energy` | Beneficial (higher = better) | Exhausted | Energetic |
| `health` | Beneficial (higher = better), derived | Critical | Full health |

## PetState (root entity, persisted)
| Field | Type | Meaning |
|---|---|---|
| `stats` | PetStats | Current Hunger/Happiness/Energy/Health |
| `isResting` | boolean | Whether the pet is currently in the Resting state (FR3) |
| `restRemainingMs` | number >= 0 | Time left in the Resting state (0 when not resting) |

**Removed 2026-09-03 (change request CR#2)**: `ActionCooldowns` / the `cooldowns` field no longer exist — Feed and Play have no cooldown (see `business-rules.md`). Rest's own `restRemainingMs` is the only remaining timed-delay field.

## MoodState (derived, not persisted — recomputed from PetState on every render)
Enum: `HAPPY | NEUTRAL | HUNGRY | TIRED | SAD | SICK`

Used to select the mood image and label (FR7). See `business-rules.md` for the priority order used to compute this from `PetStats`.

## Persisted Shape (localStorage)
Key: `virtualPet.state.v1`

```json
{
  "stats": { "hunger": 10, "happiness": 80, "energy": 80, "health": 100 },
  "isResting": false,
  "restRemainingMs": 0
}
```

**Versioned key** (`.v1` suffix): if the shape changes later, bump to `.v2` and treat a missing/unparseable value as "no saved pet" (fall back to a freshly created default `PetState`) rather than attempting migration — acceptable for a local learning project per NFR5.

**CR#2 note (2026-09-03)**: the `cooldowns` field was dropped from the shape without bumping the key. This is a non-breaking, read-compatible change — `isValidPetState` no longer checks for `cooldowns`, so an old saved pet with a stray `cooldowns` object still validates and loads correctly (the extra field is simply ignored); a fresh save omits it. A version bump was judged unnecessary since no migration or fallback-to-default behavior is required either way.
