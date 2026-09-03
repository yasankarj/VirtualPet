# Decay Pacing ("Sudden" Feel After Feeding) — Clarifying Questions

## Context: What I found

This builds directly on the just-completed Hunger/Feed Rebalance (`hunger-feed-rebalance-requirements.md`), so I'm treating it as an extension of that change rather than a separate one.

I traced the mechanism in `src/App.tsx`: there is a single global timer —

```js
setInterval(() => tick(...), TICK_INTERVAL_MS) // TICK_INTERVAL_MS = 1000ms
```

— that fires **on its own fixed schedule**, completely independent of when the player clicks Feed/Play/Rest. It is never reset by an action.

That means when you click Feed, the *next* decay tick can land anywhere from ~0ms to ~1000ms later, purely depending on where in the background clock's cycle your click happened to fall. Sometimes you get almost a full second of relief before Hunger starts climbing again; other times it ticks up again almost immediately after you fed. This is the "sudden" / inconsistent feeling — it's not that decay resumes *too fast* on average, it's that the timing relative to your action is essentially random each time.

This is a different issue from what the last change fixed: that one was about the long-run trend (does diligent feeding ever get ahead of decay); this one is about the moment-to-moment feel right after an action. Fixing it shouldn't need to touch the FR-RB1–FR-RB5 sustainability numbers, but I want to confirm that with you rather than assume it.

---

## Question 1
Which best describes what feels "sudden" to you?

A) The timing is inconsistent — sometimes Hunger ticks up almost immediately after feeding, other times there's nearly a full second of relief, depending on luck/timing of the click relative to the background clock

B) The tick rate itself is just too fast overall — one decay step per second feels rushed regardless of feeding

C) It's a visual thing — the stat bar jumps instantly with no transition/animation when Feed's effect applies

D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
Which fix direction do you want to pursue? (this is the main design decision)

A) **Align the decay clock to the action**: after any Feed/Play/Rest, restart the decay countdown from that moment, so there's always a consistent ~1 second of relief after any action — fixes the inconsistency at its root, minimal change to overall pace/balance

B) **Add an explicit grace period** after Feed specifically — a deliberate pause on Hunger decay for a few seconds, longer than just removing the randomness from Question 2:A

C) **Slow down the tick interval itself** (e.g., every 2 seconds instead of every 1) — changes overall game pacing and would require re-deriving the sustainability numbers from the last change

D) A combination of A and B

E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 3
Play has the identical pattern (instant Happiness/Hunger/Energy effect, then decay can resume almost immediately). Should the same fix apply there too?

A) Yes — apply to both Feed/Hunger and Play/Happiness (and Energy), for consistency

B) Feed/Hunger only for now — leave Play's timing as-is

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
If an explicit grace period is part of the fix (Question 2: B or D) — roughly how long should it feel?

A) Short — about one extra tick's worth (~1-2 seconds total pause after feeding)

B) Moderate — a few seconds (~3-4 seconds), noticeably longer than a single tick

C) Let me propose an exact duration during Functional Design, chosen so the existing FR-RB1–FR-RB5 sustainability invariants stay intact

D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
The previous change's sustainability guarantees (FR-RB1–FR-RB5 in `business-rules.md`: diligent feeding/playing stays sustainable, neglect still hits critical Hunger at the same ~14-second pace) — should those stay exactly as-is, with this change being purely about pacing/feel?

A) Yes — purely a pacing/feel fix; the sustainability guarantees from the last change must still hold unchanged

B) I'm open to revisiting the sustainability numbers too if this pacing fix implies different behavior

C) Other (please describe after [Answer]: tag below)

[Answer]: B
