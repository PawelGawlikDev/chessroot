# Chess App

A web-based chess application built with Angular 22. Features interactive game play, PGN import/export, move analysis, and Cloudflare Workers deployment.

Built with [Chessground](https://github.com/ornicar/chessground) for the board UI, [chess.js](https://github.com/jhlywa/chess.js) for game logic, and [NgRx](https://ngrx.io) for state management.

## Prerequisites

- Node.js 20+
- Yarn 4.17+
- Angular CLI (`npm install -g @angular/cli`)

## Setup

```bash
yarn install
```

## Development server

```bash
yarn start
```

Navigate to `http://localhost:4200/`. The application automatically reloads on source file changes.

## Build

```bash
yarn build
```

Build artifacts are stored in `dist/`. Production builds are optimized by default.

## Deploy

```bash
# Production
yarn deploy

# Development
yarn deploy:dev
```

Deploys to Cloudflare Workers via Wrangler.

## Tests

```bash
# Unit tests (Vitest)
yarn test

# With coverage
yarn test:coverage

# End-to-end (Playwright)
yarn e2e

# E2E with debugger
yarn e2e:debug
```

## Storybook

```bash
yarn storybook
```

Component documentation and visual testing served at `http://localhost:6006/`.

## Code quality

```bash
# Lint
yarn lint

# Format
yarn prettier
```

## Release

```bash
# Standard release (patch)
yarn release

# Major/minor
yarn release:major
yarn release:minor
```

Uses [standard-version](https://github.com/conventional-changelog/standard-version) with conventional commits.

## Tech stack

- **Framework:** Angular 22 (standalone components, signals)
- **UI:** Chessground, Angular Material
- **State:** NgRx (store, effects, signals)
- **Styling:** SCSS
- **Testing:** Vitest, Playwright
- **Documentation:** Storybook, Compodoc
- **Deployment:** Cloudflare Workers (Wrangler)
- **CI:** Husky, Commitlint, Lint-staged
