import { monaLisaCheckmate } from '../mona-lisa-checkmate';
import { Game, Result } from '@model';

function makeGame(result: Partial<Result>): Game {
  return {
    site: 'lichess',
    type: 'game',
    id: 'test',
    links: { white: '', black: '' },
    timestamp: 0,
    isStandard: true,
    result: {
      label: '*',
      ...result,
    },
    players: {
      white: { username: 'white', title: 'CM' },
      black: { username: 'black', title: 'FM' },
    },
    timeControl: { initial: 300, increment: 0 },
    opening: { eco: 'B00', name: "King's Pawn" },
    moves: [],
    clocks: [],
  };
}

describe('monaLisaCheckmate', () => {
  it('should return empty when game did not end in checkmate', () => {
    const game = makeGame({ via: 'timeout' });
    expect(monaLisaCheckmate(game, '8/8/8/8/8/8/2k5/RNBQKBNR w - - 0 1')).toEqual([]);
  });

  it('should return trophy when white checkmates with all pieces on original squares', () => {
    const game = makeGame({ winner: 'white', via: 'checkmate' });
    const result = monaLisaCheckmate(game, '8/8/8/8/8/8/2k5/RNBQKBNR w - - 0 1');
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy when black checkmates with all pieces on original squares', () => {
    const game = makeGame({ winner: 'black', via: 'checkmate' });
    const result = monaLisaCheckmate(game, 'rnbqkbnr/2K5/8/8/8/8/8/8 w - - 0 1');
    expect(result).toEqual([{ color: 'b' }]);
  });

  it('should return empty when FEN does not match the pattern', () => {
    const game = makeGame({ winner: 'white', via: 'checkmate' });
    expect(
      monaLisaCheckmate(game, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
    ).toEqual([]);
  });
});
