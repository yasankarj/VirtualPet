# Decay Pacing — Clarification Questions

Your answers were mostly consistent, but I found two things worth confirming before I write these up as requirements, since they meaningfully change the behavior.

## Ambiguity 1: "Overall too fast" (Q1:B) vs. the fix you picked (Q2:D)

You said the core issue is that the tick rate itself feels too fast **overall** (Q1:B) — but the fix direction you picked (Q2:D = A+B) doesn't touch the global tick rate at all. It only changes decay timing *around your own actions*: aligning the decay clock to Feed/Play/Rest, plus a grace period after Feed/Play. That combination will make things feel much calmer while you're actively playing (decay resets/pauses around every action), but if you're **not** interacting — just watching the pet idle — decay still ticks every 1 second exactly as it does today, since nothing in A+B changes `TICK_INTERVAL_MS` itself.

### Clarification Question 1
Which actually matches what you want?

A) That's fine — my "too fast overall" feeling was really about the moments right after acting (Feed/Play); A+B already addresses that, I don't need the idle/background tick rate itself slowed down

B) No — I do want the baseline tick rate itself slowed down too (add Option C from Question 2: increase `TICK_INTERVAL_MS`) on top of A+B, so it feels calmer even when I'm not actively feeding/playing

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Ambiguity 2: Q4's grace length (~3-4s) vs. Feed's 3-second cooldown

Feed's cooldown is 3 seconds. If the grace period is also ~3-4 seconds and restarts on every Feed, then a diligently-fed pet's Hunger will almost never decay at all while you're actively feeding — each Feed re-arms the pause before the previous one runs out. That goes beyond "sustainable" (Hunger trending down) to effectively "frozen" during active play. Neglect is unaffected either way, since grace only triggers on your own actions. You said in Q5 you're open to revisiting the sustainability numbers, so this isn't necessarily wrong — I just want to confirm it's actually what you want rather than an accidental side effect of picking "3-4 seconds."

### Clarification Question 2
A) Yes — that's the intended feel: while I'm actively feeding, Hunger should barely move at all

B) No — I'd rather the grace period stay shorter than Feed's cooldown (so some decay still happens between feeds, just not an immediate jarring tick right after eating), even if that means a shorter grace than the "3-4 seconds" I picked

C) Other (please describe after [Answer]: tag below)

[Answer]: B
