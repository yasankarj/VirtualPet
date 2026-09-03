# Functional Design Plan — virtual-pet-web-app

**Note on prerequisites**: Application Design and Units Generation were skipped per the approved execution plan (single, simple unit). This Functional Design uses `aidlc-docs/inception/requirements/requirements.md` directly as its source of truth instead of unit-of-work artifacts.

## Design Tasks

- [x] Define the pet state domain model (fields, types, valid ranges)
- [x] Define the decay engine rules (tick interval, per-stat decay amount/direction)
- [x] Define action business rules (Feed/Play/Rest stat deltas, cooldown durations)
- [x] Define the derived Health calculation and critical thresholds
- [x] Define mood/visual-state mapping rules (which stat combination -> which mood image)
- [x] Define persistence data shape and save/load rules (`localStorage`)
- [x] Define frontend component structure and state management approach
- [x] Define starting/default values for a newly created pet

## Clarifying Questions

Please answer by filling in the letter after each `[Answer]:` tag.

### Question 1 — Decay Tick Interval
Since decay only happens while the app is open (FR2), how often should the game "tick" and apply decay? (Faster ticks = more visibly game-like for a demo; slower = more realistic.)

A) Every 1 second (fast, very visible decay — good for demoing)

B) Every 5 seconds (moderate)

C) Every 30 seconds (slower, more like a real Tamagotchi pace)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2 — Decay Amount Per Tick
How much should each stat change per tick (on a 0-100 scale)? This applies to Hunger (increases) and Happiness/Energy (decrease); Health is derived, not directly decayed.

A) Slow: 1 point per tick

B) Moderate: 2-3 points per tick

C) Fast: 5+ points per tick (pet needs frequent attention)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3 — Feed Action Magnitude
How much should Feed decrease Hunger per use?

A) Small: -15

B) Moderate: -30

C) Large: -50 (near full satiation in one feed)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4 — Play Action Magnitude
How much should Play change Happiness (+), Hunger (+), and Energy (-) per use?

A) Small: Happiness +10, Hunger +10, Energy -10

B) Moderate: Happiness +20, Hunger +15, Energy -15

C) Large: Happiness +30, Hunger +20, Energy -25

X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 5 — Rest Action Behavior
How should Rest work?

A) Instant boost: Energy immediately increases by a fixed amount (e.g. +30), then a short cooldown before Rest can be used again; Feed/Play remain available immediately after

B) Timed "sleeping" state: pet enters a Resting state for a fixed duration (e.g. 10 seconds), during which Energy steadily regenerates and Feed/Play are disabled; after the duration the pet wakes up automatically

X) Other (please describe after [Answer]: tag below)

[Answer]:B

### Question 6 — Action Cooldown Duration
How long should the cooldown be after using an action (before it can be used again)? (Applies to Feed and Play; Rest's own timing is covered by Question 5.)

A) Short: 3 seconds

B) Moderate: 5 seconds

C) Long: 10 seconds

X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 7 — Health Critical Thresholds
When should Health start declining? (Health is the derived stat from FR1/FR4.)

A) Health declines whenever Hunger >= 80, OR Happiness <= 20, OR Energy <= 20 (any one critical stat triggers decline)

B) Health declines only when at least two of the three stats are simultaneously in a critical range (more forgiving)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8 — Starting Values for a New Pet
What stats should a brand-new pet start with?

A) All "good" — Hunger 10, Happiness 80, Energy 80, Health 100 (pet starts happy and well cared for)

B) All neutral — Hunger 50, Happiness 50, Energy 50, Health 50 (pet starts in the middle)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9 — Frontend Component Structure
How should the React app be structured?

A) A few focused components: `PetDisplay` (mood image), `StatBar` (reused for each stat), `ActionPanel` (Feed/Play/Rest buttons with cooldown state), composed in `App`

B) Single `App` component with all UI inline (simplest, least reusable — fine for a small learning project)

X) Other (please describe after [Answer]: tag below)

[Answer]: A
