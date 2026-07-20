import { doubleCheckCheckmate } from '../double-check-checkmate';
import { Game } from '@model';

function makeGame(via: string, winner?: 'white' | 'black', movesLength: number = 10): Game {
  return {
    result: {
      via: via as Game['result']['via'],
      winner,
      label: '1-0',
    },
    moves: Array(movesLength).fill({}),
  } as unknown as Game;
}

describe('doubleCheckCheckmate', () => {
  it('should return empty array when game did not end in checkmate', () => {
    const game = makeGame('timeout', 'white');
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(doubleCheckCheckmate(game, fen)).toEqual([]);
  });

  it('should return empty array when FEN is not in check', () => {
    const game = makeGame('checkmate', 'white');
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    expect(doubleCheckCheckmate(game, fen)).toEqual([]);
  });

  it('should return empty array for single check checkmate', () => {
    const game = makeGame('checkmate', 'white', 4);
    // Back rank mate with rook - single attacker
    const fen = '4k3/8/8/8/8/8/8/R3K3 w Q - 0 1';
    expect(doubleCheckCheckmate(game, fen)).toEqual([]);
  });

  it('should detect double check checkmate', () => {
    const game = makeGame('checkmate', 'black', 6);
    // Double check with discovered attack - both bishop and queen attack the white king
    const fen = '4k3/8/8/8/1b2q3/8/8/4K3 w - - 0 1';
    const result = doubleCheckCheckmate(game, fen);
    expect(result).toEqual([{ color: 'b', onMoveNumber: 6 }]);
  });

  it('should return empty array when no king found on board', () => {
    const game = makeGame('checkmate', 'white');
    // Invalid FEN with no king
    const fen = '8/8/8/8/8/8/8/8 w - - 0 1';
    expect(doubleCheckCheckmate(game, fen)).toEqual([]);
  });

  it('should handle black winning with double check', () => {
    const game = makeGame('checkmate', 'black', 8);
    // Position where white king is double checked by queen + bishop
    const fen = '4k3/8/8/8/1b2q3/8/8/R3K3 w - - 0 1';
    const result = doubleCheckCheckmate(game, fen);
    expect(result).toEqual([{ color: 'b', onMoveNumber: 8 }]);
  });
});
