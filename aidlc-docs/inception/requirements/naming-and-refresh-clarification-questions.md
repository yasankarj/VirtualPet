# Refresh Game & Pet Naming/Renaming — Clarification Questions

I detected one ambiguity in your answers that needs clarification before I can write the requirements document.

## Ambiguity 1: Scope of "Stat reset only" (Q1)
You chose Q1:C — "Stat reset only — resets Hunger/Happiness/Energy/Health to their starting values but keeps the existing pet name." This tells me the four stats reset and the name is preserved, but it doesn't say what happens to the pet's **other** state: action cooldowns (Feed/Play), decay graces, and whether an in-progress Rest is stopped.

### Clarification Question 1
When the player hits Refresh, what should happen to cooldowns, decay graces, and Resting state?

A) Reset everything else too — cooldowns and graces clear to 0, and Resting stops if active (only the stats and the name follow their Q1 answer: stats reset, name preserved)

B) Leave them completely untouched — only the four stat values change; if the player was mid-cooldown or mid-Rest, that continues exactly as before

C) Other (please describe after [Answer]: tag below)

[Answer]: A
