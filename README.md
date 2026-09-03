# Virtual Pet (Tamagotchi)

A small client-side virtual pet game. Feed, play with, and rest your pet to keep its Hunger, Happiness, Energy, and Health stats in good shape. No backend — everything runs in the browser and state is saved to `localStorage`.

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

Runs unit tests (Vitest + Testing Library) and property-based tests (fast-check) for the domain logic and its `localStorage` persistence round-trip.

## Build

```bash
npm run build
```

## Project Structure

```
src/
  domain/        Pure business logic (types, constants, rules, persistence, factory)
  components/     StatBar, PetDisplay, ActionPanel
  assets/         Mood -> emoji/label art table
  App.tsx         Root component: game loop, action handlers, persistence
tests/
  domain/         Business logic unit + property-based tests
  components/      Component tests
  App.test.tsx     App-level integration test
```

## Tuning

All game-balance constants (decay rate, action deltas, cooldown/rest durations, health/mood thresholds) live in `src/domain/constants.ts` as named constants — adjust them there to rebalance the game.

## Design Documentation

Requirements and functional design docs live under `aidlc-docs/` (requirements, business rules, domain entities, frontend component design).
