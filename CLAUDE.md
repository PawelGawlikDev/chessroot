# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` holds the full command reference, package-manager rules (Yarn 4 only — never npm/npx/pnpm), commit conventions, and the pre-finish checklist. Read it. This file covers the architecture that spans multiple files.

## Running a single test

`ng test` uses the `@angular/build:unit-test` builder (Vitest runner, jsdom, `vitest.config.ts` as `runnerConfig`, `src/test-ng-setup.ts` as setup). Specs live in `__tests__/` directories next to the source they cover.

```bash
yarn test --watch=false --include src/app/services/lichess.service.spec.ts   # one file
yarn test --filter "opening graph"                                           # by suite/test name regex
yarn test --list-tests                                                       # enumerate discovered specs
```

`yarn test:ui` opens the Vitest UI; `yarn e2e` runs Playwright specs in `e2e/` (starts the dev server via the Angular `serve` target).

## Path aliases — change in two places

`@model`, `@services`, `@utils`, `@achievements`, `@enums`, `@state`, `@components`, `@pipes` are declared **both** in `tsconfig.json` (`paths`) **and** `vitest.config.ts` (`resolve.alias`). Adding or renaming an alias requires editing both, or tests break while the build passes. `eslint.config.js` also lists the alias names for import-order grouping. Each alias resolves to an `index.ts` barrel; new files must be re-exported there to be importable via the bare alias.

## Big picture

ChessRoot is a client-side-only Angular 22 SPA (standalone components, signals, `ChangeDetectionStrategy.OnPush`, `input()`/`output()`/`model()`/`linkedSignal`). There is no application backend — the Cloudflare Worker (`worker.ts`) only serves the built static assets from `dist/chessroot/browser` and rewrites 404s to `/index.html` for SPA routing. All data comes from the public Lichess and Chess.com APIs, called directly from the browser.

### Four routes, one shared data-fetch pattern

Routes (`src/app/app.routes.ts`): `/` landing, `/achievements`, `/tools` (insights), `/explorer` (opening explorer). The three feature pages each embed `GameFetchPanelComponent`, which drives a shared NgRx form slice, then stream the user's games and feed them through a page-specific analyzer:

- **achievements** → `GameCheckerService`
- **tools** → in-component insight aggregation
- **explorer** → `OpeningGraphService` + `OpeningBookService`

### Game fetching

`LichessService` and `ChessComService` are the site adapters. Both wrap `ChessFetchService` (HTTP with exponential-backoff retry, ndjson streaming for Lichess, Lichess OAuth bearer-token injection, `AbortController`-based cancellation). Games arrive as PGN, are parsed with `@mliebelt/pgn-parser`, and normalized to the `Game` model (`@model/game.model.ts`). Fetching is incremental: callers pass a `GameCallback` and games are delivered in batches of `BATCH_SIZE` so the UI updates progressively. `LichessAuthService` (OAuth2 PKCE via `@bity/oauth2-auth-code-pkce`) runs in `provideAppInitializer`; token/username persist in `localStorage`.

### NgRx state (`src/app/state`, wired in `app.config.ts`)

Two feature slices, classic action/reducer/selector/effect layout, each with a barrel `index.ts`:

- **`userData`** — the shared fetch-filter form: `platform`, `playerColor`, date range, `timeControls`. Read by every feature page and `GameFetchPanel`.
- **`explorer`** — `bookMoves` only. `ExplorerEffects` (the only effects class) fetches Lichess opening-explorer data on `fetchBook`, short-circuiting to failure when not logged in.

Local component and cross-component-service state uses plain signals, not the store (`OpeningManagerService`, `OpeningBookService.config`, `StockfishAnalysisService`).

### Achievements engine (`src/app/achievements`)

Each achievement is a **pure function** — `(moves: PgnMove[])` or `(game: Game)` → `TrophyCheckResult` (`{ color, onMoveNumber }[]`, empty when not earned). `GameCheckerService.checkGame()` runs every detector over one game and returns `Map<achievementKey, TrophyCheckResult>`. Presentation data (title, description, `category`) lives separately in `achievements/metadata.ts` (`ACHIEVEMENTS_METADATA`, `ACHIEVEMENT_CATEGORIES`: `proud` / `funny` / `checkmate` / `speed` / `dirty` / `pawn` / `piece`).

Adding an achievement: create the detector file → export it from `achievements/index.ts` → call it in `GameCheckerService` → add a `metadata.ts` entry → add a spec in `achievements/__tests__/`.

### Opening explorer services

- **`OpeningGraphService`** — builds an in-memory graph of positions (keyed by a simplified FEN, first 3 fields) from the user's games, accumulating per-move win/draw/loss and opponent-Elo stats.
- **`OpeningBookService`** — fetches Lichess opening-explorer "book" moves for a FEN; signal-based config, in-memory cache, cleared on config change.
- **`OpeningManagerService`** — ply-navigation state (list of `{fen, move}`, current-index signal) for stepping through a line.
- **`StockfishAnalysisService`** — spawns a Web Worker from `/assets/stockfish/stockfish.js` (+ `.wasm`) for local UCI evaluation; all state exposed as signals.

## Deploy & release

`yarn deploy` / `yarn deploy:dev` run `ng build` then `wrangler deploy` to the `production` / `development` Worker env. CI does not deploy on push to `master`; deploys are triggered by version tags (`v*.*.*` → production, `v*.*.*-*` → dev) via `.github/workflows/`. `yarn release` / `release:dev` use `standard-version` (config in `.versionrc.json`) to bump, changelog, tag, and push. PR CI runs `yarn lint` and `yarn test` on Node 22.

## Conventions worth knowing

- ESLint enforces `@typescript-eslint/no-explicit-any` as an **error**, explicit member accessibility on class members, no unused imports, and strict import ordering (`newlines-between: always`, alphabetized, aliases grouped as `internal`). Templates are linted too (`src/**/*.html`).
- Component selectors use the `cr-` prefix (e.g. `cr-tools`), though `angular.json` sets the app prefix to `app`.
- Component directories prefixed `+` (`+tools`, `+opening-explorer`, `+achivements` — note the spelling) are the routed page components; nested `components/` hold their children.
- TS is strict; `strictTemplates` is on. `experimentalDecorators` is enabled but code uses standalone `inject()` DI, not constructor params.
