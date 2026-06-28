# ChessRoot — Development Roadmap

> Bridges the gap between the current client-side SPA and the full chess analytics platform vision.

---

## Current State

**ChessRoot** is a pure client-side Angular 22 SPA. Games are fetched from Lichess and Chess.com public APIs and analyzed entirely in the browser. There is no backend, no database, and no Stockfish engine integration.

### Already Built

| Feature                                             | Status |
| --------------------------------------------------- | ------ |
| Game fetching (Lichess NDJSON + Chess.com archives) | ✅     |
| PGN parsing (`@mliebelt/pgn-parser`)                | ✅     |
| Chess.js board replay for position analysis         | ✅     |
| ~65 achievement checkers across 9 categories        | ✅     |
| W/D/L summary cards                                 | ✅     |
| Doughnut chart by color (Chart.js)                  | ✅     |
| Bar charts for openings / opponents / time controls | ✅     |
| Lichess OAuth (PKCE)                                | ✅     |
| Dark/light theme                                    | ✅     |
| Angular Material UI                                 | ✅     |
| Cloudflare Workers deployment (static SPA)          | ✅     |
| Unit tests (Vitest), E2E (Playwright), Storybook    | ✅     |

### Key Data Already Available from Lichess API

| Field                      | Source      | Use                               |
| -------------------------- | ----------- | --------------------------------- |
| `game.analysis[].eval`     | Lichess API | Per-move engine evaluation        |
| `game.analysis[].judgment` | Lichess API | Blunder/mistake/inaccuracy labels |
| `game.clocks[]`            | Lichess API | Milliseconds per move             |
| `game.opening.eco`         | Lichess API | ECO classification code           |
| `game.opening.name`        | Lichess API | Full opening name                 |
| `game.players.*.rating`    | Lichess API | Rating at time of game            |
| `game.timestamp`           | Lichess API | When the game was played          |

**Many planned features can be implemented client-side right now** using data that's already fetched with every game.

---

## Phase 0: Immediate Wins

_Leverage data already in the Game model — no new infrastructure._

### 0.1 Rating Over Time Chart (`/tools`)

- Games already carry `players.white.rating / black.rating`
- Sort games by `timestamp`, filter by current user's color, plot line chart
- Add time range filter (1M / 3M / 6M / 1Y / ALL)
- Compute and display `peak_rating` and trend (±last 7 days)
- **Files:** New component in `src/app/components/+tools/components/`, Chart.js Line chart

### 0.2 Streak Counter

- Sort games chronologically (newest first), count consecutive wins
- Track `longestWinStreak` — persist in localStorage
- Display in the Insights dashboard with a fire icon for active streaks
- **Files:** `tools.component.ts` logic, new stat display in template

### 0.3 W/D/L by Color

- Data already computed in `Insights` model (`winsAsWhite`, `winsAsBlack`, etc.)
- UI: two side-by-side doughnut charts or a color toggle on the existing chart
- **Files:** Enhance `InsightsDonutComponent`

### 0.4 Move Classification (Blunders / Mistakes / Inaccuracies)

- **Already in Lichess data**: `game.analysis[].judgment` (`{name: 'blunder'|'mistake'|'inaccuracy', comment: '...'}`)
- Aggregate per game or across all games
- Compute `accuracy %` using centipawn-loss formula on eval diffs
- **Files:** New analysis service + accuracy pipe

### 0.5 Accuracy Bar UI

- Two parallel progress bars (white / black) showing 0-100%
- Color-coded segment for blunders (red), mistakes (orange), inaccuracies (yellow)
- **Files:** New `accuracy-bar` component

### 0.6 Opening Explorer — W/D/L per Opening

- Opening stats already computed in `openingMap` in ToolsComponent
- Add minimum threshold filter (≥3 games)
- Add ECO code display alongside opening name
- Sortable table view as alternative to bar chart
- **Files:** Enhance existing `BarChartComponent` or add a table component

### 0.7 Time Management — Move-by-Move Graph

- `game.clocks[]` already provides milliseconds per move
- Bar chart of time per move, overlaid with eval line (dual-axis chart)
- Highlight moves where the player spent >2× their average
- **Files:** New `time-graph` component

---

