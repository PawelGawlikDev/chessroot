import {
  stalemateTricks,
  bishopAndKnightMate,
  singleBishopMate,
  singleKnightMate,
  twoBishopMate,
  fourKnightMate,
} from '../game-checks';
import { Game } from '@model';

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

describe('stalemateTricks', () => {
  it('should return empty when not stalemate', () => {
    const game = makeGame('checkmate', 'white');
    const fen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
    expect(stalemateTricks(game, fen)).toEqual([]);
  });

  it('should return trophy when stalemate with large material imbalance', () => {
    const game = makeGame('stalemate');
    // White has queen and rook, black king only - imbalance is 14
    const fen = 'k7/8/1Q6/8/8/8/8/4R3 w - - 0 1';
    const result = stalemateTricks(game, fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy when stalemate with medium imbalance', () => {
    const game = makeGame('stalemate');
    // White has rook, black king - imbalance is 5
    const fen = 'k7/8/8/8/8/8/R7/4K3 w - - 0 1';
    const result = stalemateTricks(game, fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return empty when only bishop draw', () => {
    const game = makeGame('stalemate');
    // Only a bishop and kings - should be draw, no trophy
    const fen = 'k7/8/8/8/8/8/8/4KB2 w - - 0 1';
    expect(stalemateTricks(game, fen)).toEqual([]);
  });

  it('should return empty when material imbalance is less than 2', () => {
    const game = makeGame('stalemate');
    // Only kings - imbalance is 0
    const fen = 'k7/8/8/8/8/8/8/4K3 w - - 0 1';
    expect(stalemateTricks(game, fen)).toEqual([]);
  });
});

describe('bishopAndKnightMate', () => {
  it('should return empty when not checkmate', () => {
    const game = makeGame('timeout', 'white');
    const fen = '4k3/8/8/8/8/8/8/4KBN1 w - - 0 1';
    expect(bishopAndKnightMate(game, fen)).toEqual([]);
  });

  it('should return trophy for white BN mate', () => {
    const game = makeGame('checkmate', 'white');
    // Black king checkmated by white bishop and knight
    const fen = 'k7/8/8/8/8/8/8/4KBN1 w - - 0 1';
    const result = bishopAndKnightMate(game, fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy for black bn mate', () => {
    const game = makeGame('checkmate', 'black');
    // White king checkmated by black bishop and knight
    const fen = 'K7/8/8/8/8/8/8/4kbn1 w - - 0 1';
    const result = bishopAndKnightMate(game, fen);
    expect(result).toEqual([{ color: 'b' }]);
  });

  it('should return empty when pieces are not BN', () => {
    const game = makeGame('checkmate', 'white');
    const fen = 'k7/8/8/8/8/8/8/4KBB1 w - - 0 1';
    expect(bishopAndKnightMate(game, fen)).toEqual([]);
  });
});

describe('singleBishopMate', () => {
  it('should return trophy for white bishop mate', () => {
    const game = makeGame('checkmate', 'white');
    const fen = 'k7/8/8/8/8/8/8/4KB2 w - - 0 1';
    const result = singleBishopMate(game, fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy for black bishop mate', () => {
    const game = makeGame('checkmate', 'black');
    const fen = 'K7/8/8/8/8/8/8/4kb2 w - - 0 1';
    const result = singleBishopMate(game, fen);
    expect(result).toEqual([{ color: 'b' }]);
  });

  it('should return empty when not checkmate', () => {
    const game = makeGame('timeout', 'white');
    const fen = 'k7/8/8/8/8/8/8/4KB2 w - - 0 1';
    expect(singleBishopMate(game, fen)).toEqual([]);
  });
});

describe('singleKnightMate', () => {
  it('should return trophy for white knight mate', () => {
    const game = makeGame('checkmate', 'white');
    const fen = 'k7/8/8/8/8/8/8/4KN2 w - - 0 1';
    const result = singleKnightMate(game, fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy for black knight mate', () => {
    const game = makeGame('checkmate', 'black');
    const fen = 'K7/8/8/8/8/8/8/4kn2 w - - 0 1';
    const result = singleKnightMate(game, fen);
    expect(result).toEqual([{ color: 'b' }]);
  });
});

describe('twoBishopMate', () => {
  it('should return trophy for white two bishop mate', () => {
    const game = makeGame('checkmate', 'white');
    const fen = 'k7/8/8/8/8/8/8/4KBB1 w - - 0 1';
    const result = twoBishopMate(game, fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy for black two bishop mate', () => {
    const game = makeGame('checkmate', 'black');
    const fen = 'K7/8/8/8/8/8/8/4kbb1 w - - 0 1';
    const result = twoBishopMate(game, fen);
    expect(result).toEqual([{ color: 'b' }]);
  });
});

describe('fourKnightMate', () => {
  it('should return trophy for white four knight mate', () => {
    const game = makeGame('checkmate', 'white');
    const fen = 'k7/8/8/8/8/8/8/3KNNNN w - - 0 1';
    const result = fourKnightMate(game, fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy for black four knight mate', () => {
    const game = makeGame('checkmate', 'black');
    const fen = 'K7/8/8/8/8/8/8/3knnnn w - - 0 1';
    const result = fourKnightMate(game, fen);
    expect(result).toEqual([{ color: 'b' }]);
  });
});
