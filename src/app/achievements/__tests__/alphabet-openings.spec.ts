import { alphabetOpening } from '../alphabet-openings';
import { Game } from '@model';
import { PgnMove } from '@mliebelt/pgn-types';

function makeGame(winner: 'white' | 'black' | undefined): Game {
  return {
    site: 'lichess',
    type: 'game',
    id: 'test',
    links: { white: '', black: '' },
    timestamp: 0,
    isStandard: true,
    result: {
      label: '*',
      winner,
      via: 'checkmate',
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

function makeMove(notation: string, turn: 'w' | 'b'): PgnMove {
  return {
    drawOffer: false,
    moveNumber: 1,
    notation: {
      notation,
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
    turn,
  } as unknown as PgnMove;
}

describe('alphabetOpening', () => {
  it('should return empty when no winner', () => {
    const game = makeGame(undefined);
    const moves = [makeMove('e4', 'w'), makeMove('e5', 'b')];
    expect(alphabetOpening(game, 'egg', moves)).toEqual([]);
  });

  it("should return trophy when winner's piece moves spell the word", () => {
    const game = makeGame('white');
    const moves = [
      makeMove('e4', 'w'),
      makeMove('e5', 'b'),
      makeMove('e5', 'w'),
      makeMove('d5', 'b'),
      makeMove('g3', 'w'),
    ];
    const result = alphabetOpening(game, 'eeg', moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 4 }]);
  });

  it('should return empty when moves do not spell the word', () => {
    const game = makeGame('white');
    const moves = [makeMove('e4', 'w'), makeMove('e5', 'b'), makeMove('d4', 'w')];
    expect(alphabetOpening(game, 'egg', moves)).toEqual([]);
  });

  it("should only count winner's moves", () => {
    const game = makeGame('white');
    const moves = [makeMove('e4', 'b'), makeMove('e5', 'w'), makeMove('e5', 'b')];
    const result = alphabetOpening(game, 'e', moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 2 }]);
  });

  it('should return trophy when word is empty (empty string matches everything)', () => {
    const game = makeGame('white');
    const moves = [makeMove('e4', 'w')];
    const result = alphabetOpening(game, '', moves);
    expect(result).toEqual([{ color: 'w', onMoveNumber: 0 }]);
  });
});
