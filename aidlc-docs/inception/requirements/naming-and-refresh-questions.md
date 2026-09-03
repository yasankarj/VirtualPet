# Requirements Clarification Questions — Refresh Game & Pet Naming/Renaming

Please answer each question by filling in the letter choice after the `[Answer]:` tag. If none of the options match, choose the last option (Other) and describe your preference. Let me know when you're done.

## Question 1
What should "Refresh" actually do to the pet?

A) Full reset — clears all pet data (stats, name, cooldowns, graces) and starts over as if for the very first time, including re-prompting for a pet name

B) Soft reload — just reloads the page/app view, no change to any saved pet data (equivalent to a browser refresh)

C) Stat reset only — resets Hunger/Happiness/Energy/Health to their starting values but keeps the existing pet name

D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
Where should the Refresh control be placed in the UI?

A) A button/icon in the header, near the title

B) Inside a settings/menu panel

C) Next to the pet's name/display area

D) Other (please describe after [Answer]: tag below)

[Answer]: D: At the bottom

## Question 3
Refresh is potentially destructive to progress. Should it require a confirmation step before it takes effect?

A) Yes — always show a confirm dialog ("Are you sure?") before refreshing

B) No — refresh immediately, no confirmation needed

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
When should the pet-naming prompt appear?

A) Only once — the very first time the app is opened with no saved pet (a genuinely new/unnamed pet)

B) Every time the app starts, even if a pet already exists (re-prompt unless explicitly dismissed)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
How should renaming an already-named pet be triggered (separate from the initial naming prompt)?

A) A dedicated "Rename" button/icon near the pet's name display, usable any time

B) Renaming only happens via Refresh (i.e. "starting over" is the only way to rename)

C) Both — a standalone Rename control AND Refresh also lets you set a new name as part of starting fresh

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
What naming rules should apply to the pet's name?

A) Any non-empty text, trimmed of whitespace, up to a reasonable character limit (e.g. 20 characters)

B) Any non-empty text, trimmed of whitespace, no length limit

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
What should happen if the user tries to skip/dismiss the naming prompt without entering a name?

A) Assign a default name (e.g. "Pet") automatically, and let them rename later via the Rename control

B) Block progress — a name is required before the game can start/continue

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
Should the pet's name persist across sessions the same way stats currently do (saved to localStorage alongside `PetState`)?

A) Yes — persist the name with the rest of pet state

B) No — ask for a name fresh every session, don't persist it

C) Other (please describe after [Answer]: tag below)

[Answer]: A
