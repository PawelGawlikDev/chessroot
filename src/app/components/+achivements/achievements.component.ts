import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { LichessService } from '@services/lichess.service';
import { GameCheckerService } from '@services/game-checker.service';
import { Game, BATCH_SIZE, GameTrophy, CategoryResult, AchievementResult } from '@model';
import { ACHIEVEMENTS_METADATA, ACHIEVEMENT_CATEGORIES, AchievementMetadata } from '@achievements';
import { Platform } from '@enums';
import { SeoService } from '@services/seo.service';
import { selectPlatform, selectFromDate, selectToDate, selectTimeControls } from '@state';
import { Store } from '@ngrx/store';
import { ChessComService } from '@services/chess-com.service';
import { GameFetchPanelComponent } from '@components/game-fetch-panel/game-fetch-panel.component';
import { AchievementCategoryComponent } from './components/achievement-category/achievement-category.component';
import { mapGameToTimeControlKey, timeControlsToPerfType } from '@utils';

@Component({
  selector: 'cr-achievements',
  imports: [GameFetchPanelComponent, AchievementCategoryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.scss',
})
export class AchievementsComponent implements OnInit {
  private seo = inject(SeoService);
  private lichessService = inject(LichessService);
  private chessComService = inject(ChessComService);
  private gameChecker = inject(GameCheckerService);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store);

  public ngOnInit(): void {
    this.seo.setSeo(
      {
        title: 'Achievements',
        description:
          'Track your chess trophies and achievements across Lichess and Chess.com. Discover your proudest games, funny moments, and rare accomplishments.',
      },
      '/achievements',
    );
  }

  public $username = signal('');
  private $platform = this.store.selectSignal(selectPlatform);
  private $fromDate = this.store.selectSignal(selectFromDate);
  private $toDate = this.store.selectSignal(selectToDate);
  private $timeControls = this.store.selectSignal(selectTimeControls);

  public $isLoading = signal(false);
  public $isButtonDisabled = computed(
    () => this.$isLoading() || !this.$username() || this.$username() === '',
  );
  public $gameCount = signal(0);
  public $gamesAnalyzed = signal(0);
  public $totalGames = signal(0);
  public $positionCount = signal(0);
  private $results = signal<Map<string, GameTrophy[]>>(new Map());
  public $expandedAchievements = signal<Set<string>>(new Set());

  private readonly achievementKeys = Object.keys(ACHIEVEMENTS_METADATA);

  private gameBuffer: Game[] = [];
  private isProcessing = false;

  public $progress = computed(() => {
    const total = this.$totalGames();
    const analyzed = this.$gamesAnalyzed();
    if (total === 0) {
      const received = this.$gameCount();
      return received > 0 ? Math.round((analyzed / received) * 100) : 0;
    }
    return Math.min(Math.round((analyzed / total) * 100), 100);
  });

  private $totalTrophies = computed(() => {
    let total = 0;
    this.$results().forEach((trophies) => {
      total += trophies.length;
    });
    return total;
  });

  private $totalAchievementTypes = computed(() => {
    let count = 0;
    this.$results().forEach((trophies) => {
      if (trophies.length > 0) count++;
    });
    return count;
  });

  public $summary = computed(() => {
    const total = this.$totalTrophies();
    const types = this.$totalAchievementTypes();
    if (total === 0) return '';
    return `<h3>You have <strong>${total}</strong> ${total === 1 ? 'Trophy' : 'Trophies'} across <strong>${types}</strong> ${types === 1 ? 'category' : 'categories'}</h3>`;
  });

  public $categories = computed<CategoryResult[]>(() => {
    const categories: Record<string, AchievementResult[]> = {};
    const categoryOrder: AchievementMetadata['category'][] = [
      'proud',
      'pawn',
      'piece',
      'alphabet',
      'checkmate',
      'funny',
      'speed',
      'adoption',
      'dirty',
    ];

    categoryOrder.forEach((cat) => {
      categories[cat] = [];
    });

    this.achievementKeys.forEach((key) => {
      const metadata = ACHIEVEMENTS_METADATA[key];
      const trophies = this.$results().get(key) || [];
      categories[metadata.category].push({ key, metadata, trophies, trophyCount: trophies.length });
    });

    return categoryOrder
      .filter((cat) => categories[cat]?.length > 0)
      .map((cat) => ({
        category: cat,
        categoryTitle: ACHIEVEMENT_CATEGORIES[cat],
        goals: categories[cat].sort((a, b) => {
          if (b.trophyCount > 0 && a.trophyCount === 0) return 1;
          if (a.trophyCount > 0 && b.trophyCount === 0) return -1;
          return b.trophyCount - a.trophyCount;
        }),
      }));
  });

  public async fetchGames(): Promise<void> {
    this.$isLoading.set(true);
    this.$results.set(new Map());
    this.$gameCount.set(0);
    this.$gamesAnalyzed.set(0);
    this.$totalGames.set(0);
    this.$positionCount.set(0);
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
        await this.lichessService.playerGames(
          this.$username(),
          (game) => {
            this.onGameReceived(game);
          },
          { since, until, perfType },
        );
      } else {
        const onGame = (game: Game) => {
          if (!this.applyFilters(game, fromDate, toDate, timeControls)) return;
          this.onGameReceived(game);
        };
        await this.chessComService.playerGames(this.$username(), onGame, { since, until });
      }
      await this.drainBuffer();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      this.$isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  private onGameReceived(game: Game): void {
    this.gameBuffer.push(game);
    this.$gameCount.update((count) => count + 1);
    if (!this.isProcessing) {
      this.processGameBuffer();
    }
  }

  private async processGameBuffer(): Promise<void> {
    this.isProcessing = true;
    while (this.gameBuffer.length > 0) {
      const batch = this.gameBuffer.splice(0, BATCH_SIZE);
      for (const game of batch) {
        const positions = this.analyzeGame(game);
        this.$positionCount.update((count) => count + positions);
        this.$gamesAnalyzed.update((count) => count + 1);
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

  public toggleAchievement(key: string): void {
    const expanded = new Set(this.$expandedAchievements());
    if (expanded.has(key)) expanded.delete(key);
    else expanded.add(key);
    this.$expandedAchievements.set(expanded);
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

  private analyzeGame(game: Game): number {
    const result = this.gameChecker.checkGame(game);
    const gamePositionCount = game.moves?.length || 0;

    const newTrophies: { key: string; trophy: GameTrophy }[] = [];

    result.forEach((trophyResults, key) => {
      if (trophyResults.length > 0) {
        const isWhite =
          game.players.white.username?.toLowerCase() === this.$username()?.toLowerCase();
        const trophyColor = trophyResults[0]?.color;

        if ((isWhite && trophyColor === 'w') || (!isWhite && trophyColor === 'b')) {
          const opponent = isWhite ? game.players.black : game.players.white;
          const link = isWhite ? game.links.white : game.links.black;

          let gameLink = link;
          if (game.site === 'lichess' && trophyResults[0]?.onMoveNumber) {
            gameLink = `${link}#${trophyResults[0].onMoveNumber}`;
          }

          const trophy: GameTrophy = {
            gameId: game.id,
            opponent: opponent.username || 'Unknown',
            opponentTitle: opponent.title || '',
            link: gameLink,
            date: new Date(game.timestamp).toISOString().split('T')[0],
            color: trophyColor,
            onMoveNumber: trophyResults[0]?.onMoveNumber,
          };

          newTrophies.push({ key, trophy });
        }
      }
    });

    if (newTrophies.length > 0) {
      this.$results.update((current) => {
        const updated = new Map(current);
        newTrophies.forEach(({ key, trophy }) => {
          const existing = updated.get(key) || [];
          updated.set(key, [...existing, trophy]);
        });
        return updated;
      });
    }

    return gamePositionCount;
  }
}
