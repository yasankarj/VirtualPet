# Virtual Pet — Clarification Questions

I detected one contradiction and one ambiguity in your answers that need clarification before I generate the requirements document.

## Contradiction 1: Decay Behavior While App Is Closed
You indicated decay ticks only while the app is open, pausing when closed (Q4:B), but also that persistence should restore state including "decay that happened while closed" (Q7:A). These are contradictory — if decay pauses when closed, there is no closed-time decay to catch up on.

### Clarification Question 1
Which behavior do you actually want?

A) Decay only happens while the app is open (simulated ticks, e.g. every few seconds). On reopen, the pet resumes exactly where it left off — no catch-up math for closed time. (Matches your original Q4:B)

B) Decay happens continuously based on real elapsed time, including while closed. On reopen, the app calculates how much time passed and applies catch-up decay. (Matches your original Q7:A)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Ambiguity 1: Scooby-Doo Mood Images
Your answer to Q9 ("Use scooby doo images from online which matches to each mood") is ambiguous on two points: (1) how the images should be sourced/stored, and (2) it uses copyrighted character artwork in what you've described as a learning/portfolio project (Q10:A), which could be a concern if ever shown publicly or deployed.

### Clarification Question 2a — Image Sourcing
How should the mood images be obtained and served by the app?

A) I will manually pick/download a handful of Scooby-Doo images myself and drop them into the project's assets folder — the app just references local files by mood

B) The AI should generate simple placeholder/emoji-style art per mood instead (avoids copyright concerns entirely, no external images needed)

C) Hotlink directly to image URLs on the public internet per mood (least reliable — links can break, slower, and carries the same copyright caveat)

D) Other (please describe after [Answer]: tag below)

[Answer]: B

### Clarification Question 2b — Copyright Awareness
Scooby-Doo characters/artwork are copyrighted by Warner Bros. Discovery. Are you OK proceeding with this as a personal/local learning project (not for public distribution or deployment)?

A) Yes — this stays a local/personal learning project only, not published or distributed

B) No — please suggest a generic, non-copyrighted alternative (e.g., original simple pet sprites/emoji) instead

C) Other (please describe after [Answer]: tag below)

[Answer]: A
