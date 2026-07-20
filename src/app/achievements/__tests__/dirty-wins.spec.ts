import { flagOpponentWhoHadMateInOne, winInsufficientMaterial, clutchPawn } from '../dirty-wins';
import { Game } from '@model';
import { PgnMove } from '@mliebelt/pgn-types';

function makeGame(via: string, winner?: 'white' | 'black'): Game {
  return {
    result: {
      via: via as Game['result']['via'],
      winner,
      label: winner === 'white' ? '1-0' : winner === 'black' ? '0-1' : '1/2-1/2',
    },
    moves: [],
  } as unknown as Game;
}

function makeMoves(notation: string[]): PgnMove[] {
  return notation.map(
    (n, i) =>
      ({
        drawOffer: false,
        moveNumber: Math.floor(i / 2) + 1,
        notation: {
          notation: n,
          fig: null,
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
        turn: i % 2 === 0 ? 'w' : 'b',
      }) as unknown as PgnMove,
  );
}

describe('flagOpponentWhoHadMateInOne', () => {
  it('should return empty array when no winner', () => {
    const game = makeGame('timeout');
    const moves = makeMoves(['e4', 'e5']);
    expect(flagOpponentWhoHadMateInOne(game, moves)).toEqual([]);
  });

  it('should return empty array when not timeout', () => {
    const game = makeGame('checkmate', 'white');
    const moves = makeMoves(['e4', 'e5']);
    expect(flagOpponentWhoHadMateInOne(game, moves)).toEqual([]);
  });

  it('should return empty array when timeout but no mate in one', () => {
    const game = makeGame('timeout', 'white');
    const moves = makeMoves(['e4', 'e5', 'Nf3', 'Nc6']);
    expect(flagOpponentWhoHadMateInOne(game, moves)).toEqual([]);
  });

  it('should return trophy when timeout with mate in one available', () => {
    const game = makeGame('timeout', 'white');
    // After 1.e4 e5 2.Qh5 Nc6 3.Bc4 Nf6, it's white's turn and Qxf7# is available
    const moves = makeMoves(['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6']);
    const result = flagOpponentWhoHadMateInOne(game, moves);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy for black when black has mate in one', () => {
    const game = makeGame('timeout', 'black');
    // After 1.f3 e5 2.g4, it's black's turn and Qh4# is available
    const moves = makeMoves(['f3', 'e5', 'g4']);
    const result = flagOpponentWhoHadMateInOne(game, moves);
    expect(result).toEqual([{ color: 'b' }]);
  });
});

describe('winInsufficientMaterial', () => {
  it('should return empty array when not timeout', () => {
    const game = makeGame('checkmate', 'white');
    expect(winInsufficientMaterial(game, '4k3/8/8/8/8/8/8/4K2B w - - 0 1')).toEqual([]);
  });

  it('should return empty array when winner has more than one piece', () => {
    const game = makeGame('timeout', 'white');
    // White has bishop and pawn (2 pieces besides king)
    const fen = '4k3/8/8/8/8/8/4P3/4K2B w - - 0 1';
    expect(winInsufficientMaterial(game, fen)).toEqual([]);
  });

  it('should return trophy when white wins with only a white bishop remaining', () => {
    const game = makeGame('timeout', 'white');
    // White has only a bishop besides king
    const fen = '4k3/8/8/8/8/8/8/4K2B w - - 0 1';
    const result = winInsufficientMaterial(game, fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy when white wins with only a white knight remaining', () => {
    const game = makeGame('timeout', 'white');
    // White has only a knight besides king
    const fen = '4k3/8/8/8/8/8/8/4K1N2 w - - 0 1';
    const result = winInsufficientMaterial(game, fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy when black wins with only a black bishop remaining', () => {
    const game = makeGame('timeout', 'black');
    // Black has only a bishop besides king
    const fen = '4K3/8/8/4b4/8/8/8/4k4 w - - 0 1';
    const result = winInsufficientMaterial(game, fen);
    expect(result).toEqual([{ color: 'b' }]);
  });

  it('should return trophy when black wins with only a black knight remaining', () => {
    const game = makeGame('timeout', 'black');
    // Black has only a knight besides king
    const fen = '4K3/8/8/4n4/8/8/8/4k4 w - - 0 1';
    const result = winInsufficientMaterial(game, fen);
    expect(result).toEqual([{ color: 'b' }]);
  });
});

describe('clutchPawn', () => {
  it('should return empty array when not timeout', () => {
    const game = makeGame('checkmate', 'white');
    expect(clutchPawn(game, '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1')).toEqual([]);
  });

  it('should return empty array when winner does not have exactly one pawn', () => {
    const game = makeGame('timeout', 'white');
    // White has no pawns
    const fen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
    expect(clutchPawn(game, fen)).toEqual([]);
  });

  it('should return empty array when winner has more than one pawn', () => {
    const game = makeGame('timeout', 'white');
    // White has 2 pawns
    const fen = '4k3/8/8/8/8/4P3/4P3/4K3 w - - 0 1';
    expect(clutchPawn(game, fen)).toEqual([]);
  });

  it('should return empty array when material imbalance is less than 10', () => {
    const game = makeGame('timeout', 'white');
    // White has 1 pawn, black has 1 pawn - imbalance is 0
    const fen = '4k3/4p3/8/8/8/4P3/8/4K3 w - - 0 1';
    expect(clutchPawn(game, fen)).toEqual([]);
  });

  it('should return trophy when white has one pawn and large material imbalance', () => {
    const game = makeGame('timeout', 'white');
    // White has 1 pawn, black has queen - imbalance is 8 (|1-9| = 8) - wait that's 8, not 10
    // White has 1 pawn, black has queen and rook - imbalance is 13 (|1-14| = 13)
    const fen = '4k3/4q3/4r3/8/8/4P3/8/4K3 w - - 0 1';
    const result = clutchPawn(game, fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy when black has one pawn and large material imbalance', () => {
    const game = makeGame('timeout', 'black');
    // Black has 1 pawn, white has queen and rook
    const fen = '4k3/4p3/8/8/8/4Q3/4R3/4K3 w - - 0 1';
    const result = clutchPawn(game, fen);
    expect(result).toEqual([{ color: 'b' }]);
  });

  it('should return empty array when winner has no pieces', () => {
    const game = makeGame('timeout', 'white');
    // No white pieces except king
    const fen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
    expect(clutchPawn(game, fen)).toEqual([]);
  });
});