## Phase 1: Enhanced UX & New Routes

_New Angular pages, richer visualizations, game-level drill-down._

### 1.1 Game Detail View (new route: `/game/:id`)

- Full move list with board visualization
  - Options: `ngx-chess-board`, `@mliebelt/chessboard`, or custom canvas
- Move-by-move eval chart + time graph side by side
- Accuracy bar for the game
- Opening name + ECO displayed
- Link to Lichess game page
- **Files:** `src/app/components/+game-detail/`, new route in `app.routes.ts`

### 1.2 Stats Dashboard (new route: `/stats` or enhanced `/tools`)

- Rating line chart (Chart.js Line or Area)
- Side-by-side W/D/L by color (two doughnuts or stacked bar)
- Streak display (current + lifetime best)
- Openings table with W/D/L progress bars per row
- Time control distribution with accuracy correlation
- Time range filter (1M / 3M / 6M / 1Y / ALL) applied to all charts
- **Files:** New dashboard component or major enhancement to `ToolsComponent`

### 1.3 Opening Explorer Tab (new route: `/openings`)

- Full opening repertoire view
- Per-opening: games count, win rate, average opponent rating, accuracy
- Filter by time control category and color
- Expandable rows to see individual games in that opening
- Minimum game threshold config (default 3)
- **Files:** `src/app/components/+openings/`, new route

### 1.4 Client-Side Persistence (IndexedDB)

- Use `idb` library to cache game data locally
- Avoid re-fetching same games on repeated visits
- Store computed insights and aggregations
- Cache busting based on last game timestamp
- **Files:** New `cache.service.ts`

---

## Phase 2: Backend Infrastructure (Cloudflare)

_Add server-side persistence using your existing Cloudflare stack — no PostgreSQL or Redis needed._

### 2.1 Cloudflare D1 Database

