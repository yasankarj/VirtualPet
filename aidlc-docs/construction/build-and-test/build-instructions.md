# Build Instructions

## Prerequisites
- **Build Tool**: Vite 5.x + TypeScript 5.x (`tsc -b && vite build`)
- **Runtime**: Node.js >= 22 (pinned via `package.json` `engines.node`; required because the test setup relies on the `--no-experimental-webstorage` Node flag — see Troubleshooting)
- **Dependencies**: All listed in `package.json` (React 18, Vite, Vitest, Testing Library, fast-check)
- **Environment Variables**: None — fully client-side app (NFR1, NFR3), no `.env` required
- **System Requirements**: Any OS with Node 22+; no special memory/disk requirements (small SPA)

## Build Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Not applicable — no environment variables or external credentials needed.

### 3. Build the App
```bash
npm run build
```
This runs `tsc -b` (type-check) followed by `vite build` (production bundle).

### 4. Verify Build Success
- **Expected Output**: `vite build` reports transformed module count and writes `dist/index.html`, `dist/assets/*.js`, `dist/assets/*.css` with gzip sizes; exit code 0.
- **Build Artifacts**: `dist/` directory (gitignored — regenerate via `npm run build`).
- **Common Warnings**: `npm install` may report `npm audit` vulnerability counts in transitive dev dependencies (Vite/esbuild toolchain) — informational only for this local learning project (NFR5), not a build blocker.

## Verified Result (2026-09-03)
Build was run and passed: `tsc -b && vite build` completed with 0 errors, producing `dist/index.html` (0.40 kB), `dist/assets/index-*.css` (0.88 kB), `dist/assets/index-*.js` (147.17 kB) in ~330ms.

## Troubleshooting

### Build Fails with Dependency Errors
- **Cause**: `node_modules` missing or stale after a `package.json` change.
- **Solution**: Run `npm install` again; delete `node_modules` and `package-lock.json` and reinstall if the issue persists.

### Build Fails with Compilation Errors
- **Cause**: TypeScript strict-mode violation (the project uses `strict`, `noUnusedLocals`, `noUnusedParameters`).
- **Solution**: Read the `tsc -b` error output (file:line), fix the type issue, rerun `npm run build`.

### `npm test` fails with `localStorage` errors on Node 22+
- **Cause**: Node 22+ ships an experimental global `localStorage` that can shadow jsdom's implementation inside the Vitest test environment.
- **Solution**: Already handled — the `test`/`test:watch` scripts run under `cross-env NODE_OPTIONS=--no-experimental-webstorage`. If you invoke `vitest` directly instead of via `npm test`, set that flag yourself.
