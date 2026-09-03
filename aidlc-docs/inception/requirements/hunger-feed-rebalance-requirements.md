# Hunger/Feed Rebalance — Requirements

## Intent Analysis Summary

- **User Request**: "I need to do a change in the Hunger -> Feed behavior. Here the hunger increment rate and feeding delay is equal therefore the player is stuck in feed-hunger loop."
- **Request Type**: Enhancement / Bug Fix — game-balance rebalance of an existing rule set (not new functionality)
- **Scope Estimate**: Single Component — confined to the domain logic layer of the existing `virtual-pet-web-app` unit (`src/domain/constants.ts`, `src/domain/rules.ts`); no new components and no UI changes anticipated
- **Complexity Estimate**: Moderate — several interacting constants (decay rates, action deltas, cooldowns, thresholds) across Hunger, Happiness, and the Rest interaction must be retuned together to satisfy explicit sustainability invariants, rather than a single isolated value change

## Background — Root Cause (see `hunger-feed-rebalance-questions.md` for full analysis)

Hunger decay (5/sec) accumulates 25 points across Feed's 5-second cooldown, but Feed only removes 15 — so even optimal play nets **+10 Hunger every cycle**, guaranteeing Hunger eventually pins at maximum and Health permanently declines, regardless of player attentiveness. This was a known-but-deferred issue from the original design (`business-rules.md` "Balance Caveat"). The same root pattern also mildly affects Happiness/Play, and Hunger/Happiness decay unopposed during Rest.

## Functional Requirements

### FR-RB1 — Sustainable Hunger Under Diligent Feeding
A player who feeds every time Feed is off cooldown must be able to keep Hunger safely below `CRITICAL_HUNGER_THRESHOLD` indefinitely. Concretely: the net Hunger change over one full Feed cooldown cycle (decay accumulated during the cooldown, offset by one Feed) must be **zero or negative** under optimal play. *(Source: Q1:A)*

The specific combination of decay rate, `FEED_HUNGER_DELTA`, and Feed's cooldown duration needed to satisfy this is left to Functional Design — a combination of levers, not a single isolated change. `CRITICAL_HUNGER_THRESHOLD` may also move if it helps hit the target. *(Source: Q2:D, Q6:B, Q7:B)*

### FR-RB2 — Play Rebalanced Alongside Feed
Play's Hunger penalty (`PLAY_HUNGER_DELTA`) must be rebalanced so that using Play does not, by itself, undermine FR-RB1 — a diligent player who also uses Play whenever available must still be able to keep Hunger sustainable. *(Source: Q3:A)*

### FR-RB3 — Sustainable Happiness Under Diligent Play
Symmetric to FR-RB1: a player who uses Play every time it's off cooldown must be able to keep Happiness at or above a healthy level indefinitely — net Happiness change over one full Play cooldown cycle must be **zero or positive** under optimal play. `PLAY_HAPPINESS_DELTA`, Happiness's decay rate, Play's cooldown, and/or the Happiness thresholds may all be adjusted to satisfy this. *(Source: Q4:A, Q6:B)*

### FR-RB4 — Rest No Longer Penalizes Hunger/Happiness Unopposed
While Resting, Hunger and/or Happiness decay must be suspended or reduced so a full Rest cycle does not, by itself, push those stats into critical territory with no way for the player to counteract it mid-rest — mirroring how Energy's own decay is already suspended during Rest. Exact mechanism (fully suspend vs. reduced rate) determined in Functional Design. *(Source: Q5:A)*

### FR-RB5 — Neglect Must Still Be Meaningfully Worse Than Care (guardrail)
The rebalance must not eliminate the consequence of neglect: a player who does **not** feed/play regularly must still see Hunger/Happiness drift toward critical and Health decline, consistent with the original FR4. Only *diligent* play should be sustainable — the fix must not make all stats trivially maxable/ignorable regardless of player behavior. *(Derived from the intent behind Q1:A — "sustainable," not "trivial")*

## Non-Functional Requirements

### NFR-RB1 — Testable Balance Invariants
The sustainability invariants in FR-RB1 and FR-RB3 should be expressed as testable invariants (e.g., simulate N cooldown cycles of optimal play and assert Hunger/Happiness do not trend past their safe range), building on the project's existing property-based testing setup (fast-check), so future constant tuning can't silently reintroduce this bug.

### NFR-RB2 — Tunability Preserved
Consistent with the original NFR4, all rebalanced values remain named, tunable constants in `src/domain/constants.ts` — no magic numbers introduced.

## Explicitly Out of Scope
- Energy/Rest's own regen mechanics — not flagged as broken (Energy already fully recovers within one Rest cycle by original design).
- UI/visual changes — this is a rules/constants change only.
- Exact numeric constant values — deferred to Functional Design. *(Source: Q7:B)*

## Traceability

| Requirement | Answered By |
|---|---|
| FR-RB1 | Q1:A, Q2:D, Q6:B, Q7:B |
| FR-RB2 | Q3:A |
| FR-RB3 | Q4:A, Q6:B |
| FR-RB4 | Q5:A |
| FR-RB5 | Q1:A (guardrail) |
| NFR-RB1 | Existing Property-Based Testing extension decision |
| NFR-RB2 | Original NFR4 |

## Key Requirements Summary

- Rebalance Hunger/Feed, Happiness/Play, and the Rest interaction together (not Feed in isolation) so diligent play is provably sustainable for both Hunger and Happiness, while neglect still degrades the pet — consistent with the original "no game-over, but neglect has consequences" design.
- Decay rates, action deltas, cooldowns, and critical/happy thresholds are all open to retuning as a combined set; exact numbers are a Functional Design decision, not fixed here.
- Scoped to the domain logic layer only — no new components, no UI changes.
