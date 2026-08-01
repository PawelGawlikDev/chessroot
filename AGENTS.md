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

GitHub Actions runs on pull requests: `yarn install --frozen-lockfile` → `yarn lint` → `yarn test` on Node 22.

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
