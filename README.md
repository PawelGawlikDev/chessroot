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

## AI development with OpenCode

This repository ships with a ready-to-use [OpenCode](https://opencode.ai) setup: an `AGENTS.md` with project instructions for AI agents, custom agents in `.opencode/agents/`, and MCP servers declared in `opencode.json`. All project commands are run with **Yarn** — never `npm`/`npx`/`pnpm` (see `AGENTS.md`).

### Install OpenCode

- **Docs:** https://opencode.ai/docs/
- **Install script (macOS/Linux):** `curl -fsSL https://opencode.ai/install | bash`
- **npm:** `npm install -g opencode-ai`
- **Homebrew (macOS/Linux):** `brew install anomalyco/tap/opencode`
- **Windows:** `choco install opencode` or `scoop install opencode` (WSL recommended)
- **Prebuilt binaries:** https://github.com/anomalyco/opencode/releases

### Configure a model provider

1. Run `opencode` from the project root.
2. Run `/connect` and pick a provider — [OpenCode Zen](https://opencode.ai/auth) or any supported provider (e.g. Anthropic, OpenAI).
3. Paste your API key.

### Usage

```bash
cd /path/to/chessroot
opencode
```

- `/init` — (re)generates `AGENTS.md` for this project (already included; keep it committed).
- **Tab** — cycle between primary agents (`developer`, `build`, `plan`).
- `@mention` — invoke any agent directly, e.g. `@reviewer` or `@tester`.
- `/undo`, `/redo` — revert/restore changes; `/share` — share the conversation.
- **Plan mode** — switch with Tab to analyze and plan without making changes.

### Custom agents

Defined in `.opencode/agents/`:

| Agent       | Mode    | Purpose                                                                          |
| ----------- | ------- | -------------------------------------------------------------------------------- |
| `developer` | primary | Implements features and fixes bugs (full file + terminal access)                 |
| `reviewer`  | all     | Read-only code review: correctness, Angular/NgRx best practices, security, tests |
| `tester`    | all     | Writes and runs unit (Vitest) and e2e (Playwright) tests                         |

### MCP servers

Declared in `opencode.json` (launched automatically by OpenCode):

| Server            | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `angular-cli`     | Angular CLI tools (scaffold, build, test)        |
| `vitest`          | Run and debug unit tests                         |
| `chrome-devtools` | Inspect and debug the running app in the browser |
| `playwright`      | Browser automation and e2e flows                 |

> The MCP servers are started via `npx` on first use; all other project commands use `yarn` as documented in `AGENTS.md`.

## Tech stack

- **Framework:** Angular 22 (standalone components, signals)
- **UI:** Chessground, Angular Material
- **State:** NgRx (store, effects, signals)
- **Styling:** SCSS
- **Testing:** Vitest, Playwright
- **Documentation:** Compodoc
- **Deployment:** Cloudflare Workers (Wrangler)
- **CI:** Husky, Commitlint, Lint-staged
