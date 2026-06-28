import { Color, Square } from 'chess.js';

export function pawnCaptures(colorToMove: Color, squareToAttack: Square): Square[] {
  let pawnsAttackFrom: number[][];

  if (colorToMove === 'w') {
    pawnsAttackFrom = [
      [-1, -1],
      [+1, -1],
    ];
  } else {
    pawnsAttackFrom = [
      [-1, +1],
      [+1, +1],
    ];
  }

  const files = 'abcdefgh';
  const ranks = '12345678';

  const currentFile = files.indexOf(squareToAttack[0]);
  const currentRank = ranks.indexOf(squareToAttack[1]);

  let destinations: string[] = [];

  for (const pawnMove of pawnsAttackFrom) {
    const destinationFile = files.charAt(currentFile + pawnMove[0]);
    const destinationRank = ranks.charAt(currentRank + pawnMove[1]);

    if (destinationFile && destinationRank) {
      destinations.push(destinationFile + destinationRank);
    }
  }

  destinations = destinations.sort((a, b) => a.localeCompare(b));

  return destinations as Square[];
}
