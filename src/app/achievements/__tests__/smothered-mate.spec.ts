import { smotheredMate, smotheredPorkMate } from '../smothered-mate';
import { PgnMove } from '@mliebelt/pgn-types';
import { Chess } from 'chess.js';

function pgnToMoves(pgn: string): PgnMove[] {
  const chess = new Chess();
  chess.loadPgn(pgn);
  const history = chess.history({ verbose: true });
  return history.map((m, i) => ({
    drawOffer: false,
    moveNumber: Math.floor(i / 2) + 1,
    notation: {
      notation: m.san,
      fig: m.piece !== 'p' ? m.piece.toUpperCase() : null,
      strike: m.captured ? 'x' : null,
      col: m.to[0],
      row: m.to[1],
      check: m.san.endsWith('#') ? '#' : m.san.endsWith('+') ? '+' : undefined,
      promotion: m.promotion ? `=${m.promotion.toUpperCase()}` : null,
      disc: undefined,
      drop: false,
    },
    variations: [],
    nag: [],
    commentDiag: {},
    turn: m.color as 'w' | 'b',
  })) as unknown as PgnMove[];
}

function withLastMoveSquare(moves: PgnMove[], square: string): PgnMove[] {
  return moves.map((move, index) =>
    index === moves.length - 1
      ? {
          ...move,
          notation: {
            ...move.notation,
            col: square[0],
            row: square[1],
          },
        }
      : move,
  ) as PgnMove[];
}

describe('smotheredMate', () => {
  it('should return empty when last move is not knight checkmate', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6';
    expect(smotheredMate(pgnToMoves(pgn))).toEqual([]);
  });

  it('should return empty when knight delivers check but king is not smothered', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. Nc3';
    expect(smotheredMate(pgnToMoves(pgn))).toEqual([]);
  });

  it('should return empty when game is not checkmate', () => {
    const pgn = '1. e4 e5 2. Nf3';
    expect(smotheredMate(pgnToMoves(pgn))).toEqual([]);
  });

  it('should detect smothered mate when black knight checkmates a white king surrounded by white pieces', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5 5. Nxf7 Qxg2 6. Rf1 Qxe4+ 7. Be2 Nf3#';
    expect(smotheredMate(pgnToMoves(pgn))).toEqual([{ color: 'b', onMoveNumber: 14 }]);
  });

  it('should detect smothered mate when white knight checkmates a black king surrounded by black pieces', () => {
    const pgn = '1. b3 Na6 2. Nh3 h6 3. Na3 e5 4. Nb1 g5 5. Nc3 Ne7 6. Ne4 Nc5 7. Nf6#';
    expect(smotheredMate(pgnToMoves(pgn))).toEqual([{ color: 'w', onMoveNumber: 13 }]);
  });

  it('should return empty when king has an escape square despite knight check', () => {
    // Scholar's mate — queen delivers mate, not a knight
    const pgn = '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#';
    const moves = pgnToMoves(pgn);
    expect(smotheredMate(moves)).toEqual([]);
  });
});

describe('smotheredPorkMate', () => {
  const smotheredMatePgn =
    '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5 5. Nxf7 Qxg2 6. Rf1 Qxe4+ 7. Be2 Nf3#';

  it('should return empty when last move is not knight checkmate', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6';
    expect(smotheredPorkMate(pgnToMoves(pgn))).toEqual([]);
  });

  it('should return empty when game is not checkmate', () => {
    const pgn = '1. e4 e5 2. Nf3';
    expect(smotheredPorkMate(pgnToMoves(pgn))).toEqual([]);
  });

  it('should detect a smothered pork mate when the mating knight also forks a queen or rook and a pawn could recapture it', () => {
    const moves = withLastMoveSquare(pgnToMoves(smotheredMatePgn), 'e3');

    expect(smotheredPorkMate(moves)).toEqual([{ color: 'b', onMoveNumber: 14 }]);
  });

  it('should return empty when the mating knight does not fork a queen or rook', () => {
    expect(smotheredPorkMate(pgnToMoves(smotheredMatePgn))).toEqual([]);
  });

  it('should return empty when the mating knight forks a queen or rook but no pawn can recapture it', () => {
    const moves = withLastMoveSquare(pgnToMoves(smotheredMatePgn), 'b2');

    expect(smotheredPorkMate(moves)).toEqual([]);
  });
});
