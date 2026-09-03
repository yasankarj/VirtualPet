# Execution Plan — Hunger/Feed Rebalance

## Detailed Analysis Summary

### Change Impact Assessment
- **User-facing changes**: Yes — observable gameplay behavior changes (Hunger/Happiness become sustainably manageable under diligent play; Rest interaction changes); no UI markup/layout changes.
- **Structural changes**: No — no new components, no architecture change.
- **Data model changes**: No (expected) — `PetState`/`PetStats` shapes are unchanged; only constant values and decay/rule logic within existing functions are retuned. Functional Design will confirm no new state field is needed for FR-RB4 (Rest interaction), since `isResting` already exists on `PetState`.
- **API changes**: N/A — no backend/API surface (client-side only, per NFR5).
- **NFR impact**: Minor — reaffirms existing NFR4 (tunable constants) and extends the existing Property-Based Testing extension's coverage (NFR-RB1); no new NFR category introduced.

### Component Relationships
- **Primary Component**: `virtual-pet-web-app` domain logic layer — `src/domain/constants.ts`, `src/domain/rules.ts`.
- **Dependent Components**: `src/App.tsx` and UI components (`StatBar`, `ActionPanel`) consume `PetState`/`PetStats` and mood/health outputs from this layer — they read the same shapes, so no changes expected there, but Build and Test should verify the UI still renders correctly against the new numbers.
- **Supporting Components**: existing test suites (`tests/`) for `rules.ts` — will need new/updated invariant tests per NFR-RB1.

### Risk Assessment
- **Risk Level**: Low — isolated to one existing component's internal rules/constants; no architecture, data model, or API change.
- **Rollback Complexity**: Easy — plain git revert of the domain-layer changes.
- **Testing Complexity**: Moderate — the fix must satisfy explicit sustainability invariants (FR-RB1, FR-RB3) across several interacting constants, which needs deliberate multi-cycle simulation tests, not just single-value assertions.

## Workflow Visualization

```mermaid
flowchart TD
    Start(["Change Request: Hunger/Feed Rebalance"])

    subgraph INCEPTION["INCEPTION PHASE"]
        WD["Workspace Detection<br/><b>COMPLETED</b>"]
        RA["Requirements Analysis<br/><b>COMPLETED</b>"]
        US["User Stories<br/><b>SKIP</b>"]
        WP["Workflow Planning<br/><b>COMPLETED</b>"]
        AD["Application Design<br/><b>SKIP</b>"]
        UG["Units Generation<br/><b>SKIP</b>"]
    end

    subgraph CONSTRUCTION["CONSTRUCTION PHASE"]
        FD["Functional Design<br/><b>EXECUTE</b>"]
        NFRA["NFR Requirements<br/><b>SKIP</b>"]
        NFRD["NFR Design<br/><b>SKIP</b>"]
        ID["Infrastructure Design<br/><b>SKIP</b>"]
        CG["Code Generation<br/><b>EXECUTE</b>"]
        BT["Build and Test<br/><b>EXECUTE</b>"]
    end

    subgraph OPERATIONS["OPERATIONS PHASE"]
        OPS["Operations<br/><b>PLACEHOLDER</b>"]
    end

    Start --> WD
    WD --> RA
    RA --> WP
    WP --> FD
    FD --> CG
    CG --> BT
    BT -.-> OPS
    BT --> End(["Complete"])

    style WD fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style RA fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style WP fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style FD fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray: 5 5,color:#000
    style CG fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style BT fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style US fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style AD fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UG fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style NFRA fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style NFRD fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style ID fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style OPS fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style INCEPTION fill:#BBDEFB,stroke:#1565C0,stroke-width:3px,color:#000
    style CONSTRUCTION fill:#C8E6C9,stroke:#2E7D32,stroke-width:3px,color:#000
    style OPERATIONS fill:#FFF59D,stroke:#F57F17,stroke-width:3px,color:#000
    style Start fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000
    style End fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000

    linkStyle default stroke:#333,stroke-width:2px
```

## Phases to Execute

### INCEPTION PHASE
- [x] Workspace Detection (COMPLETED — existing project resumed)
- [x] Requirements Analysis (COMPLETED — `hunger-feed-rebalance-requirements.md`)
- [x] User Stories (SKIPPED — user proceeded directly; bug-fix/rebalance with clear scope, single user type, no personas or acceptance-criteria collaboration needed)
- [x] Workflow Planning (this document)
- [ ] Application Design — **SKIP**
  - **Rationale**: No new components or services; change is entirely within the existing domain logic layer's component boundary.
- [ ] Units Generation — **SKIP**
  - **Rationale**: Single existing unit (`virtual-pet-web-app`); no decomposition needed.

### CONSTRUCTION PHASE
- [ ] Functional Design — **EXECUTE**
  - **Rationale**: FR-RB1–FR-RB5 require detailed business-rule design — determining the exact combination of decay rates, action deltas, cooldowns, and thresholds that jointly satisfy the sustainability invariants (not a single obvious number change), plus specifying the Rest interaction change (FR-RB4). This updates `business-rules.md` and the per-unit functional design artifacts.
- [ ] NFR Requirements — **SKIP**
  - **Rationale**: No new NFRs; existing NFR4 (tunable constants) and the already-decided Property-Based Testing extension already cover this change's needs (NFR-RB1, NFR-RB2 are extensions of existing NFRs, not new categories).
- [ ] NFR Design — **SKIP**
  - **Rationale**: NFR Requirements skipped.
- [ ] Infrastructure Design — **SKIP**
  - **Rationale**: No infrastructure involved (client-side only, per NFR5).
- [ ] Code Generation — **EXECUTE (ALWAYS)**
  - **Rationale**: Implement the retuned constants/rules in `src/domain/constants.ts` and `src/domain/rules.ts`, plus the new invariant tests (NFR-RB1).
- [ ] Build and Test — **EXECUTE (ALWAYS)**
  - **Rationale**: Full test suite (including new balance-invariant tests) must pass; UI smoke-check that the app still behaves correctly with new numbers.

### OPERATIONS PHASE
- [ ] Operations — PLACEHOLDER (no deployment/monitoring workflow defined)

## Estimated Timeline
- **Total Stages to Execute**: 5 (Requirements Analysis, Workflow Planning, Functional Design, Code Generation, Build and Test)
- **Estimated Duration**: Single session — small, well-scoped domain-logic change

## Success Criteria
- **Primary Goal**: Diligent Feed/Play play keeps Hunger and Happiness sustainably in a safe range indefinitely, while neglect still visibly degrades the pet (FR-RB1–FR-RB5).
- **Key Deliverables**: Updated `business-rules.md` (Functional Design), updated `constants.ts`/`rules.ts` (Code Generation), new/updated invariant tests, all existing tests still passing.
- **Quality Gates**: All unit/property tests pass; new sustainability-invariant tests pass; `npm run build` succeeds; manual/headless smoke check confirms UI still reflects stats correctly.
