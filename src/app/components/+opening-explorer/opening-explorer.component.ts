import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LichessService } from '@services/lichess.service';
import { ChessComService } from '@services/chess-com.service';
import { OpeningGraphService } from '@services/opening-graph.service';
import { OpeningBookService } from '@services/opening-book.service';
import { OpeningManagerService } from '@services/opening-manager.service';
import { GameFetchPanelComponent } from '@components/game-fetch-panel/game-fetch-panel.component';
import { ChessBoardComponent } from '@components/chessboard/chessboard.component';
import { MovesTableComponent } from '@components/moves-table/moves-table.component';
import { MoveNavigationComponent } from '@components/move-navigation/move-navigation.component';
import { BookSettingsDialogComponent } from '@components/+opening-explorer/components/book-settings-dialog/book-settings-dialog.component';
import { Store } from '@ngrx/store';
import {
  selectPlatform,
  selectPlayerColor,
  selectFromDate,
  selectToDate,
  selectTimeControls,
  selectBookMoves,
  ExplorerActions,
} from '@state';
import { Platform } from '@enums';
import { SeoService } from '@services/seo.service';
import type { Game, LichessGameParameters } from '@model';
import { mapGameToTimeControlKey, timeControlsToPerfType } from '@utils';
import type { ExplorerMove, CompareInfo, OpeningBookConfig } from '@model/opening-explorer.model';
import { Chess } from 'chess.js';
import type { DrawShape } from 'chessground/draw';

