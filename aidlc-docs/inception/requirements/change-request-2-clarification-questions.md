# Change Request #2 Clarification Questions — Feed/Hunger/Energy Rework

Your request:
1. Feed does not need a delay. Hunger should reduce only when play or when not fed over a long time period.
2. When fed, energy should increase.

Reading this against the current rules: today Hunger *rises* automatically every tick (the Decay Rule) and Feed *lowers* it. I've interpreted "Hunger should reduce only when play or when not fed over a long time" as: **remove the automatic per-tick rise in Hunger**, and instead only raise Hunger (a) as a side effect of Play (already true today, unchanged), or (b) through a new "neglect" mechanic that kicks in once the pet hasn't been fed for a while. Feed itself continues to lower Hunger (and will now also raise Energy), with no cooldown.

Please answer each question below by filling in the letter after `[Answer]:`.

## Question 1
Feed loses its cooldown entirely. Should Play's existing 2000ms cooldown be affected by this change?

A) No — only Feed loses its cooldown; Play keeps its 2000ms cooldown as-is

B) Yes — remove Play's cooldown too

C) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 2
Should Happiness and Energy's existing automatic per-tick decay stay exactly as they are today (only Hunger's automatic per-tick rise is being removed)?

A) Yes — only Hunger's automatic per-tick rise is removed; Happiness and Energy keep decaying every tick as before

B) No — Happiness and/or Energy decay should also change (please describe after [Answer]: tag below)

C) Other (please describe after [Answer]: tag below)

[Answer]:C Keep per tick decay for all

## Question 3
How long should the pet go without being fed before the "neglect" mechanic kicks in and Hunger starts rising again?

A) 10 seconds (10 ticks)

B) 20 seconds (20 ticks)

C) 30 seconds (30 ticks)

D) Other (please specify a different duration after [Answer]: tag below)

[Answer]:C

## Question 4
Once the neglect threshold is crossed, how should Hunger rise from then on (until the pet is fed again)?

A) Same rate as the old per-tick decay: +5 per tick

B) A gentler rate: +2 per tick

C) A single one-time jump (e.g. +20) when the threshold is crossed, then no further automatic rise until the next neglect period begins

D) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 5
Feed should now also increase Energy. How much should each Feed add to Energy?

A) +5 (small boost)

B) +10 (moderate boost)

C) +15 (fully offsets the Energy cost of one Play)

D) Other (please specify a different amount after [Answer]: tag below)

[Answer]:B
