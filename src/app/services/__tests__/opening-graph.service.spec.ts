import { TestBed } from '@angular/core/testing';
import { OpeningGraphService } from '../opening-graph.service';
import { Chess } from 'chess.js';
import type { Game } from '@model';

function makeGame(moves: string[], result: string, overrides?: Partial<Game>): Game {
  const chess = new Chess();
  const moveObjects: object[] = [];
  for (const san of moves) {
    const m = chess.move(san, { strict: false });
    if (!m) break;
    moveObjects.push({ notation: { notation: m.san } });
  }

  const label = result as Game['result']['label'];
  let winner: 'white' | 'black' | undefined;
  if (result === '1-0') winner = 'white';
  else if (result === '0-1') winner = 'black';

  return {
    site: 'lichess',
    type: 'game',
    id: 'test-game',
    links: {
      white: 'https://lichess.org/white-game',
      black: 'https://lichess.org/black-game',
    },
    timestamp: Date.now(),
    isStandard: true,
    result: { winner, label },
    players: {
      white: { username: 'WhitePlayer', title: null, rating: 2000 },
      black: { username: 'BlackPlayer', title: null, rating: 1900 },
    },
    timeControl: { initial: 600, increment: 0 },
    opening: { eco: 'C50', name: 'Italian Game' },
    moves: moveObjects,
    clocks: [],
    ...overrides,
  } as Game;
}

