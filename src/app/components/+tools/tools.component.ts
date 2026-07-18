import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { LichessService, ChessComService, SeoService } from '@services';
import { Game, BATCH_SIZE } from '@model';
import { Platform } from '@enums';
import { Store } from '@ngrx/store';
import { selectPlatform, selectFromDate, selectToDate, selectTimeControls } from '@state';
import { GameFetchPanelComponent } from '@components/game-fetch-panel/game-fetch-panel.component';
import { mapGameToTimeControlKey, timeControlsToPerfType } from '@utils';
import { InsightsSummaryComponent } from './components/insights-summary/insights-summary.component';
import { InsightsDonutComponent } from './components/insights-donut/insights-donut.component';
import { BarChartComponent, BarChartRow } from '@components/bar-chart/bar-chart.component';
import { Insights, OpeningStat, OpponentStat, TimeControlStat } from './models';

@Component({
  selector: 'cr-tools',
  imports: [
    GameFetchPanelComponent,
    InsightsSummaryComponent,
    InsightsDonutComponent,
    BarChartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss',
})
export class ToolsComponent implements OnInit {
  private seo = inject(SeoService);
  private lichessService = inject(LichessService);
  private chessComService = inject(ChessComService);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.seo.setSeo(
      {
        title: 'Insights',
        description:
          'Explore detailed insights from your chess games — win rates, opening statistics, opponent analysis, and time control performance.',
      },
      '/tools',
    );
  }

  public $username = signal('');
  private $platform = this.store.selectSignal(selectPlatform);
  private $fromDate = this.store.selectSignal(selectFromDate);
  private $toDate = this.store.selectSignal(selectToDate);
  private $timeControls = this.store.selectSignal(selectTimeControls);

  public $isLoading = signal(false);
  public $insights = signal<Insights | null>(null);

  public $isButtonDisabled = computed(
    () => this.$isLoading() || !this.$username() || this.$username() === '',
  );

  public $gameCount = signal(0);
  public $gamesAnalyzed = signal(0);
  public $totalGames = signal(0);

  public $progress = computed(() => {
    const total = this.$totalGames();
    const analyzed = this.$gamesAnalyzed();
    if (total === 0) {
      const received = this.$gameCount();
      return received > 0 ? Math.round((analyzed / received) * 100) : 0;
    }
    return Math.min(Math.round((analyzed / total) * 100), 100);
  });

  public $winRate = computed(() => {
    const data = this.$insights();
    if (!data || data.totalGames === 0) return 0;
    return Math.round((data.wins / data.totalGames) * 100);
  });

  public $topOpenings = computed<BarChartRow[]>(() => {
    const data = this.$insights();
    if (!data) return [];
    const max = Math.max(...data.openings.map((o) => o.count), 1);
    return data.openings
      .slice()
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((o) => ({
        label: o.name,
        count: o.count,
        wins: o.wins,
        losses: o.losses,
        draws: o.draws,
        barWidth: (o.count / max) * 100,
      }));
  });

  public $topOpponentsList = computed<BarChartRow[]>(() => {
    const data = this.$insights();
    if (!data) return [];
    const max = Math.max(...data.topOpponents.map((o) => o.games), 1);
    return data.topOpponents
      .slice()
      .sort((a, b) => b.games - a.games)
      .slice(0, 10)
      .map((o) => ({
        label: o.username,
        count: o.games,
        wins: o.wins,
        losses: o.losses,
        draws: o.draws,
        barWidth: (o.games / max) * 100,
      }));
  });

  public $timeControlStats = computed<BarChartRow[]>(() => {
    const data = this.$insights();
    if (!data) return [];
    const max = Math.max(...data.timeControls.map((t) => t.total), 1);
    return data.timeControls
      .slice()
      .sort((a, b) => b.total - a.total)
      .map((t) => ({
        label: t.name,
        count: t.total,
        wins: t.wins,
        losses: t.losses,
        draws: t.draws,
        barWidth: (t.total / max) * 100,
      }));
  });

  private insights!: Insights;
  private openingMap!: Map<string, OpeningStat>;
  private opponentMap!: Map<string, OpponentStat>;
  private tcMap!: Map<string, TimeControlStat>;
  private gameBuffer: Game[] = [];
  private isProcessing = false;

  private processGame(game: Game): void {
    const isWhite = game.players.white.username?.toLowerCase() === this.$username()?.toLowerCase();
    const opponentName = isWhite ? game.players.black.username : game.players.white.username;
    const userWon =
      (game.result.winner === 'white' && isWhite) || (game.result.winner === 'black' && !isWhite);
    const userLost =
      (game.result.winner === 'black' && isWhite) || (game.result.winner === 'white' && !isWhite);

    this.insights.totalGames++;

    if (isWhite) {
      this.insights.whiteGames++;
      if (userWon) this.insights.winsAsWhite++;
      else if (userLost) this.insights.lossesAsWhite++;
      else this.insights.drawsAsWhite++;
    } else {
      this.insights.blackGames++;
      if (userWon) this.insights.winsAsBlack++;
      else if (userLost) this.insights.lossesAsBlack++;
      else this.insights.drawsAsBlack++;
    }

    if (userWon) this.insights.wins++;
    else if (userLost) this.insights.losses++;
    else this.insights.draws++;

    const openingName = game.opening?.name || 'Unknown';
    if (!this.openingMap.has(openingName)) {
      this.openingMap.set(openingName, {
        name: openingName,
        count: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      });
    }
    const opening = this.openingMap.get(openingName)!;
    opening.count++;
    if (userWon) opening.wins++;
    else if (userLost) opening.losses++;
    else opening.draws++;

    if (opponentName) {
      if (!this.opponentMap.has(opponentName)) {
        this.opponentMap.set(opponentName, {
          username: opponentName,
          games: 0,
          wins: 0,
          losses: 0,
          draws: 0,
        });
      }
      const opp = this.opponentMap.get(opponentName)!;
      opp.games++;
      if (userWon) opp.wins++;
      else if (userLost) opp.losses++;
      else opp.draws++;
    }

    const tc = game.timeControl;
    let tcName = 'Unknown';
    if (tc.initial !== undefined && tc.increment !== undefined) {
      const totalSec = tc.initial + tc.increment * 40;
      if (totalSec < 180) tcName = 'Bullet';
      else if (totalSec < 480) tcName = 'Blitz';
      else if (totalSec < 1500) tcName = 'Rapid';
      else tcName = 'Classical';
    }

    if (!this.tcMap.has(tcName)) {
      this.tcMap.set(tcName, { name: tcName, total: 0, wins: 0, losses: 0, draws: 0 });
    }
    const tcStat = this.tcMap.get(tcName)!;
    tcStat.total++;
    if (userWon) tcStat.wins++;
    else if (userLost) tcStat.losses++;
    else tcStat.draws++;
  }

  public async fetchGames(): Promise<void> {
    this.$isLoading.set(true);
    this.$insights.set(null);
    this.$gameCount.set(0);
    this.$gamesAnalyzed.set(0);
    this.$totalGames.set(0);

    this.insights = {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winsAsWhite: 0,
      lossesAsWhite: 0,
      drawsAsWhite: 0,
      whiteGames: 0,
      winsAsBlack: 0,
      lossesAsBlack: 0,
      drawsAsBlack: 0,
      blackGames: 0,
      openings: [],
      topOpponents: [],
      timeControls: [],
    };

    this.openingMap = new Map<string, OpeningStat>();
    this.opponentMap = new Map<string, OpponentStat>();
    this.tcMap = new Map<string, TimeControlStat>();
    this.gameBuffer = [];
    this.isProcessing = false;

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

    const fromDate = this.$fromDate();
    const toDate = this.$toDate();
    const timeControls = this.$timeControls();

    const since = fromDate ? new Date(fromDate).getTime() : undefined;
    const until = toDate ? new Date(toDate).getTime() + 86_400_000 - 1 : undefined;
    const perfType = timeControlsToPerfType(timeControls);

    try {
      if (this.$platform() === Platform.Lichess) {
        const onGame = (game: Game) => {
          this.gameBuffer.push(game);
          this.$gameCount.update((c) => c + 1);
          if (!this.isProcessing) {
            this.processGameBuffer();
          }
        };
        await this.lichessService.playerGames(this.$username(), onGame, {
          opening: true,
          since,
          until,
          perfType,
        });
      } else {
        const onGame = (game: Game) => {
          if (!this.applyFilters(game, fromDate, toDate, timeControls)) return;
          this.gameBuffer.push(game);
          this.$gameCount.update((c) => c + 1);
          if (!this.isProcessing) {
            this.processGameBuffer();
          }
        };
        await this.chessComService.playerGames(this.$username(), onGame, { since, until });
      }
      await this.drainBuffer();
    } catch (error) {
      console.error('Error fetching games:', error);
    }

    this.insights.openings = Array.from(this.openingMap.values());
    this.insights.topOpponents = Array.from(this.opponentMap.values());
    this.insights.timeControls = Array.from(this.tcMap.values());

    this.$insights.set(this.insights);

    this.$isLoading.set(false);
    this.cdr.markForCheck();
  }

  private async processGameBuffer(): Promise<void> {
    this.isProcessing = true;
    while (this.gameBuffer.length > 0) {
      const batch = this.gameBuffer.splice(0, BATCH_SIZE);
      for (const game of batch) {
        this.processGame(game);
        this.$gamesAnalyzed.update((c) => c + 1);
      }
      this.cdr.markForCheck();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    this.isProcessing = false;
  }

  private drainBuffer(): Promise<void> {
    if (!this.isProcessing) return Promise.resolve();
    return new Promise((resolve) => {
      const check = () => {
        if (!this.isProcessing && this.gameBuffer.length === 0) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });
  }

  private applyFilters(
    game: Game,
    fromDate: string | null,
    toDate: string | null,
    timeControls: Record<string, boolean>,
  ): boolean {
    if (fromDate && game.timestamp < new Date(fromDate).getTime()) return false;
    if (toDate) {
      const toEnd = new Date(toDate);
      toEnd.setHours(23, 59, 59, 999);
      if (game.timestamp > toEnd.getTime()) return false;
    }

    const tcKey = mapGameToTimeControlKey(game.timeControl);
    if (tcKey && !timeControls[tcKey]) return false;

    return true;
  }
}
