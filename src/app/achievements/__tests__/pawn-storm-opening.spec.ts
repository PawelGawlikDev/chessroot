import { pawnStormOpening } from '../pawn-storm-opening';
import { Game } from '@model';
import { PgnMove } from '@mliebelt/pgn-types';

function makeGame(winner?: 'white' | 'black'): Game {
  return {
    result: {
      winner,
      label: winner === 'white' ? '1-0' : winner === 'black' ? '0-1' : '1/2-1/2',
    },
    moves: [],
  } as unknown as Game;
}

function makeMove(notation: string, turn: 'w' | 'b', fig?: string): PgnMove {
  return {
    drawOffer: false,
    moveNumber: 1,
    notation: {
      notation,
      fig: fig || null,
      strike: null,
      col: '',
      row: '',
      check: undefined,
      promotion: null,
      disc: undefined,
      drop: false,
    },
    variations: [],
    nag: [],
    commentDiag: {},
    turn,
  } as unknown as PgnMove;
}

describe('pawnStormOpening', () => {
  it('should return empty when no winner', () => {
    const game = makeGame();
    const moves = [makeMove('e4', 'w'), makeMove('e5', 'b')];
    expect(pawnStormOpening(game, moves)).toEqual([]);
  });

  it('should return empty when first piece move is before move 12', () => {
    const game = makeGame('white');
    // Winner is white (turn='w'), first 10 moves are pawn moves, then a piece move
    const moves = Array.from({ length: 20 }, (_, i) =>
      makeMove(i % 2 === 0 ? 'e4' : 'e5', i % 2 === 0 ? 'w' : 'b'),
    );
    moves.push(makeMove('Nf3', 'w', 'N'));
    const result = pawnStormOpening(game, moves);
    expect(result).toEqual([]);
  });

  it('should return trophy when first piece move is at or after move 12', () => {
    const game = makeGame('white');
    // 12 pawn moves per side = 24 total, then a piece move
    const moves = Array.from({ length: 24 }, (_, i) =>
      makeMove(i % 2 === 0 ? 'e4' : 'e5', i % 2 === 0 ? 'w' : 'b'),
    );
    moves.push(makeMove('Nf3', 'w', 'N'));
    const result = pawnStormOpening(game, moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 24 }]);
  });

  it('should track black winner moves separately', () => {
    const game = makeGame('black');
    // 12 white pawn moves and 12 black pawn moves, then black plays a piece
    const moves = Array.from({ length: 25 }, (_, i) => {
      if (i < 24) {
        return makeMove(i % 2 === 0 ? 'e4' : 'e5', i % 2 === 0 ? 'w' : 'b');
      }
      return makeMove('Nf6', 'b', 'N');
    });
    const result = pawnStormOpening(game, moves);
    expect(result).toEqual([{ color: 'b', onMoveNumber: 24 }]);
  });
});
