import { Square } from 'chess.js';

export function knightMoves(square: Square): Square[] {
  const knightMovesArr = [
    [-2, -1],
    [-2, +1],
    [+2, -1],
    [+2, +1],
    [-1, -2],
    [-1, +2],
    [+1, -2],
    [+1, +2],
  ];

  const files = 'abcdefgh';
  const ranks = '12345678';

  const currentFile = files.indexOf(square[0]);
  const currentRank = ranks.indexOf(square[1]);

  let destinations: string[] = [];

  for (const knightMove of knightMovesArr) {
    const destinationFile = files.charAt(currentFile + knightMove[0]);
    const destinationRank = ranks.charAt(currentRank + knightMove[1]);

    if (destinationFile && destinationRank) {
      destinations.push(destinationFile + destinationRank);
    }
  }

  destinations = destinations.sort((a, b) => a.localeCompare(b));

  return destinations as Square[];
}
