# Virtual Pet (Tamagotchi) — Requirements

## Intent Analysis Summary

- **User Request**: "I want to build a Virtual Pet. A tamagotchi: Needs decay over time; feed, play, rest"
- **Request Type**: New Project (greenfield)
- **Scope Estimate**: Single Component — one web application
- **Complexity Estimate**: Simple — clear implementation path, single user type, no external integrations

## Functional Requirements

### FR1 — Pet Stats
The pet has four stats, each ranging 0–100:
- **Hunger** — *detrimental scale*: 0 = fully satisfied, 100 = starving. Higher is worse.
- **Happiness** — *beneficial scale*: 0 = miserable, 100 = delighted. Higher is better.
- **Energy** — *beneficial scale*: 0 = exhausted, 100 = energetic. Higher is better.
- **Health** — a derived, *beneficial scale* stat: declines when Hunger is critically high (near 100), or when Happiness/Energy are critically low (near 0); recovers when Hunger is kept low and Happiness/Energy are kept high.

### FR2 — Stat Decay
- Stats decay automatically over time **only while the app is open** (simulated ticks, e.g. every few seconds, tunable for demo purposes):
  - Hunger **increases** over time (the pet gets hungrier).
  - Happiness and Energy **decrease** over time.
- Decay does **not** continue while the app is closed. On reopening, the pet resumes in exactly the state it was left in — no time-elapsed catch-up calculation.

### FR3 — Actions
Three player actions, each on an independent cooldown (cannot be reused again until the cooldown expires):
- **Feed** — decreases Hunger (satiates the pet).
- **Play** — increases Happiness; decreases Energy; increases Hunger (playing is tiring and works up an appetite).
- **Rest** — increases Energy; the pet is unavailable for Feed/Play while resting.

### FR4 — Neglect Consequences
- If Hunger rises to critical/maximum levels, or Happiness/Energy fall to critical/zero levels, Health declines.
- The pet does **not** die and there is no game-over state. Stats simply remain at low/critical (or, for Hunger, high/critical) levels, and the pet's mood/appearance reflects this (visibly unhappy/sick), until the player takes corrective action.

### FR5 — Persistence
- Pet state (all four stats, name if any) is saved locally in the browser (e.g., `localStorage`).
- On reopening the app, the saved state is restored exactly as it was — consistent with FR2 (no closed-time decay applied).

### FR6 — Single Pet
- Each session/user manages exactly one pet. No multi-pet management or switching.

### FR7 — Visual Representation
- The pet's mood is represented with simple, AI-generated placeholder/emoji-style art (not photographic or copyrighted third-party imagery).
- At minimum, distinct visual states for: Happy/healthy, Neutral, Hungry (high Hunger), Tired (low Energy), Sad/Unhappy (low Happiness), Sick/critical (low Health).
- Current stat values are also displayed as numbers or bars alongside the visual.

## Non-Functional Requirements

### NFR1 — Platform & Stack
- **Platform**: Web application, runs in the browser.
- **Stack**: JavaScript/TypeScript (React for the UI).

### NFR2 — Usability
- Single-page interface: stats, pet visual, and action buttons (Feed/Play/Rest) visible without navigation.
- Cooldown state on action buttons should be visually obvious (e.g., disabled/greyed out with a timer).

### NFR3 — Reliability / Data Integrity
- Pet state must not be lost on browser refresh (covered by FR5).
- No server/backend required — fully client-side.

### NFR4 — Maintainability
- Decay rates, cooldown durations, and thresholds should be defined as easily tunable constants (not magic numbers scattered through the code), since this is a learning project likely to be iterated on.

### NFR5 — Scope Boundaries
- This is a learning/personal portfolio project: single-user, runs entirely locally, no accounts, no cloud hosting, no backend service, no multi-user/production-scale concerns.

## Extension Configuration

| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline | No | Requirements Analysis |
| Resiliency Baseline | No | Requirements Analysis |
| Property-Based Testing | Partial — pure functions & serialization round-trips only (e.g., decay/stat-clamping logic, save/load state) | Requirements Analysis |

## Key Requirements Summary

- 4 stats (Hunger, Happiness, Energy, derived Health), ticking only while the app is open. Hunger is detrimental (higher = worse, rises over time); Happiness, Energy, and Health are beneficial (higher = better, decay over time).
- 3 actions (Feed, Play, Rest) with cooldowns and cross-effects (Feed lowers Hunger; Play raises Happiness and Hunger while lowering Energy; Rest raises Energy and blocks other actions).
- No death/game-over — neglect just degrades Health and mood.
- Local persistence via `localStorage`, restoring exact last state (no offline catch-up decay).
- One pet, React + TypeScript web app, simple generated mood art (no copyrighted imagery).
- No backend, no accounts — pure client-side learning project.
- Property-based testing applied selectively to pure logic (decay/clamping, save/load round-trip).
