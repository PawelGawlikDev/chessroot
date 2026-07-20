import {
  quadrupledPawns,
  sixPawnsInTheSameFile,
  pawnCube,
  pawnCubeCenter,
  pawnX,
  knightCube,
  knightRectangle,
  pawnDiamond,
  pawnDiamondSolid,
  doublePawnDiamond,
  connectEightOnRank,
  connectDiagonally,
  pawnTrapezoid,
} from '../piece-structures';

describe('quadrupledPawns', () => {
  it('should return empty when no quadrupled pawns', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(quadrupledPawns(fen)).toEqual([]);
  });

  it('should return trophy for white quadrupled pawns on one file', () => {
    const fen = '8/8/8/P7/P7/P7/P7/8 w - - 0 1';
    const result = quadrupledPawns(fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy for black quadrupled pawns on one file', () => {
    const fen = '8/p7/p7/p7/p7/8/8/8 w - - 0 1';
    const result = quadrupledPawns(fen);
    expect(result).toEqual([{ color: 'b' }]);
  });

  it('should return trophies for both colors on different files', () => {
    // White quadrupled on file a, black quadrupled on file h
    const fen = 'P7/P7/P7/P7/7p/7p/7p/7p w - - 0 1';
    const result = quadrupledPawns(fen);
    expect(result).toEqual([{ color: 'w' }, { color: 'b' }]);
  });
});

describe('sixPawnsInTheSameFile', () => {
  it('should return empty when no six pawns in same file', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(sixPawnsInTheSameFile(fen)).toEqual([]);
  });

  it('should return trophy when six pawns in same file', () => {
    const fen = 'p......./p......./p......./p......./p......./p......./8/8 w - - 0 1';
    const result = sixPawnsInTheSameFile(fen);
    expect(result).toEqual([{ color: 'w' }, { color: 'b' }]);
  });
});

describe('pawnCube', () => {
  it('should return empty when no pawn cube', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(pawnCube(fen)).toEqual([]);
  });

  it('should return trophy for white pawn cube', () => {
    const fen = '8/8/8/8/PP6PP/8/8/8 w - - 0 1';
    const result = pawnCube(fen);
    expect(result).toEqual([{ color: 'w' }]);
  });

  it('should return trophy for black pawn cube', () => {
    const fen = '8/8/8/pp6pp/8/8/8/8 w - - 0 1';
    const result = pawnCube(fen);
    expect(result).toEqual([{ color: 'b' }]);
  });
});

describe('pawnCubeCenter', () => {
  it('should return empty when no pawn cube in center', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(pawnCubeCenter(fen)).toEqual([]);
  });

  it('should return trophy for white pawn cube in center', () => {
    // PP at indices 27,28 (rank5 files d,e) and 35,36 (rank4 files d,e)
    const fen = '8/8/8/3PP3/3PP3/8/8/8 w - - 0 1';
    const result = pawnCubeCenter(fen);
    expect(result).toEqual([{ color: 'w' }]);
  });
});

describe('pawnX', () => {
  it('should return empty when no pawn X', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(pawnX(fen)).toEqual([]);
  });

  it('should return trophy for white pawn X', () => {
    // X pattern across 3 consecutive ranks: P.P, .P., P.P
    const fen = '8/8/P1P5/1P6/P1P5/8/8/8 w - - 0 1';
    const result = pawnX(fen);
    expect(result).toEqual([{ color: 'w' }]);
  });
});

describe('knightCube', () => {
  it('should return empty when no knight cube', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(knightCube(fen)).toEqual([]);
  });

  it('should return trophy for white knight cube', () => {
    const fen = '8/8/8/8/NN6NN/8/8/8 w - - 0 1';
    const result = knightCube(fen);
    expect(result).toEqual([{ color: 'w' }]);
  });
});

describe('knightRectangle', () => {
  it('should return empty when no knight rectangle', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(knightRectangle(fen)).toEqual([]);
  });

  it('should return trophy for white 3x2 knight rectangle', () => {
    const fen = '8/8/8/8/NNN5NNN/8/8/8 w - - 0 1';
    const result = knightRectangle(fen);
    expect(result).toEqual([{ color: 'w' }]);
  });
});

describe('pawnDiamond', () => {
  it('should return empty when no pawn diamond', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(pawnDiamond(fen)).toEqual([]);
  });

  it('should return trophy for white pawn diamond', () => {
    // Diamond: P at rank7c, P at rank6b, P at rank6d, P at rank5c
    const fen = '8/2P5/1P1P4/2P5/8/8/8/8 w - - 0 1';
    const result = pawnDiamond(fen);
    expect(result).toEqual([{ color: 'w' }]);
  });
});

describe('pawnDiamondSolid', () => {
  it('should return empty when no solid diamond', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(pawnDiamondSolid(fen)).toEqual([]);
  });

  it('should return trophy for white solid pawn diamond', () => {
    // Solid diamond: P at rank7c, PPP at rank6b-d, P at rank5c
    const fen = '8/2P5/1PPP4/2P5/8/8/8/8 w - - 0 1';
    const result = pawnDiamondSolid(fen);
    expect(result).toEqual([{ color: 'w' }]);
  });
});

describe('doublePawnDiamond', () => {
  it('should return empty when no double diamond', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(doublePawnDiamond(fen)).toEqual([]);
  });
});

describe('connectEightOnRank', () => {
  it('should return empty when rank not full', () => {
    const fen = 'rnbqkbnr/pppppp1p/8/8/8/8/PPPPPP1P/RNBQKBNR w KQkq - 0 1';
    expect(connectEightOnRank(fen, 2)).toEqual([]);
  });

  it('should return trophy for connected pawns on rank', () => {
    const fen = '8/PPPPPPPP/8/8/8/8/8/8 w - - 0 1';
    const result = connectEightOnRank(fen, 7);
    expect(result).toEqual([{ color: 'w' }]);
  });
});

describe('connectDiagonally', () => {
  it('should return empty when no diagonal connection', () => {
    const fen = '8/8/8/8/8/8/8/8 w - - 0 1';
    expect(connectDiagonally(fen, 4)).toEqual([]);
  });

  it('should return trophy for white diagonal connection', () => {
    // 4 P's on a1-d4 diagonal (consecutive ranks 5,4,3,2)
    const fen = '8/8/8/...P4/..P5/.P6/P7/8 w - - 0 1';
    const result = connectDiagonally(fen, 4);
    expect(result).toEqual([{ color: 'w' }]);
  });
});

describe('pawnTrapezoid', () => {
  it('should return empty when no trapezoid', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(pawnTrapezoid(fen)).toEqual([]);
  });

  it('should return trophy for white pawn trapezoid', () => {
    // PP at rank7 c,d; P at rank6 b, rank6 e; P at rank5 a, rank5 f
    const fen = '8/..PP..../.P..P.../P4P2/8/8/8/8 w - - 0 1';
    const result = pawnTrapezoid(fen);
    expect(result).toEqual([{ color: 'w' }]);
  });
});
