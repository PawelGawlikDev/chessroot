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

### Search engines and AI search

Public pages (`/`, `/explorer`, `/tools`, `/achievements`) are prerendered by Angular at build time.
The homepage content, navigation links, and page-specific metadata are available without JavaScript.
Interactive tools load in browser-only deferred blocks; account state and games are never prerendered.
Deployment still serves static files from `dist/chessroot/browser` and does not require a Node SSR server.

- Page metadata: `src/app/seo-pages.ts`; canonical URLs use `https://chessroot.org`.
- Crawler discovery: `public/robots.txt` and `public/sitemap.xml`.
- Share image: `public/social-preview.png`; regenerate with `yarn node scripts/generate-social-preview.mjs`.
- Cloudflare drops trailing slashes to match canonicals and preserves real 404 responses for unknown URLs.

After deploying:

1. Verify `chessroot.org` in Google Search Console and submit `https://chessroot.org/sitemap.xml`.
2. Use URL Inspection on all four URLs; check rendered content and Google's selected canonical.
3. If the former `.app` domain is still under your control, configure a permanent domain redirect to
   `https://chessroot.org`, preserving paths and query strings. This requires domain/CDN account access.
4. Review Cloudflare bot/WAF rules and crawl logs: public search crawlers should not receive challenges.
   Robots.txt already permits crawling; account-level rules can still block it.
5. Check indexing and impressions over time. Share useful tutorials with relevant chess communities
   rather than manufacturing reviews or backlinks. Indexing and AI citations are not guaranteed.

Google's AI Overviews and AI Mode use the same SEO fundamentals as Search; no special AI file or
invented ratings are needed. See [Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features).

## Deploy

A release is versioned once and promoted from development to production. The git tag is the single
source of truth for the version.

Merging to `master` starts the **Release** workflow automatically. It:

1. bumps the version and updates `CHANGELOG.md` with `standard-version`,
2. commits the release and creates the `vX.Y.Z` tag,
3. pushes the commit and tag back to `master`.

The tag push then triggers **Deploy Dev**, so every merge to `master` goes live on development. The
release commit itself is skipped by the workflow guard, so it does not create a second release.

When the version is ready for production, run the **Deploy Production** workflow manually
(`workflow_dispatch`) and enter the tag, for example `v1.10.0`. Production therefore never runs ahead
of development, and both environments report the same version.

The production workflow checks out the requested tag, verifies that the tag matches the `package.json`
version, and requires the development deployment for the same commit to have succeeded. It also waits
for approval in the protected `production` environment.

The **Release** workflow needs a `RELEASE_TOKEN` secret: a fine-grained token with `contents: write`
(or a classic token with the `repo` scope) owned by `PawelGawlikDev`. `GITHUB_TOKEN` cannot be used
because its pushes do not trigger other workflows and do not bypass the owner-only tag ruleset.

Manual releases remain possible:

```bash
yarn release
```

The release workflow skips the resulting release commit, but its tag push still deploys development.

Local deploys remain available for emergencies:

```bash
# Production
yarn deploy

# Development
yarn deploy:dev
```

Deploys to Cloudflare Workers via Wrangler.

The **PR checks** workflow runs lint and tests on every pull request, including external PRs, with a
read-only token and no deployment secrets. The **Release** workflow runs on owner pushes to `master`
without repeating lint or tests. Release and deployment jobs remain owner-only, including reruns.
Production runs lint and tests again on the selected tag before building and deploying through manual dispatch and
additionally require the owner's approval in the protected `production` environment. When using the tag
input from `master`, the environment must allow the `master` branch; the workflow checks out and verifies
the requested tag itself. To keep the environment restricted to `v*` tags, start the workflow from the
tag ref instead:

```bash
gh workflow run deploy-production.yml --ref v1.10.0
```

See [SECURITY.md](SECURITY.md) for the live tag/environment protections and the remaining
Sentry/Cloudflare dashboard checks.

Both deploys report errors and automatic Release Health sessions to Sentry (`pawe-gawlik/chessroot`).
CI passes the git tag into the build as `SENTRY_RELEASE`, so the app reports exactly the released
version (`v1.10.0`) even if `package.json` drifts; local builds fall back to `v` + the `package.json`
version.

- `yarn build` / `yarn deploy` → `production`
- `yarn build:dev` / `yarn deploy:dev` → `development`
- `yarn start` → Sentry disabled, so local testing does not affect release health

The environment is compiled into the bundle through `angular.json`; no runtime metadata request is
needed. After each successful CI deployment, `yarn sentry:release` with the deployed tag creates and
finalizes the matching release in one command. This makes it visible immediately, without waiting
for an error event to auto-create it. Healthy sessions and Debug ID-only source-map uploads should
not be relied on to create a visible release entry. No separate finalize or deployment-record step
is needed. After a manual deployment, run `yarn sentry:release vX.Y.Z` with the deployed version.

Crash-free session metrics populate after deployment and real traffic, not during the build. The SDK
tracks sessions automatically; with SDK v11 a session continues across SPA route changes. To identify
users across sessions for Crash Free Users, call `Sentry.setUser({ id })` with an appropriate stable
user ID after login and `Sentry.setUser(null)` after logout. User identification is optional and is not
enabled by this setup.

Both environments build with JavaScript source maps and upload them to Sentry as Debug ID artifact
bundles. Development keeps the `.map` files in the deployed bundle for browser debugging;
`yarn build:release` removes them from `dist/` before the production Workers upload.
`SENTRY_AUTH_TOKEN` (`org:ci` scope) is required for source-map uploads and release registration in
both deployment workflows. Locally the token goes in `.sentryclirc` (gitignored). Debug IDs link
errors to the uploaded maps without a `SENTRY_RELEASE` environment variable. To inspect the build
locally without Sentry credentials, run `yarn build:dev`; local `yarn start` also enables source maps.

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
