import { inject, Injectable, signal } from '@angular/core';
import { ChessFetchService } from '@services';
import type {
  BookApiResponse,
  BookMovesData,
  MoveStats,
  OpeningBookConfig,
} from '@model/opening-explorer.model';
import { DEFAULT_BOOK_CONFIG } from '@model/opening-explorer.model';

@Injectable({ providedIn: 'root' })
export class OpeningBookService {
  private fetchService = inject(ChessFetchService);
  private cache = new Map<string, BookMovesData>();
  private lastOpeningName: string | undefined = undefined;

  public readonly config = signal<OpeningBookConfig>(DEFAULT_BOOK_CONFIG);

  public updateConfig(config: OpeningBookConfig): void {
    this.config.set(config);
    this.clearCache();
  }

  public async fetchBookMoves(fen: string): Promise<BookMovesData> {
    const cfg = this.config();
    if (cfg.bookType === 'off') {
      return { fetch: 'off' };
    }
    const cached = this.cache.get(fen);
    if (cached) return cached;

    const pending: BookMovesData = { fetch: 'pending' };
    this.cache.set(fen, pending);

    try {
      const encoded = encodeURIComponent(fen);
      const ratings = cfg.ratings.join(',');
      const speeds = cfg.speeds.join(',');
      const url = `https://explorer.lichess.ovh/${cfg.bookType}?fen=${encoded}&variant=standard&ratings=${ratings}&speeds=${speeds}`;

      const response = await this.fetchService.fetchFromEndpoint(url, {
        headers: { 'User-Agent': 'chess-app/1.0' },
      });
      this.fetchService.checkForServerError(response);
      const data: BookApiResponse = await response.json();

      const openingName = data.opening
        ? `${data.opening.eco} ${data.opening.name}`
        : this.lastOpeningName;
      this.lastOpeningName = openingName;
      const transformed: BookMovesData = {
        fetch: 'success',
        openingName,
        moves: (data.moves ?? []).map((m) => {
          const count = m.white + m.black + m.draws;
          const details: MoveStats = {
            hasData: true,
            whiteWins: m.white,
            blackWins: m.black,
            draws: m.draws,
            count,
            totalOpponentElo: m.averageRating * count,
            averageElo: m.averageRating,
          };
          return {
            san: m.san,
            details,
            moveCount: count,
          };
        }),
      };
      this.cache.set(fen, transformed);
      return transformed;
    } catch {
      const failed: BookMovesData = { fetch: 'failed' };
      this.cache.set(fen, failed);
      return failed;
    }
  }

  public clearCache(): void {
    this.cache.clear();
    this.lastOpeningName = undefined;
  }
}
