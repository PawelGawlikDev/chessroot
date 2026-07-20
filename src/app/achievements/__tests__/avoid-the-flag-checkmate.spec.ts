import { checkmateWithTenthSecondLeft, avoidTheFlagCheckmate } from '../avoid-the-flag-checkmate';
import { Game } from '@model';

function makeGame(
  opts: Partial<{
    increment: number;
    via: string;
    winner: 'white' | 'black';
    clocks: number[];
  }> = {},
): Game {
  return {
    site: 'lichess',
    type: 'game',
    id: 'test',
    links: { white: '', black: '' },
    timestamp: 0,
    isStandard: true,
    result: {
      label: '*',
      via: opts.via,
      winner: opts.winner,
    },
    players: {
      white: { username: 'white', title: undefined },
      black: { username: 'black', title: undefined },
    },
    timeControl: { initial: 300, increment: opts.increment ?? 0 },
    opening: { eco: 'B00', name: "King's Pawn" },
    moves: [],
    clocks: opts.clocks ?? [],
  } as unknown as Game;
}

describe('checkmateWithTenthSecondLeft', () => {
  it('should return empty when game has increment', () => {
    const game = makeGame({ increment: 1, via: 'checkmate' });
    expect(checkmateWithTenthSecondLeft(game)).toEqual([]);
  });

  it('should return empty when game did not end in checkmate', () => {
    const game = makeGame({ via: 'timeout' });
    expect(checkmateWithTenthSecondLeft(game)).toEqual([]);
  });

  it('should return empty when last clock time is above 10', () => {
    const game = makeGame({ via: 'checkmate', winner: 'white', clocks: [300, 290, 100] });
    expect(checkmateWithTenthSecondLeft(game)).toEqual([]);
  });

  it('should return trophy when last clock time is <= 10', () => {
    const clocks = Array.from({ length: 20 }, (_, i) => 300 - i * 15);
    clocks.push(8);
    const game = makeGame({ via: 'checkmate', winner: 'white', clocks });
    const result = checkmateWithTenthSecondLeft(game);
    expect(result).toEqual([{ color: 'w', onMoveNumber: clocks.length }]);
  });
});

describe('avoidTheFlagCheckmate', () => {
  it('should return empty when game has increment', () => {
    const game = makeGame({ increment: 1, via: 'checkmate' });
    expect(avoidTheFlagCheckmate(game)).toEqual([]);
  });

  it('should return empty when game did not end in checkmate', () => {
    const game = makeGame({ via: 'timeout' });
    expect(avoidTheFlagCheckmate(game)).toEqual([]);
  });

  it('should return empty when 20-moves-ago clock is above 110', () => {
    const clocks = Array.from({ length: 60 }, () => 300);
    const game = makeGame({ via: 'checkmate', winner: 'white', clocks });
    expect(avoidTheFlagCheckmate(game)).toEqual([]);
  });

  it('should return trophy when 20-moves-ago clock is <= 110', () => {
    const clocks = Array.from({ length: 60 }, (_, i) => 300 - i * 5);
    clocks[clocks.length - 39] = 100;
    const game = makeGame({ via: 'checkmate', winner: 'white', clocks });
    const result = avoidTheFlagCheckmate(game);
    expect(result).toEqual([{ color: 'w', onMoveNumber: clocks.length - 41 }]);
  });

  it('should return empty when not enough clocks for 20-moves-ago', () => {
    const clocks = [300, 290, 280];
    const game = makeGame({ via: 'checkmate', winner: 'white', clocks });
    expect(avoidTheFlagCheckmate(game)).toEqual([]);
  });
});
