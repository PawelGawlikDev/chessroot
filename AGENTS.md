# AGENTS.md

Project instructions for AI coding agents working in this repository.

## Project overview

ChessRoot (npm package name: `chessroot`) is a web-based chess application built with **Angular 22**. It features interactive game play, PGN import/export, move analysis, and deploys to Cloudflare Workers.

Key libraries:

- **Angular 22** — standalone components, signals, signal-based inputs/outputs
- **NgRx** (store, effects, signals via `@ngrx/signals`) — state management
- **Chessground** — board UI
- **chess.js / chessops / @mliebelt/pgn-parser** — game logic, analysis, PGN handling
- **RxJS** — reactive streams
- **Vitest** — unit tests (via `@angular/build:unit-test`, config in `vitest.config.ts`)
- **Playwright** — end-to-end tests (`playwright.config.ts`)
- **Cloudflare Workers (Wrangler)** — deployment

## Package manager

This project uses **Yarn 4 (Berry)** with the `node-modules` linker. The version is pinned via `"packageManager": "yarn@4.17.1"` in `package.json` and `yarnPath` in `.yarnrc.yml`.

**Always run project commands with `yarn`. Never use `npm`, `npx`, `pnpm`, or global binaries for this project's scripts.**

- Install dependencies: `yarn install` (CI uses `yarn install --frozen-lockfile`)
- Run a script: `yarn <script>`
- Run the Angular CLI: `yarn ng <command>` (e.g. `yarn ng generate component foo`)
- Do not edit `yarn.lock` by hand — let Yarn manage it.

## Common commands

| Task                               | Command                                                     |
| ---------------------------------- | ----------------------------------------------------------- |
| Install dependencies               | `yarn install`                                              |
| Dev server (http://localhost:4200) | `yarn start`                                                |
| Production build (`dist/`)         | `yarn build`                                                |
| Build + upload maps to Sentry      | `yarn build:release`                                        |
| Lint (ESLint)                      | `yarn lint`                                                 |
| Format all files (Prettier)        | `yarn prettier`                                             |
| Unit tests (Vitest)                | `yarn test`                                                 |
| Unit tests with coverage           | `yarn test:coverage`                                        |
| Unit tests (UI mode)               | `yarn test:ui`                                              |
| E2E tests (Playwright)             | `yarn e2e`                                                  |
| E2E with debugger                  | `yarn e2e:debug`                                            |
| Conventional commit (Commitizen)   | `yarn cz`                                                   |
| Release (standard-version)         | `yarn release` (also `release:major`, `release:minor`)      |
| Deploy to Cloudflare Workers       | `yarn deploy` (production), `yarn deploy:dev` (development) |

### Sentry

Errors and automatic Release Health sessions are reported to the `pawe-gawlik/chessroot` project.
`src/main.ts` sets `release` to `v` + `package.json` version at SDK initialization; keep it aligned with
the deployed git tag. After successful CI deployment, `yarn sentry:release "$GITHUB_REF_NAME"` creates
and finalizes the matching release in one command so it appears before any error events. Do not rely
on healthy sessions or Debug ID uploads to create a visible release. No separate finalize/deployment
registration command or `SENTRY_RELEASE` variable is needed. For manual deploys, run
`yarn sentry:release vX.Y.Z` with the deployed version afterward.

- Environment is compiled through `angular.json`'s `SENTRY_ENVIRONMENT` define: `production` by default,
  `development` for debug/development builds. `yarn start` disables reporting through `isDevMode()`.
- Production source maps are uploaded as Debug ID artifact bundles and deleted from `dist/` before upload.
  Development uses `yarn build:dev:release`, uploading and retaining JavaScript and CSS source maps
  for browser debugging. `yarn build:dev` builds without Sentry credentials for local inspection.
  `public/_headers` must allow the Sentry ingest hosts in `connect-src`.
- Required CI secret: `SENTRY_AUTH_TOKEN` (scope `org:ci`). Locally it goes in `.sentryclirc`, which
  is gitignored. Never commit an auth token; the browser DSN in `src/main.ts` is public by design.

## Repository structure

```
src/
  app/
    components/     -- UI components
    services/       -- API services, auth
    state/          -- NgRx store
    model/          -- Types and interfaces
    utils/          -- Pure utility functions
    achievements/   -- Achievement definitions and checkers
e2e/                -- Playwright end-to-end tests
```

## Code conventions

- TypeScript with strict mode
- Angular standalone components (no NgModules)
- Signals for state management; NgRx for app-wide state
- Run `yarn lint` and `yarn prettier` before finishing changes
- Conventional Commits enforced by commitlint + Husky; lint-staged runs `eslint --fix` and `prettier --write` on staged files
  - Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`, `build`, `ci`, `revert`
- Prettier: single quotes, print width 100, `angular` HTML parser
- Releases/changelog generated with standard-version (CHANGELOG.md)

## CI

GitHub Actions CI runs on owner pushes to `master` or manual dispatch, not external pull requests:
`yarn install --frozen-lockfile` → `yarn lint` → `yarn test` on Node 22. All jobs check both `github.actor`
and `github.triggering_actor` against `PawelGawlikDev`. Production deployments use the protected
`production` environment and require owner approval. See `SECURITY.md` before changing these controls.

## Working in this repo (for agents)

1. Read `README.md`, `CONTRIBUTING.md`, and `DESIGN.md` for context before large changes.
2. Install dependencies with `yarn install` if `node_modules` is missing or out of date.
3. Make minimal, focused changes that follow existing patterns.
4. Verify your work before finishing:
   - `yarn lint` — no new lint errors
   - `yarn build` — no build errors
   - `yarn test` — relevant unit tests pass (add/update tests when changing behavior)
   - `yarn e2e` — when the change affects user-facing flows
5. Format changed files with `yarn prettier` (or let lint-staged handle it on commit).
6. Do not commit changes unless the user asks.
