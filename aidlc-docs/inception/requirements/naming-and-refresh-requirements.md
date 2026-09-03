# Refresh Game & Pet Naming/Renaming — Requirements

## Intent Analysis Summary

- **User Request**: "1. Ability to refresh the game. 2. When starting the game, user should be able to name / rename the pet!"
- **Request Type**: New Feature — two related but independent capabilities, neither of which exists in the current implementation
- **Scope Estimate**: Multiple Components — touches the persisted data shape (`src/domain/types.ts`, `factory.ts`, `persistence.ts`), the domain/rules layer (a new reset operation, name validation), and the frontend (`App.tsx` + new naming/rename/refresh UI elements)
- **Complexity Estimate**: Moderate — adds a new persisted field (name) requiring another storage-key version bump (continuing the project's established `.v1`→`.v2` pattern), plus two new UI flows (initial naming, rename), but no new external integrations or backend

## Functional Requirements

### FR-NR1 — Refresh Control
A Refresh control is available at the bottom of the app. Clicking it takes effect immediately, with no confirmation dialog. *(Source: Q2:D — "at the bottom"; Q3:B — no confirmation)*

### FR-NR2 — Refresh Resets Gameplay State, Preserves Identity
Refresh resets: the four stats (Hunger/Happiness/Energy/Health) to their starting values, both action cooldowns (Feed/Play) to 0, both decay graces to 0, and Resting state to not-resting (any in-progress Rest is stopped). The pet's **name is not changed** — it is preserved exactly as it was before Refresh. *(Source: Q1:C — stat reset, keep name; Clarification Q1:A — extend the reset to cooldowns/graces/Resting too)*

### FR-NR3 — Initial Naming Prompt (First Launch Only)
The first time the app is opened with no existing saved pet state, the player is prompted to name the pet before/at the start of the game. This prompt does not reappear on later app starts once a pet exists (named or defaulted). *(Source: Q4:A)*

### FR-NR4 — Default Name on Skip
If the player dismisses the initial naming prompt without entering a name, the pet is automatically assigned the default name "Pet," and the game proceeds normally — naming is never a hard blocker to play. *(Source: Q7:A)*

### FR-NR5 — Rename Control
A dedicated Rename control (button/icon) is displayed near the pet's name, usable at any time during gameplay — not gated by cooldowns, grace periods, or Resting state. This is the **only** way to rename an already-named pet; Refresh (FR-NR2) does not prompt for a new name. *(Source: Q5:A)*

### FR-NR6 — Name Validation
A submitted name (initial naming or rename) must be non-empty after trimming leading/trailing whitespace, and must not exceed 20 characters. An invalid submission (empty after trim, or over the limit) is rejected — the prompt/control stays open rather than accepting it. *(Source: Q6:A)*

### FR-NR7 — Name Persistence
The pet's name is persisted in `localStorage` as part of `PetState`, alongside stats/cooldowns/graces/resting state, so it survives page reloads and browser restarts. *(Source: Q8:A)*

## Non-Functional Requirements

### NFR-NR1 — Storage Key Version Bump
Adding a `name` field changes the persisted `PetState` shape. Per the project's existing versioned-storage-key policy (already exercised once, `.v1`→`.v2`, for the Decay Pacing change), `PET_STATE_STORAGE_KEY` must bump again (e.g. `.v2`→`.v3`). No migration code — an old, incompatible save simply falls back to a fresh default pet via the existing `isValidPetState` guard, which will then correctly trigger FR-NR3's first-launch naming prompt again.

### NFR-NR2 — No Regression to Existing Invariants
Refresh must not alter or bypass any existing balance/pacing rule. It only sets stats/cooldowns/graces/resting back to their starting/default values through the same domain layer used at pet creation — the sustainability invariants from the Hunger/Feed Rebalance (FR-RB1–FR-RB5) and the pacing guarantees from Decay Pacing (FR-DP1–FR-DP6) are unaffected, since Refresh is a state reset, not a rule change.

### NFR-NR3 — Accepted Risk: No Confirmation on Refresh
Per Q3:B, Refresh is intentionally immediate/irreversible with no "Are you sure?" step. This is a deliberate scope decision, not an oversight — documented here so it isn't "fixed" unprompted later.

## Explicitly Out of Scope
- Any confirmation/undo mechanism for Refresh (Q3:B ruled this out).
- Renaming as part of the Refresh flow (Q5:A — Rename is a separate, standalone control).
- Re-prompting for a name on every app start (Q4:A — first launch only).
- Any change to decay/rebalance rule math — this change only adds a reset operation and naming, it does not touch `rules.ts`'s decay/action deltas.

## Traceability

| Requirement | Answered By |
|---|---|
| FR-NR1 | Q2:D, Q3:B |
| FR-NR2 | Q1:C, Clarification Q1:A |
| FR-NR3 | Q4:A |
| FR-NR4 | Q7:A |
| FR-NR5 | Q5:A |
| FR-NR6 | Q6:A |
| FR-NR7 | Q8:A |
| NFR-NR1 | Continuity with existing `.v1`→`.v2` versioned-storage policy (NFR5) |
| NFR-NR2 | Continuity with FR-RB1–FR-RB5, FR-DP1–FR-DP6 |
| NFR-NR3 | Q3:B |

## Key Requirements Summary

- **Refresh**: a no-confirmation control at the bottom of the app that resets stats, cooldowns, graces, and Resting state back to a fresh start, while preserving the pet's current name.
- **Naming**: a one-time prompt on genuinely first launch (defaults to "Pet" if skipped), plus an always-available, separate Rename control — both validated to a non-empty, ≤20-character trimmed name.
- **Persistence**: the name lives in `PetState` in `localStorage`; adding it requires bumping the storage key version, consistent with how the project already handled the last persisted-shape change.
- No changes to existing decay/action balance math — this is additive (new field + new UI flows + a reset operation), not a rebalance.
