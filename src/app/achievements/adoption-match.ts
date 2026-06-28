import { Game } from '@model';
import { TrophyCheckResult } from './types';

export class AdoptionMatchTracker {
  private winner = '';
  private loser = '';
  private winStreak = 1;
  private currentMatchGameIds: string[] = [];
  private allAdoptionMatchGameids: string[] = [];

  public processGame(game: Game): void {
    if (!game.result.winner) {
      this.reset();
      return;
    }

    const winner = game.result.winner as 'white' | 'black';
    const winningUsername = game.players[winner].username;
    const losingUsername = game.players[this.oppositeColor(winner)].username;

    if (!winningUsername || !losingUsername) {
      this.reset();
      return;
    }

    if (this.winner === winningUsername && this.loser === losingUsername) {
      this.winStreak++;
      this.currentMatchGameIds.push(game.id);
    } else {
      this.winner = winningUsername;
      this.loser = losingUsername;
      this.winStreak = 1;
      this.currentMatchGameIds = [game.id];
    }
  }

  public checkForAdoption(game: Game, atCount: number): TrophyCheckResult {
    if (this.winStreak === atCount) {
      this.allAdoptionMatchGameids = [...this.allAdoptionMatchGameids, ...this.currentMatchGameIds];
      return [
        {
          color: game.result.winner === 'white' ? 'w' : 'b',
        },
      ];
    }

    return [];
  }

  private reset(): void {
    this.winner = '';
    this.loser = '';
    this.winStreak = 1;
    this.currentMatchGameIds = [];
  }

  private oppositeColor(color: 'white' | 'black'): 'white' | 'black' {
    return color === 'white' ? 'black' : 'white';
  }
}