- SQLite-compatible, edge-distributed, zero administration
- Schema:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  platform TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE games (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  white_player TEXT NOT NULL,
  black_player TEXT NOT NULL,
  result TEXT NOT NULL,
  termination_reason TEXT,
  time_control TEXT,
  category TEXT,
  moves_pgn TEXT,
  opening_eco TEXT,
  opening_name TEXT,
  played_at TEXT NOT NULL,
  white_rating INTEGER,
  black_rating INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE game_analysis (
  game_id TEXT PRIMARY KEY,
  white_accuracy REAL,
  black_accuracy REAL,
  white_blunders INTEGER,
  black_blunders INTEGER,
  white_mistakes INTEGER,
  black_mistakes INTEGER,
  white_inaccuracies INTEGER,
  black_inaccuracies INTEGER,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE move_timestamps (
  game_id TEXT NOT NULL,
  move_number INTEGER NOT NULL,
  player TEXT NOT NULL,
  time_spent_ms INTEGER,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

### 2.2 Cloudflare Workers API (Hono)

- Lightweight router framework, runs on Workers
- Endpoints:
  - `POST /api/games` — batch import games
  - `GET /api/users/:username/stats` — aggregated statistics
  - `GET /api/users/:username/ratings` — rating time series
  - `GET /api/users/:username/openings` — opening stats with ECO grouping
  - `GET /api/games/:id` — single game with analysis + move timestamps
- Row-level security via user tokens (Lichess OAuth)

### 2.3 User Accounts via Lichess OAuth

- Today: OAuth provides a client-side token to fetch games
- Upgrade: Exchange token server-side, create/lookup user in D1
- Store refresh tokens, allow cross-session persistence
- Future: anonymous mode for visitors who don't want to log in

### 2.4 Background Analysis Queue (Workers Queues)

- When games are imported, enqueue an analysis job
- For Lichess games: transform existing API analysis data and store in D1
- For Chess.com games: enqueue for browser-side Stockfish WASM or server-side analysis

---

## Phase 3: Stockfish & Advanced Analytics

_Bring engine evaluation to the browser via Stockfish WASM._

### 3.1 Stockfish WASM

- `@mliebelt/stockfish` or `stockfish.js` npm package
- Run analysis on Chess.com games (no built-in eval data)
- Run deeper analysis on selected Lichess games (user clicks "Deep Analyze")
- Compute centipawn-loss-per-move → accuracy %

### 3.2 Accuracy Calculation Engine

- For each position, compare player's move vs best engine move
- Standard formula: `100 - (centipawn_loss / max_possible_loss) * 100`, clamped 0-100
- Per-move classification:
  - **Blunder:** >200 centipawn loss
  - **Mistake:** 100-200 centipawn loss
  - **Inaccuracy:** 50-100 centipawn loss
- Aggregate for per-game and per-player accuracy stats

### 3.3 Puzzle Module (Tactics)

- Extract tactical positions from user's own games (blunders / missed tactics)
- Present the position and ask the user to find the best move
- Simple rating system (correct streak / total correct)
- Optional: Glicko-2 rating for puzzle difficulty tracking

### 3.4 Time Management Analytics

- Average time per move in critical positions (middlegame, endgame)
- Time remaining when the game ended (flagging analysis)
- Correlation between think time and move quality (eval improvement)
- Flagging frequency by time control

---

## Phase 4: Social & Sharing

### 4.1 Shareable Game Snapshots

- Generate OG image of game summary (accuracy, key moments, result)
- Share to Twitter/X, Bluesky, Discord

### 4.2 Compare with Friends

- Head-to-head comparison: accuracy, opening repertoire, time management
- Leaderboard among linked accounts
- "Who played better this month?" challenges

### 4.3 Progress Reports

- Weekly/monthly in-app summary
- "Your accuracy improved from 72% → 78% this month"
- "You played the Italian Game 15 times with 67% win rate"
- "Your biggest weakness: endgame blunders (43% of total mistakes)"

---

## Architecture Decisions

| Decision        | Original Plan       | Recommendation                | Rationale                                          |
| --------------- | ------------------- | ----------------------------- | -------------------------------------------------- |
| **Database**    | PostgreSQL          | **Cloudflare D1**             | Already on Cloudflare, zero ops, global edge       |
| **Backend**     | Node.js / Python    | **Cloudflare Workers (Hono)** | Same deploy target, no server management           |
| **Async Tasks** | RabbitMQ / Celery   | **Workers Queues**            | Native Cloudflare, no Redis to maintain            |
| **Stockfish**   | Server-side worker  | **WASM in browser**           | Simpler, no server cost, keeps app client-side     |
| **Frontend**    | React / Vue         | **Keep Angular**              | Heavy investment, Angular 22 is modern and capable |
| **Charts**      | recharts / Chart.js | **Keep Chart.js + D3**        | Chart.js already in use; D3 for complex custom viz |

---

## Effort Summary

| Phase       | Duration        | Dependencies | Delivers                                                           |
| ----------- | --------------- | ------------ | ------------------------------------------------------------------ |
| **Phase 0** | 1-2 weeks       | None         | Rating chart, streaks, accuracy, time graphs, opening W/D/L        |
| **Phase 1** | 3-4 weeks       | Phase 0      | Game detail view, stats dashboard, opening explorer, local caching |
| **Phase 2** | 4-6 weeks       | Phase 1      | Multi-user backend, persistent data, API                           |
| **Phase 3** | 3-4 weeks       | Phase 2      | Stockfish analysis, puzzle module, time analytics                  |
| **Phase 4** | 2-3 weeks       | Phase 2-3    | Social features, sharing, reports                                  |
| **Total**   | **13-19 weeks** | —            | Full analytics platform                                            |

---

## Quick Wins — This Week

| Task                        | Effort  | Data Source                | New File(s) / Changes                 |
| --------------------------- | ------- | -------------------------- | ------------------------------------- |
| Rating line chart           | Small   | `game.players.*.rating`    | New component in `+tools/components/` |
| Streak counter              | Small   | Chronological game sort    | `tools.component.ts` logic + template |
| Blunder/mistake aggregation | Small   | `game.analysis[].judgment` | New analysis util + pipe              |
| Accuracy bar component      | Medium  | Eval diff calculation      | New `accuracy-bar` component          |
| Move timing chart           | Medium  | `game.clocks[]`            | New `time-graph` component            |
| Openings W/D/L table        | Small   | Already computed           | Template enhancement or new table     |
| ECO code display            | Trivial | `game.opening.eco`         | Template string interpolation         |
