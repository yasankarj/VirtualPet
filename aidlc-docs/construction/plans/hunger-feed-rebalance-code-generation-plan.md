# Code Generation Plan — Hunger/Feed Rebalance (unit: virtual-pet-web-app)

**Type**: Brownfield modification. All target files already exist — every step below modifies in place, no new files except the new balance-invariant test file.

**Source of truth**: `aidlc-docs/construction/virtual-pet-web-app/functional-design/business-rules.md` (updated Constants table, Decay/Feed/Play/Rest Rules, and the resolved Design Note listing invariants FR-RB1–FR-RB5).

Confirmed by grep: `ACTION_COOLDOWN_MS`, `FEED_HUNGER_DELTA`, `PLAY_HUNGER_DELTA`, `PLAY_HAPPINESS_DELTA` are referenced only in `src/domain/constants.ts` and `src/domain/rules.ts` — no UI component reads them directly, so no frontend changes are needed.

## Steps

- [x] **Step 1 — Business Logic: `src/domain/constants.ts`**
  - Change `FEED_HUNGER_DELTA` from `-15` to `-20`.
  - Change `PLAY_HAPPINESS_DELTA` from `20` to `30`.
  - Change `PLAY_HUNGER_DELTA` from `15` to `8`.
  - Remove `ACTION_COOLDOWN_MS`; add `FEED_COOLDOWN_MS = 3000` and `PLAY_COOLDOWN_MS = 5000` in its place.
  - Update the file's header comment reference if needed (points to `business-rules.md`, already accurate).

- [x] **Step 2 — Business Logic: `src/domain/rules.ts`**
  - `applyDecay`: rewrite so Hunger, Happiness, and Energy are **all** left unchanged when `state.isResting` is true (currently only Energy has this early-out via ternary); apply all three decays together when not resting. Update the function's doc comment accordingly.
  - `applyFeed`: use `FEED_COOLDOWN_MS` instead of `ACTION_COOLDOWN_MS` when setting `feedRemainingMs`.
  - `applyPlay`: use `PLAY_COOLDOWN_MS` instead of `ACTION_COOLDOWN_MS` when setting `playRemainingMs`.
  - Update the import list to match (drop `ACTION_COOLDOWN_MS`, add `FEED_COOLDOWN_MS`, `PLAY_COOLDOWN_MS`).

- [x] **Step 3 — Business Logic Unit Testing: `tests/domain/rules.test.ts`**
  - Update imports: replace `ACTION_COOLDOWN_MS` with `FEED_COOLDOWN_MS` and `PLAY_COOLDOWN_MS`.
  - `applyFeed` test: assert `feedRemainingMs` equals `FEED_COOLDOWN_MS`.
  - `applyPlay` test: assert `playRemainingMs` equals `PLAY_COOLDOWN_MS`.
  - Add a new `describe("applyDecay")` block covering: (a) decays Hunger up / Happiness down / Energy down by `DECAY_PER_TICK` while awake; (b) leaves Hunger, Happiness, and Energy all unchanged while resting (the new FR-RB4 behavior — previously only Energy was covered, implicitly, via the Rest tests).
  - Existing Feed/Play/Rest/Health/Mood example values (e.g. hunger 80 = critical) stay valid since thresholds didn't change — no other edits needed in this file.

- [x] **Step 4 — Business Logic Unit Testing (new): `tests/domain/rules.balance.test.ts`**
  - New file implementing the 5 invariant scenarios from the Functional Design plan (NFR-RB1), each a deterministic simulation built from the existing pure rule functions (`tick`, `applyFeed`, `applyPlay`, `applyRest`) — no new production code needed, these compose what Step 1–2 produce:
    1. Optimal Feed-only play over several `FEED_COOLDOWN_MS` cycles → final Hunger ≤ starting Hunger (FR-RB1).
    2. Optimal Feed+Play combined over a 30s window (10 feeds @3s, 6 plays @5s) → final Hunger ≤ starting Hunger (FR-RB2).
    3. Optimal Play-only over several `PLAY_COOLDOWN_MS` cycles → final Happiness ≥ starting Happiness (FR-RB3).
    4. A full Rest cycle (`REST_DURATION_MS` worth of ticks) with `isResting=true` → Hunger and Happiness unchanged, Energy regenerates as before (FR-RB4).
    5. Total neglect (only `tick()` calls, no actions) → Hunger crosses `CRITICAL_HUNGER_THRESHOLD` within the same ~14 ticks as pre-rebalance, and Health is strictly decreasing once critical (FR-RB5 guardrail — proves neglect wasn't softened).

- [x] **Step 5 — Business Logic Summary**
  - Update `aidlc-docs/construction/virtual-pet-web-app/code/business-logic-summary.md` (markdown doc, not app code) to record the rebalance: new constants, new test file, reference to the resolved Balance Caveat in `business-rules.md`.

No API Layer, Repository Layer, Frontend Components, Database Migration, or Deployment Artifacts steps — this unit has none of those layers (client-only app, per NFR1/NFR3/NFR5), and this change touches no frontend code.

## Traceability
| Step | Requirement(s) |
|---|---|
| 1, 2 | FR-RB1, FR-RB2, FR-RB3, FR-RB4 |
| 3, 4 | NFR-RB1 |
| 1–5 | NFR-RB2 (values stay named/tunable constants) |
