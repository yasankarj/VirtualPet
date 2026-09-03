# Functional Design Plan — Refresh Game & Pet Naming/Renaming (unit: virtual-pet-web-app)

## Design Tasks

- [x] Define the `name` field addition to the `PetState` domain model, plus `DEFAULT_PET_NAME`/`MAX_PET_NAME_LENGTH` constants
- [x] Define the name validation rule (trim, non-empty, length limit) as a reusable business rule
- [x] Define the Reset ("Refresh") operation's exact effect (which fields reset, which are preserved)
- [x] Define the Rename operation's business rule
- [x] Define how "first launch, no saved pet" is detected to gate the initial naming prompt (distinct from the pet's name happening to equal the default)
- [x] Define the persisted data shape change and storage-key version bump (`.v2` → `.v3`)
- [x] Define frontend component structure for: the naming/rename dialog, the pet name display, and the Refresh control
- [x] Define user interaction flows: first-launch naming, rename-at-any-time, refresh

## Clarifying Questions

Please answer by filling in the letter after each `[Answer]:` tag.

### Question 1 — Dialog Presentation
Should the initial naming prompt (and the Rename dialog) appear as a modal overlay that blocks interaction with the rest of the game underneath, or as an inline element on the page that doesn't block anything?

A) Modal overlay — blocks background interaction until dismissed (Save or Skip/Cancel)

B) Inline element on the page (e.g. replaces or sits above the pet display) — no blocking overlay

C) Other (please describe after [Answer]: tag below)

[Answer]: C: The modal overlay should be fine. But make sure the Modal function should not be like in a typical web app. should be game friendly, interesting one.

### Question 2 — Skip Affordance for Initial Naming
Besides typing a name and clicking a "Start"/"Save" button, how should skipping the initial naming prompt work (FR-NR4 — defaults to "Pet")?

A) Explicit "Skip" button only — clicking outside the dialog or pressing Escape does nothing; the player must click Save or Skip

B) Any dismissal counts as skipping — explicit "Skip" button, clicking outside, or pressing Escape all assign the default name

C) Other (please describe after [Answer]: tag below)

[Answer]: C: A large cross button to close the modal should skip naming!

### Question 3 — Shared Component for Naming and Rename
Should the Rename dialog reuse the same component as the initial naming prompt (with a mode difference — Save + Skip when there's no name yet, Save + Cancel when renaming an existing pet), or should they be two separate, independently-built components?

A) Same reusable component, mode-driven (Skip → default on first naming; Cancel → keep existing name on rename)

B) Two separate components

C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4 — Invalid Name Feedback
When a submitted name is invalid (empty after trim, or over the 20-character limit from FR-NR6), how should that be communicated to the player?

A) Inline error message below the input field; dialog/prompt stays open until a valid name (or Skip/Cancel) is given

B) Rely on native HTML input constraints only (`maxlength=20`, `required`) to prevent invalid submission — no custom error message

C) Other (please describe after [Answer]: tag below)

[Answer]: A
