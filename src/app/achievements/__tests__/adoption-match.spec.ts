import { AdoptionMatchTracker } from '../adoption-match';
import { Game } from '@model';

function makeGame(
  winner: 'white' | 'black' | undefined,
  whiteUser: string,
  blackUser: string,
  id?: string,
): Game {
  return {
    site: 'lichess',
    type: 'game',
    id: id || Math.random().toString(36).slice(2),
    links: { white: '', black: '' },
    timestamp: 0,
    isStandard: true,
    result: {
      label: '*',
      winner,
      via: 'checkmate',
    },
    players: {
      white: { username: whiteUser, title: undefined },
      black: { username: blackUser, title: undefined },
    },
    timeControl: { initial: 300, increment: 0 },
    opening: { eco: 'B00', name: "King's Pawn" },
    moves: [],
    clocks: [],
  } as unknown as Game;
}

describe('AdoptionMatchTracker', () => {
  let tracker: AdoptionMatchTracker;

  beforeEach(() => {
    tracker = new AdoptionMatchTracker();
  });

  it('should return empty when win streak has not reached threshold', () => {
    const game = makeGame('white', 'alice', 'bob', 'g1');
    tracker.processGame(game);
    expect(tracker.checkForAdoption(game, 10)).toEqual([]);
  });

  it('should return trophy when win streak reaches threshold', () => {
    const games: Game[] = [];
    for (let i = 0; i < 10; i++) {
      const game = makeGame('white', 'alice', 'bob', `g${i}`);
      games.push(game);
      tracker.processGame(game);
    }
    const result = tracker.checkForAdoption(games[9], 10);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should reset when a draw occurs', () => {
    tracker.processGame(makeGame('white', 'alice', 'bob', 'g1'));
    tracker.processGame(makeGame('white', 'alice', 'bob', 'g2'));
    tracker.processGame(makeGame(undefined, 'alice', 'bob', 'g3'));
    tracker.processGame(makeGame('white', 'alice', 'bob', 'g4'));
    expect(tracker.checkForAdoption(makeGame('white', 'alice', 'bob', 'g4'), 10)).toEqual([]);
  });

  it('should reset when different players win', () => {
    tracker.processGame(makeGame('white', 'alice', 'bob', 'g1'));
    tracker.processGame(makeGame('white', 'charlie', 'dave', 'g2'));
    expect(tracker.checkForAdoption(makeGame('white', 'charlie', 'dave', 'g2'), 10)).toEqual([]);
  });

  it('should reset when roles swap', () => {
    tracker.processGame(makeGame('white', 'alice', 'bob', 'g1'));
    tracker.processGame(makeGame('black', 'bob', 'alice', 'g2'));
    expect(tracker.checkForAdoption(makeGame('black', 'bob', 'alice', 'g2'), 10)).toEqual([]);
  });
});
