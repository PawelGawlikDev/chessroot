import { rosenTrap } from '../rosen-trap';
import { Game } from '@model';
import { PgnMove } from '@mliebelt/pgn-types';
import { Chess } from 'chess.js';

function makeGame(via: string, winner?: 'white' | 'black'): Game {
  return {
    site: 'lichess',
    type: 'game',
    id: 'test',
    links: { white: '', black: '' },
    timestamp: 0,
    isStandard: true,
    result: {
      label: '*',
      via: via,
      winner,
    },
    players: {
      white: { username: 'white', title: undefined },
      black: { username: 'black', title: undefined },
    },
    timeControl: { initial: 300, increment: 0 },
    opening: { eco: 'B00', name: "King's Pawn" },
    moves: [],
    clocks: [],
  } as unknown as Game;
}

function pgnToMoves(pgn: string): PgnMove[] {
  const chess = new Chess();
  chess.loadPgn(pgn);
  const history = chess.history({ verbose: true });
  return history.map(
    (m, i) =>
      ({
        drawOffer: false,
        moveNumber: Math.floor(i / 2) + 1,
        notation: {
          notation: m.san,
          fig: m.piece !== 'p' ? m.piece.toUpperCase() : null,
          strike: m.captured ? 'x' : null,
          col: m.to[0],
          row: m.to[1],
          check: m.san.endsWith('#') ? '#' : m.san.endsWith('+') ? '+' : undefined,
          promotion: null,
          disc: undefined,
          drop: false,
        },
        variations: [],
        nag: [],
        commentDiag: {},
        turn: m.color as 'w' | 'b',
      }) as unknown as PgnMove,
  );
}

describe('rosenTrap', () => {
  it('should return empty when game did not end in stalemate', () => {
    const game = makeGame('checkmate');
    expect(rosenTrap(game, [])).toEqual([]);
  });

  it('should return empty for empty moves', () => {
    const game = makeGame('stalemate');
    expect(rosenTrap(game, [])).toEqual([]);
  });

  it('should return empty when no queen capture on stalemate squares', () => {
    const game = makeGame('stalemate');
    expect(rosenTrap(game, [pgnToMoves('1. e4')[0]])).toEqual([]);
  });

  it('should detect rosen trap when queen captures on g3 with check and king goes to corner', () => {
    // Black queen captures pawn on g3 with check (Qxg3+), white king goes to h1 (Kh1 corner)
    // instead of capturing the queen with fxg3. Game ends shortly after (stalemate).
    const pgn =
      '1. a4 f5 2. e4 h5 3. Qxh5+ Rxh5 4. Nh3 c6 5. Bc4 fxe4 6. Ng5 a5 7. Bxg8 Qc7 8. Bf7+ Kd8 9. g3 Rxg5 10. d4 exd3 11. Nc3 Na6 12. Bg8 Rg4 13. cxd3 Rg6 14. O-O Qxg3+ 15. Kh1 Qb8';
    const game = makeGame('stalemate');
    const result = rosenTrap(game, pgnToMoves(pgn));
    expect(result).toEqual([{ color: 'w', onMoveNumber: 30 }]);
  });
});
