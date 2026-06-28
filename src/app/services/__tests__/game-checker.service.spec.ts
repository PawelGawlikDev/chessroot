import { TestBed } from '@angular/core/testing';
import { GameCheckerService } from '../game-checker.service';
import { Game } from '@model';

describe('GameCheckerService', () => {
  let service: GameCheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameCheckerService],
    });

    service = TestBed.inject(GameCheckerService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('checkGame', () => {
    it('should return empty map for empty moves', () => {
      const game: Game = {
        site: 'lichess',
        type: 'game',
        id: 'test-id',
        links: { white: 'test', black: 'test' },
        timestamp: Date.now(),
        isStandard: true,
        result: { winner: 'white', via: 'checkmate', label: '1-0' },
        players: {
          white: { username: 'player1', title: null },
          black: { username: 'player2', title: null },
        },
        timeControl: { initial: 180, increment: 0 },
        opening: { eco: '', name: '' },
        moves: [],
        clocks: [],
      };

      const results = service.checkGame(game);
      expect(results.size).toBe(0);
    });

    it('should return map with results for valid moves', () => {
      const game: Game = {
        site: 'lichess',
        type: 'game',
        id: 'test-id',
        links: { white: 'test', black: 'test' },
        timestamp: Date.now(),
        isStandard: true,
        result: { winner: 'white', via: 'checkmate', label: '1-0' },
        players: {
          white: { username: 'player1', title: null },
          black: { username: 'player2', title: null },
        },
        timeControl: { initial: 180, increment: 0 },
        opening: { eco: '', name: '' },
        moves: [
          { id: 1, notation: { raw: 'e4', notation: 'e4' } },
          { id: 2, notation: { raw: 'e5', notation: 'e5' } },
          { id: 3, notation: { raw: 'Nf3', notation: 'Nf3' } },
          { id: 4, notation: { raw: 'Nc6', notation: 'Nc6' } },
        ],
        clocks: [],
      };

      const results = service.checkGame(game);
      expect(results instanceof Map).toBe(true);
      expect(results.size).toBeGreaterThan(0);
    });

    it('should handle game without moves property', () => {
      const game: Partial<Game> = {
        site: 'lichess',
        type: 'game',
        id: 'test-id',
        links: { white: 'test', black: 'test' },
        timestamp: Date.now(),
        isStandard: true,
        result: { winner: 'white', via: 'checkmate', label: '1-0' },
        players: {
          white: { username: 'player1', title: null },
          black: { username: 'player2', title: null },
        },
        timeControl: { initial: 180, increment: 0 },
        opening: { eco: '', name: '' },
      };

      const results = service.checkGame(game as Game);
      expect(results instanceof Map).toBe(true);
    });
  });
});
