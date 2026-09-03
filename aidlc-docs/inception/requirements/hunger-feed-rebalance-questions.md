# Hunger/Feed Rebalance — Clarifying Questions

## Context: What I found

This is a change request against the already-built `virtual-pet-web-app` (previously completed through Build and Test). I reviewed `src/domain/rules.ts`, `src/domain/constants.ts`, and `business-rules.md`, which already documented this exact imbalance as a known "Balance Caveat" at original design time (deferred, not fixed).

**Root cause**: Hunger rises `DECAY_PER_TICK = 5` per second regardless of anything the player does. Feed can only be used once every `ACTION_COOLDOWN_MS = 5000ms` (5s), and during those 5 seconds Hunger accumulates `5 x 5 = 25` points of decay — but Feed only removes `15` (`FEED_HUNGER_DELTA = -15`). So the best possible outcome, spamming Feed the instant the cooldown clears, still nets **+10 Hunger every 5-second cycle**.

This is stronger than a "loop" — it's a one-way ratchet: Hunger is mathematically guaranteed to climb to the max (100) no matter how attentively the player feeds, permanently trips the `CRITICAL_HUNGER_THRESHOLD` (80) check, which in turn permanently drives Health down (the Health Rule decays Health whenever Hunger is critical), pinning the pet in a "SICK"/critical state forever. That contradicts the original requirement (FR4) that corrective action should be able to prevent/reverse neglect.

**Related conflicts I noticed while tracing this** (same underlying pattern, different severity):
- **Play compounds it**: Play adds `+15` Hunger on top of decay (`PLAY_HUNGER_DELTA`), so using Play at all accelerates the same problem.
- **Happiness has a milder version of the identical bug**: Play's cooldown is also 5s, decay removes `25` Happiness over that window, Play only adds back `20` → net `-5` Happiness per cycle. Diligent play still can't hold Happiness steady long-term.
- **Resting is a blind spot**: Hunger (and Happiness) keep decaying while Resting, but Feed/Play are disabled during Rest. A full 10-second Rest guarantees `+50` Hunger with zero way to counteract it mid-rest.

None of this is a coding bug — the code correctly implements the rules as designed; the *rules themselves* don't balance. Fixing it means changing constants and/or rules, which is a game-design decision, so I want your call on the target behavior before touching anything.

---

## Question 1
What should the target Hunger behavior be for a diligent player (one who feeds every time it's off cooldown)?

A) Sustainable — diligent feeding should be able to keep Hunger safely below the critical threshold indefinitely (Feed should structurally outpace decay across a cooldown window)

B) Slower drift — Hunger should still trend upward over time even under diligent feeding, but much more gently than today (not an almost-immediate ratchet to permanent critical) — neglect should still be meaningfully worse than active care

C) Fully flat — an attentive player should be able to hold Hunger near its low starting value indefinitely, effectively neutralizing decay

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
Which lever(s) should be adjusted to achieve the target from Question 1?

A) Increase Feed's Hunger reduction (`FEED_HUNGER_DELTA`) so one Feed clears more than a full cooldown's worth of decay

B) Shorten Feed's cooldown specifically (decouple Feed's cooldown from Play's `ACTION_COOLDOWN_MS`, so Feed can be used more often)

C) Reduce the Hunger decay rate itself

D) A combination of the above, tuned together rather than a single change

E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 3
Play's Hunger penalty (`PLAY_HUNGER_DELTA = +15`) directly undoes Feed's fix if left alone whenever Play is used. Should Play be rebalanced in this same change?

A) Yes — rebalance Play's Hunger penalty alongside Feed, so Play doesn't reintroduce the same problem

B) No — scope this change to Feed/Hunger decay only; leave Play exactly as it is today

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
Happiness has the same underlying pattern as a side effect (diligent Play still nets -5 Happiness per cycle). Should that be fixed as part of this change?

A) Yes — fix it now for consistency, since it's the same root cause

B) No — out of scope; this request is about Hunger/Feed only, handle Happiness/Play separately later

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
Hunger (and Happiness) currently keep decaying during Rest even though Feed/Play are unavailable, guaranteeing a Hunger spike every time the player rests. Should this interaction change?

A) Yes — suspend or slow Hunger (and/or Happiness) decay while Resting, similar to how Energy's normal decay is already suspended during Rest

B) No — this is an acceptable intentional trade-off (resting has a cost); leave it as is

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
Should the Mood/Health thresholds (`CRITICAL_HUNGER_THRESHOLD = 80`, `HAPPY_HUNGER_THRESHOLD = 40`) be open to adjustment too, if it helps hit the target from Question 1, or should only rates/deltas/cooldowns move?

A) Keep thresholds fixed — only adjust decay rates, action deltas, and/or cooldowns

B) Thresholds can also move if it helps achieve the target balance

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7
Once the target behavior is agreed, how should I proceed?

A) Propose exact new constant values now, as part of the requirements document, for your approval

B) Keep the requirements directional/qualitative (e.g. "Feed must net non-positive Hunger change over one cooldown cycle under optimal play") and work out precise numbers later in Functional Design

C) Other (please describe after [Answer]: tag below)

[Answer]: B
