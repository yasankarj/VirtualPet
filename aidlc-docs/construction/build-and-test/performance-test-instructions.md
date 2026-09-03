# Performance Test Instructions

## Applicability: N/A

Formal performance/load testing does not apply to this project and is documented here rather than silently skipped:

- **Requirements**: `requirements.md` defines no performance NFR (no response-time, throughput, or concurrency targets) — this is a single-user, fully client-side learning project (NFR5).
- **Extension Configuration**: Resiliency Baseline extension was opted out at Requirements Analysis (no load/scalability requirements to validate against).
- **Architecture**: No backend, no network calls, no concurrent users to simulate (NFR1, NFR3, FR6: exactly one pet, one local session).

## What Was Checked Instead

Basic client-side performance was informally observed as part of the manual browser verification during Code Generation:
- Production bundle size: `dist/assets/index-*.js` = 147.17 kB (47.30 kB gzipped) — small, no code-splitting needed at this scale.
- The 1-second tick interval (`TICK_INTERVAL_MS`) runs a lightweight pure-function pipeline (`tick()`) with no observable UI jank during manual testing.

## If Performance Testing Becomes Relevant Later
Should this project grow beyond a local learning app (e.g., gain a backend or many concurrent users), revisit this file and define concrete targets (response time, throughput, concurrent users, error rate) before adding load-testing tooling (e.g., k6, Lighthouse CI for bundle/runtime performance).