@Component({
  selector: 'cr-opening-explorer',
  imports: [
    GameFetchPanelComponent,
    ChessBoardComponent,
    MovesTableComponent,
    MoveNavigationComponent,
    MatIconModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './opening-explorer.component.html',
  styleUrl: './opening-explorer.component.scss',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class OpeningExplorerComponent implements OnInit {
  private seo = inject(SeoService);
  private lichessService = inject(LichessService);
  private chessComService = inject(ChessComService);
  private graph = inject(OpeningGraphService);
  private bookService = inject(OpeningBookService);
  private manager = inject(OpeningManagerService);
  private store = inject(Store);
  private dialog = inject(MatDialog);

  public $username = signal('');
  private $platform = this.store.selectSignal(selectPlatform);
  private $playerColor = this.store.selectSignal(selectPlayerColor);
  private $fromDate = this.store.selectSignal(selectFromDate);
  private $toDate = this.store.selectSignal(selectToDate);
  private $timeControls = this.store.selectSignal(selectTimeControls);

  public $isButtonDisabled = computed(
    () => this.$isLoading() || !this.$username() || this.$username() === '',
  );
  public $isLoading = signal(false);
  public $gameCount = signal(0);
  public $gamesAnalyzed = signal(0);
  public $totalGames = signal(0);
  public $loaded = signal(false);
  public $activeTab = signal<'moves' | 'book'>('moves');
  public $bookMoves = this.store.selectSignal(selectBookMoves);
  public $highlightedMove = signal<ExplorerMove | null>(null);

  public ngOnInit(): void {
    this.seo.setSeo(
      {
        title: 'Opening Explorer',
        description:
          'Explore chess openings with an interactive board. Analyze your games side-by-side with master-level opening book moves from Lichess.',
      },
      '/explorer',
    );
    this.store.dispatch(ExplorerActions.fetchBook({ fen: this.$fen() }));
  }

  public $progress = computed(() => {
    const total = this.$totalGames();
    const analyzed = this.$gamesAnalyzed();
    if (total === 0) {
      const received = this.$gameCount();
      return received > 0 ? Math.round((analyzed / received) * 100) : 0;
    }
    return Math.min(Math.round((analyzed / total) * 100), 100);
  });

  public $fen = computed(() => this.manager.fen());
  public $plys = computed(() => {
    this.$currentIndex();
    const mgr = this.manager as unknown as {
      plys: { fen: string; move: { from: string; to: string; san: string } | null }[];
    };
    return mgr.plys;
  });
  public $currentIndex = computed(() => this.manager.currentIndex());
  public $orientation = signal<'white' | 'black'>('white');

  public flipBoard(): void {
    this.$orientation.update((o) => (o === 'white' ? 'black' : 'white'));
  }
  public $turnColor = computed(() => {
    try {
      const chess = new Chess(this.$fen());
      return chess.turn() === 'w' ? 'white' : 'black';
    } catch {
      return 'white';
    }
  });
  public $lastMove = computed(() => {
    const plys = this.$plys();
    const idx = this.$currentIndex();
    if (idx > 0 && idx < plys.length) {
      const m = plys[idx]?.move;
      if (m) return [m.from, m.to] as [string, string];
    }
    return null;
  });

  private $playerMoves = computed<ExplorerMove[]>(() => {
    this.$loaded();
    if (!this.graph.hasMoves) return [];
    const moves = this.graph.movesForFen(this.$fen());
    return moves ?? [];
  });

  public $bookMovesList = computed(() => {
    const bm = this.$bookMoves();
    if (bm.fetch !== 'success' || !bm.moves) return [];
    return bm.moves.map((m) => {
      const chess = new Chess(this.$fen());
      let orig = '',
        dest = '';
      try {
        const mv = chess.move(m.san, { strict: false });
        if (mv) {
          orig = mv.from;
          dest = mv.to;
        }
      } catch {
        /* skip */
      }
      return {
        san: m.san,
        orig,
        dest,
        moveCount: m.moveCount,
        details: m.details,
        level: 1,
      } satisfies ExplorerMove;
    });
  });

  public $mergedMoves = computed<ExplorerMove[]>(() => {
    const playerMoves = this.$playerMoves();
    const bookMoves = this.$bookMovesList();
    if (this.$activeTab() === 'book') return bookMoves;

    const bookMap = new Map<string, ExplorerMove>();
    for (const bm of bookMoves) bookMap.set(bm.san, bm);

    return playerMoves.map((pm) => {
      const bookMatch = bookMap.get(pm.san);
      if (!bookMatch) return pm;
      const compareTo: CompareInfo = {
        bookScore: score(bookMatch),
        userScore: score(pm),
        values: values(pm),
      };
      return { ...pm, compareTo };
    });
  });

  public $arrows = computed<DrawShape[]>(() => {
    const moves = this.$activeTab() === 'book' ? this.$bookMovesList() : this.$playerMoves();
    const highlight = this.$highlightedMove();
    const shapes: DrawShape[] = [];

    if (highlight && highlight.orig && highlight.dest) {
      shapes.push({
        orig: highlight.orig as DrawShape['orig'],
        dest: highlight.dest as DrawShape['dest'],
        brush: 'blue',
      });
    }

    const turn = this.$turnColor();
    for (const m of moves.slice(0, 4)) {
      if (!m.orig || !m.dest) continue;
      if (highlight && this.$activeTab() === 'book') continue;
      if (highlight && highlight.san === m.san) continue;
      const brush =
        turn === 'white'
          ? (['blue', 'paleBlue', 'paleGreen', 'green'][m.level] ?? 'blue')
          : (['blue', 'paleRed', 'paleRed', 'red'][m.level] ?? 'red');
      shapes.push({ orig: m.orig as DrawShape['orig'], dest: m.dest as DrawShape['dest'], brush });
    }
    return shapes;
  });

  public async fetchGames(): Promise<void> {
    this.$isLoading.set(true);
    this.$loaded.set(false);
    this.$gameCount.set(0);
    this.$gamesAnalyzed.set(0);
    this.$totalGames.set(0);
    this.graph.clear();
    this.bookService.clearCache();
    this.manager.reset();
    this.$highlightedMove.set(null);

    try {
      const platform = this.$platform();
      if (platform === Platform.Lichess) {
        const profile = await this.lichessService.profile(this.$username());
        this.$totalGames.set(profile.counts?.all ?? 0);
      } else {
        const profile = await this.chessComService.profile(this.$username());
        this.$totalGames.set(profile.counts?.all ?? 0);
      }
    } catch {
      this.$totalGames.set(0);
    }

    const filterColor = this.$playerColor();
    const fromDate = this.$fromDate();
    const toDate = this.$toDate();
    const timeControls = this.$timeControls();

    const since = fromDate ? new Date(fromDate).getTime() : undefined;
    const until = toDate ? new Date(toDate).getTime() + 86_400_000 - 1 : undefined;
    const perfType = timeControlsToPerfType(timeControls);

    try {
      if (this.$platform() === Platform.Lichess) {
        const onGame = (game: Game) => {
          this.$gameCount.update((c) => c + 1);
          const playerColor = this.resolvePlayerColor(game);
          this.graph.addGame(game, playerColor);
          this.$gamesAnalyzed.update((c) => c + 1);
        };
        await this.lichessService.playerGames(this.$username(), onGame, {
          opening: true,
          since,
          until,
          perfType,
          color: filterColor,
        } as LichessGameParameters);
      } else {
        const onGame = (game: Game) => {
          this.$gameCount.update((c) => c + 1);

          const playerColor = this.resolvePlayerColor(game);
          if (playerColor !== filterColor) return;

          if (fromDate && game.timestamp < new Date(fromDate).getTime()) return;
          if (toDate) {
            const toEnd = new Date(toDate);
            toEnd.setHours(23, 59, 59, 999);
            if (game.timestamp > toEnd.getTime()) return;
          }

          const tcKey = mapGameToTimeControlKey(game.timeControl);
          if (tcKey && !timeControls[tcKey]) return;

          this.graph.addGame(game, playerColor);
          this.$gamesAnalyzed.update((c) => c + 1);
        };
        await this.chessComService.playerGames(this.$username(), onGame, { since, until });
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }

    this.$loaded.set(true);
    this.$isLoading.set(false);
    this.store.dispatch(ExplorerActions.fetchBook({ fen: this.$fen() }));
  }

  private resolvePlayerColor(game: Game): string {
    const name = this.$username().toLowerCase();
    if (game.players.white.username?.toLowerCase() === name) return 'white';
    if (game.players.black.username?.toLowerCase() === name) return 'black';
    return 'white';
  }

  public onBoardMove(san: string): void {
    const chess = new Chess(this.$fen());
    const move = chess.move(san, { strict: false });
    if (!move) return;
    this.manager.addPly(chess.fen(), { from: move.from, to: move.to, san: move.san });
    this.store.dispatch(ExplorerActions.fetchBook({ fen: this.$fen() }));
  }

  public onTableMove(move: ExplorerMove): void {
    this.onBoardMove(move.san);
  }

  public onNavigateTo(index: number): void {
    this.manager.moveTo(index);
    this.store.dispatch(ExplorerActions.fetchBook({ fen: this.$fen() }));
  }

  public onGoForward(): void {
    this.manager.moveForward();
    this.store.dispatch(ExplorerActions.fetchBook({ fen: this.$fen() }));
  }

  public onGoBack(): void {
    this.manager.moveBack();
    this.store.dispatch(ExplorerActions.fetchBook({ fen: this.$fen() }));
  }

  public onReset(): void {
    this.manager.reset();
    this.store.dispatch(ExplorerActions.fetchBook({ fen: this.$fen() }));
  }

  public onHighlightMove(move: ExplorerMove | null): void {
    this.$highlightedMove.set(move);
  }

  public switchTab(tab: 'moves' | 'book'): void {
    this.$activeTab.set(tab);
  }

  public openBookSettings(): void {
    const ref = this.dialog.open(BookSettingsDialogComponent, {
      data: { ...this.bookService.config() },
      width: '32rem',
    });

    ref.afterClosed().subscribe((result: OpeningBookConfig | undefined) => {
      if (!result) return;
      this.bookService.updateConfig(result);
      this.store.dispatch(ExplorerActions.fetchBook({ fen: this.$fen() }));
    });
  }

  public onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.onGoBack();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.onGoForward();
    }
  }
}

function score(move: ExplorerMove): number {
  const d = move.details;
  if (d.count === 0) return 0;
  return ((d.whiteWins + d.draws / 2) / d.count) * 100;
}

function values(move: ExplorerMove): [number, number] {
  const d = move.details;
  if (d.count === 0) return [0, 0];
  return [(d.whiteWins / d.count) * 100, ((d.whiteWins + d.draws) / d.count) * 100];
}