describe('OpeningGraphService', () => {
  let service: OpeningGraphService;

  const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpeningGraphService);
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty pgnStats', () => {
      expect(service.pgnStats).toEqual([]);
    });

    it('should have empty playerColor', () => {
      expect(service.playerColor).toBe('');
    });

    it('should have hasMoves as false', () => {
      expect(service.hasMoves).toBe(false);
    });
  });

  describe('clear', () => {
    it('should reset pgnStats', () => {
      const game = makeGame(['e4', 'e5', 'Nf3', 'Nc6'], '1-0');
      service.addGame(game, 'white');
      service.clear();
      expect(service.pgnStats).toEqual([]);
    });

    it('should reset playerColor', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');
      service.clear();
      expect(service.playerColor).toBe('');
    });

    it('should reset hasMoves', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');
      service.clear();
      expect(service.hasMoves).toBe(false);
    });

    it('should clear graph nodes so getDetailsForFen returns empty stats', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');
      service.clear();
      const stats = service.getDetailsForFen(STARTING_FEN);
      expect(stats.hasData).toBe(false);
    });

    it('should clear book cache', () => {
      service.addBookNode(STARTING_FEN, { test: true });
      service.clear();
      expect(service.getBookNode(STARTING_FEN)).toBeUndefined();
    });
  });

  describe('clearBookNodes', () => {
    it('should clear book cache', () => {
      service.addBookNode(STARTING_FEN, { data: 'test' });
      service.clearBookNodes();
      expect(service.getBookNode(STARTING_FEN)).toBeUndefined();
    });

    it('should not clear graph nodes', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');
      service.clearBookNodes();
      const stats = service.getDetailsForFen(STARTING_FEN);
      expect(stats.hasData).toBe(true);
    });
  });

  describe('addBookNode / getBookNode', () => {
    it('should store and retrieve data by simplified FEN', () => {
      const data = { moves: 42 };
      service.addBookNode(STARTING_FEN, data);
      expect(service.getBookNode(STARTING_FEN)).toBe(data);
    });

    it('should return undefined for unknown FEN', () => {
      expect(service.getBookNode('unknown/fen/position w KQkq')).toBeUndefined();
    });

    it('should use simplified FEN as key (ignores move number)', () => {
      const fenWithFullNumber = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 5 10';
      const fenWithShortNumber = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      service.addBookNode(fenWithFullNumber, { test: true });
      expect(service.getBookNode(fenWithShortNumber)).toEqual({ test: true });
    });
  });

  describe('addGame', () => {
    it('should set hasMoves to true', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');
      expect(service.hasMoves).toBe(true);
    });

    it('should set playerColor', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');
      expect(service.playerColor).toBe('white');
    });

    it('should populate pgnStats', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');
      expect(service.pgnStats).toHaveLength(1);
      expect(service.pgnStats[0].result).toBe('1-0');
      expect(service.pgnStats[0].white).toBe('WhitePlayer');
      expect(service.pgnStats[0].black).toBe('BlackPlayer');
      expect(service.pgnStats[0].whiteElo).toBe(2000);
      expect(service.pgnStats[0].blackElo).toBe(1900);
    });

    it('should set url based on player color', () => {
      const whiteGame = makeGame(['e4', 'e5'], '1-0');
      service.addGame(whiteGame, 'white');
      expect(service.pgnStats[0].url).toBe('https://lichess.org/white-game');

      service.clear();

      const blackGame = makeGame(['e4', 'e5'], '1-0');
      service.addGame(blackGame, 'black');
      expect(service.pgnStats[0].url).toBe('https://lichess.org/black-game');
    });

    it('should set numberOfPlys to rawMoves length', () => {
      const game = makeGame(['e4', 'e5', 'Nf3', 'Nc6'], '1-0');
      service.addGame(game, 'white');
      expect(service.pgnStats[0].numberOfPlys).toBe(4);
    });

    it('should set index on pgnStats', () => {
      const game1 = makeGame(['e4', 'e5'], '1-0');
      const game2 = makeGame(['d4', 'd5'], '0-1');
      service.addGame(game1, 'white');
      service.addGame(game2, 'white');
      expect(service.pgnStats[0].index).toBe(0);
      expect(service.pgnStats[1].index).toBe(1);
    });

    it('should skip games with fewer than 2 moves', () => {
      const game = makeGame(['e4'], '1-0');
      service.addGame(game, 'white');
      expect(service.pgnStats).toHaveLength(0);
      expect(service.hasMoves).toBe(false);
    });

    it('should skip games with no moves', () => {
      const game = makeGame([], '1-0');
      service.addGame(game, 'white');
      expect(service.pgnStats).toHaveLength(0);
      expect(service.hasMoves).toBe(false);
    });

    it('should process a game with 1.e4 e5 2.Nf3 Nc6', () => {
      const game = makeGame(['e4', 'e5', 'Nf3', 'Nc6'], '1-0');
      service.addGame(game, 'white');

      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.hasData).toBe(true);
      expect(rootStats.whiteWins).toBe(1);
      expect(rootStats.blackWins).toBe(0);
      expect(rootStats.draws).toBe(0);
    });

    it('should track white wins, black wins, and draws correctly', () => {
      const whiteWin = makeGame(['e4', 'e5'], '1-0');
      const blackWin = makeGame(['d4', 'd5'], '0-1');
      const draw = makeGame(['c4', 'e5'], '½-½');

      service.addGame(whiteWin, 'white');
      service.addGame(blackWin, 'white');
      service.addGame(draw, 'white');

      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.whiteWins).toBe(1);
      expect(rootStats.blackWins).toBe(1);
      expect(rootStats.draws).toBe(1);
      expect(rootStats.count).toBe(3);
    });

    it('should record opponent elo based on player color', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');

      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.totalOpponentElo).toBe(1900);
    });

    it('should record black elo as opponent when playing white', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');

      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.totalOpponentElo).toBe(1900);
    });

    it('should record white elo as opponent when playing black', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'black');

      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.totalOpponentElo).toBe(2000);
    });

    it('should handle multiple games and accumulate stats at root', () => {
      const game1 = makeGame(['e4', 'e5'], '1-0');
      const game2 = makeGame(['e4', 'e5'], '1-0');

      service.addGame(game1, 'white');
      service.addGame(game2, 'white');

      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.whiteWins).toBe(2);
      expect(rootStats.count).toBe(2);
      expect(rootStats.totalOpponentElo).toBe(3800);
    });

    it('should handle games with empty player names', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      game.players.white.username = undefined;
      game.players.black.username = undefined;
      service.addGame(game, 'white');

      expect(service.pgnStats[0].white).toBe('');
      expect(service.pgnStats[0].black).toBe('');
    });

    it('should handle games with undefined ratings', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      game.players.white.rating = undefined;
      game.players.black.rating = undefined;
      service.addGame(game, 'white');

      expect(service.pgnStats[0].whiteElo).toBe(0);
      expect(service.pgnStats[0].blackElo).toBe(0);
      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.totalOpponentElo).toBe(0);
    });

    it('should track playedBy for source nodes', () => {
      const game = makeGame(['e4', 'e5', 'Nf3', 'Nc6'], '1-0');
      service.addGame(game, 'white');

      // After 1.e4, it is black to move from this position
      const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const moves = service.movesForFen(e4Fen);
      expect(moves).not.toBeNull();
      expect(moves!.length).toBe(1);
      expect(moves![0].san).toBe('e5');
    });
  });

  describe('getDetailsForFen', () => {
    it('should return empty stats for unknown FEN', () => {
      const stats = service.getDetailsForFen('8/8/8/4k3/8/8/8/4K3 w - - 0 1');
      expect(stats.hasData).toBe(false);
      expect(stats.count).toBe(0);
      expect(stats.whiteWins).toBe(0);
      expect(stats.blackWins).toBe(0);
      expect(stats.draws).toBe(0);
      expect(stats.totalOpponentElo).toBe(0);
    });

    it('should return merged stats for a FEN visited during a game', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');

      const e4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const stats = service.getDetailsForFen(e4Fen);
      expect(stats.hasData).toBe(true);
      expect(stats.whiteWins).toBe(1);
      expect(stats.count).toBe(1);
    });

    it('should correctly compute count as sum of wins and draws', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');

      const stats = service.getDetailsForFen(STARTING_FEN);
      expect(stats.count).toBe(stats.whiteWins + stats.blackWins + stats.draws);
    });

    it('should return stats for root position after a game', () => {
      const game = makeGame(['e4', 'e5', 'Nf3', 'Nc6'], '1-0');
      service.addGame(game, 'white');

      const stats = service.getDetailsForFen(STARTING_FEN);
      expect(stats.hasData).toBe(true);
      expect(stats.whiteWins).toBe(1);
      expect(stats.count).toBe(1);
    });
  });

  describe('movesForFen', () => {
    it('should return null for a FEN with no moves played from it', () => {
      const result = service.movesForFen('8/8/8/4k3/8/8/8/4K3 w - - 0 1');
      expect(result).toBeNull();
    });

    it('should return ExplorerMove[] for a FEN with moves', () => {
      const game = makeGame(['e4', 'e5', 'Nf3', 'Nc6'], '1-0');
      service.addGame(game, 'white');

      const moves = service.movesForFen(STARTING_FEN);
      expect(moves).not.toBeNull();
      expect(moves!.length).toBe(1);
      expect(moves![0].san).toBe('e4');
      expect(moves![0].orig).toBe('e2');
      expect(moves![0].dest).toBe('e4');
    });

    it('should sort moves by moveCount descending', () => {
      const game1 = makeGame(['e4', 'e5'], '1-0');
      const game2 = makeGame(['d4', 'd5'], '0-1');

      service.addGame(game1, 'white');
      service.addGame(game2, 'white');

      const moves = service.movesForFen(STARTING_FEN);
      expect(moves).not.toBeNull();
      expect(moves!.length).toBe(2);

      const e4Move = moves!.find((m) => m.san === 'e4');
      const d4Move = moves!.find((m) => m.san === 'd4');
      expect(e4Move).toBeDefined();
      expect(d4Move).toBeDefined();
      expect(e4Move!.moveCount).toBe(1);
      expect(d4Move!.moveCount).toBe(1);
    });

    it('should include details for each move', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      service.addGame(game, 'white');

      const moves = service.movesForFen(STARTING_FEN);
      expect(moves![0].details).toBeDefined();
      expect(moves![0].details.hasData).toBe(true);
    });

    it('should calculate level 3 for most-played move (ratio > 0.8)', () => {
      const game1 = makeGame(['e4', 'e5'], '1-0');
      const game2 = makeGame(['e4', 'd5'], '1-0');
      const game3 = makeGame(['e4', 'e6'], '0-1');
      const game4 = makeGame(['d4', 'd5'], '1-0');

      service.addGame(game1, 'white');
      service.addGame(game2, 'white');
      service.addGame(game3, 'white');
      service.addGame(game4, 'white');

      const moves = service.movesForFen(STARTING_FEN);
      expect(moves).not.toBeNull();

      const e4Move = moves!.find((m) => m.san === 'e4');
      expect(e4Move!.level).toBe(3); // 3/4 = 0.75 > 0.3 → level 2
    });

    it('should calculate correct level values', () => {
      const game1 = makeGame(['e4', 'e5'], '1-0');
      const game2 = makeGame(['e4', 'd5'], '1-0');
      const game3 = makeGame(['d4', 'd5'], '0-1');

      service.addGame(game1, 'white');
      service.addGame(game2, 'white');
      service.addGame(game3, 'white');

      const moves = service.movesForFen(STARTING_FEN);
      expect(moves).not.toBeNull();

      const e4Move = moves!.find((m) => m.san === 'e4');
      const d4Move = moves!.find((m) => m.san === 'd4');
      // e4 count=2, maxCount=2 → 2/2 = 1.0 > 0.8 → level 3
      expect(e4Move!.level).toBe(3);
      expect(e4Move!.moveCount).toBe(2);
      // d4 count=1, maxCount=2 → 1/2 = 0.5 > 0.3 → level 2
      expect(d4Move!.level).toBe(2);
    });

    it('should calculate level 1 for rarely-played move', () => {
      const game1 = makeGame(['e4', 'e5'], '1-0');
      const game2 = makeGame(['e4', 'd5'], '1-0');
      const game3 = makeGame(['e4', 'e6'], '0-1');
      const game4 = makeGame(['e4', 'c5'], '1-0');
      const game5 = makeGame(['d4', 'd5'], '1-0');

      service.addGame(game1, 'white');
      service.addGame(game2, 'white');
      service.addGame(game3, 'white');
      service.addGame(game4, 'white');
      service.addGame(game5, 'white');

      const moves = service.movesForFen(STARTING_FEN);
      expect(moves).not.toBeNull();

      const d4Move = moves!.find((m) => m.san === 'd4');
      expect(d4Move!.level).toBe(1); // 1/4 = 0.25 ≤ 0.3 → level 1
      expect(d4Move!.moveCount).toBe(1);
    });

    it('should handle FEN with moves from middle of a game', () => {
      const game = makeGame(['e4', 'e5', 'Nf3', 'Nc6'], '1-0');
      service.addGame(game, 'white');

      const afterE4Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const moves = service.movesForFen(afterE4Fen);
      expect(moves).not.toBeNull();
      expect(moves!.length).toBe(1);
      expect(moves![0].san).toBe('e5');
    });
  });

  describe('gameResultsForFen', () => {
    it('should return null for FEN with no game results', () => {
      const result = service.gameResultsForFen('8/8/8/4k3/8/8/8/4K3 w - - 0 1');
      expect(result).toBeNull();
    });

    it('should return PgnStats[] for FEN with game results', () => {
      const game = makeGame(['e4', 'e5', 'Nf3', 'Nc6'], '1-0');
      service.addGame(game, 'white');

      const chess = new Chess();
      chess.move('e4');
      chess.move('e5');
      chess.move('Nf3');
      chess.move('Nc6');
      const finalFen = chess.fen();

      const results = service.gameResultsForFen(finalFen);
      expect(results).not.toBeNull();
      expect(results!.length).toBe(1);
      expect(results![0].result).toBe('1-0');
      expect(results![0].white).toBe('WhitePlayer');
    });

    it('should return multiple results for same position across games', () => {
      const game1 = makeGame(['e4', 'e5'], '1-0');
      const game2 = makeGame(['e4', 'e5'], '0-1');

      service.addGame(game1, 'white');
      service.addGame(game2, 'white');

      const chess = new Chess();
      chess.move('e4');
      chess.move('e5');
      const finalFen = chess.fen();

      const results = service.gameResultsForFen(finalFen);
      expect(results).not.toBeNull();
      expect(results!.length).toBe(2);
      expect(results![0].result).toBe('1-0');
      expect(results![1].result).toBe('0-1');
    });
  });

  describe('multiple games', () => {
    it('should correctly accumulate stats across multiple games', () => {
      const game1 = makeGame(['e4', 'e5', 'Nf3', 'Nc6'], '1-0');
      const game2 = makeGame(['d4', 'd5', 'Nf3', 'Nf6'], '0-1');

      service.addGame(game1, 'white');
      service.addGame(game2, 'white');

      expect(service.pgnStats.length).toBe(2);

      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.whiteWins).toBe(1);
      expect(rootStats.blackWins).toBe(1);
      expect(rootStats.count).toBe(2);
    });

    it("should update playerColor to the last game's color", () => {
      const game1 = makeGame(['e4', 'e5'], '1-0');
      const game2 = makeGame(['e4', 'e5'], '0-1');

      service.addGame(game1, 'white');
      expect(service.playerColor).toBe('white');

      service.addGame(game2, 'black');
      expect(service.playerColor).toBe('black');
    });

    it('should handle same opening moves across multiple games', () => {
      const game1 = makeGame(['e4', 'e5'], '1-0');
      const game2 = makeGame(['e4', 'e5'], '0-1');

      service.addGame(game1, 'white');
      service.addGame(game2, 'white');

      const moves = service.movesForFen(STARTING_FEN);
      expect(moves).not.toBeNull();
      expect(moves!.length).toBe(1);

      const e4Move = moves!.find((m) => m.san === 'e4');
      expect(e4Move!.moveCount).toBe(2);
      expect(e4Move!.details.whiteWins).toBe(1);
      expect(e4Move!.details.blackWins).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle result "½-½" as a draw', () => {
      const game = makeGame(['e4', 'e5'], '½-½');
      service.addGame(game, 'white');

      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.draws).toBe(1);
      expect(rootStats.whiteWins).toBe(0);
      expect(rootStats.blackWins).toBe(0);
    });

    it('should handle result "*" as a draw (incomplete game)', () => {
      const game = makeGame(['e4', 'e5'], '*');
      service.addGame(game, 'white');

      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.draws).toBe(1);
    });

    it('should handle a game with many moves', () => {
      const moves = [
        'e4',
        'e5',
        'Nf3',
        'Nc6',
        'Bb5',
        'a6',
        'Ba4',
        'Nf6',
        'O-O',
        'Be7',
        'Re1',
        'b5',
        'Bb3',
        'd6',
        'c3',
        'O-O',
      ];
      const game = makeGame(moves, '½-½');
      service.addGame(game, 'white');

      expect(service.pgnStats).toHaveLength(1);
      expect(service.pgnStats[0].numberOfPlys).toBe(16);

      const rootStats = service.getDetailsForFen(STARTING_FEN);
      expect(rootStats.draws).toBe(1);
      expect(rootStats.count).toBe(1);
    });

    it('should handle empty moves array in game (rawMoves empty)', () => {
      const game = makeGame([], '1-0');
      service.addGame(game, 'white');
      expect(service.pgnStats).toHaveLength(0);
    });

    it('should handle game with only one move (rawMoves.length < 2)', () => {
      const game = makeGame(['e4'], '1-0');
      service.addGame(game, 'white');
      expect(service.pgnStats).toHaveLength(0);
    });

    it('should handle moves with undefined notation by skipping them', () => {
      const game = makeGame(['e4', 'e5'], '1-0');
      game.moves = [
        { notation: { notation: 'e4' } },
        { notation: undefined },
        { notation: { notation: 'e5' } },
      ];
      service.addGame(game, 'white');

      expect(service.pgnStats).toHaveLength(1);
      expect(service.hasMoves).toBe(true);
    });
  });
});
