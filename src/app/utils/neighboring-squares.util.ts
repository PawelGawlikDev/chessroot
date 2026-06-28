import { Square } from 'chess.js';

export function neighboringSquares(square: Square): Square[] {
  const neighbors = [
    [-1, -1],
    [-1, 0],
    [-1, +1],
    [0, -1],
    [0, +1],
    [+1, -1],
    [+1, 0],
    [+1, +1],
  ];

  const files = 'abcdefgh';
  const ranks = '12345678';

  const currentFile = files.indexOf(square[0]);
  const currentRank = ranks.indexOf(square[1]);

  let neighborSquares: string[] = [];

  for (const adjacent of neighbors) {
    const neighborFile = files.charAt(currentFile + adjacent[0]);
    const neighborRank = ranks.charAt(currentRank + adjacent[1]);

    if (neighborFile && neighborRank) {
      neighborSquares.push(neighborFile + neighborRank);
    }
  }

  neighborSquares = neighborSquares.sort((a, b) => a.localeCompare(b));

  return neighborSquares as Square[];
}
