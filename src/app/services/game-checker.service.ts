import { Injectable } from '@angular/core';
import { Chess } from 'chess.js';
import { Game } from '@model';
import { TrophyCheckResult, AdoptionMatchTracker } from '@achievements';

import * as gameChecks from '../achievements/game-checks';
import * as moveChecks from '../achievements/move-checks';
import * as pieceStructures from '../achievements/piece-structures';
import * as dirtyWins from '../achievements/dirty-wins';
import {
  avoidTheFlagCheckmate,
  checkmateWithTenthSecondLeft,
  blockCheckWithCheckmate,
  castleFork,
  checkmateAtMoveNumber,
  consecutiveCapturesSameSquare,
  doubleCheckCheckmate,
  noCapturesBeforeMoveNumber,
  lefongTrap,
  monaLisaCheckmate,
  pawnStormOpening,
  rosenTrap,
  royalFamilyFork,
  smotheredMate,
  smotheredPorkMate,
  alphabetOpening,
  ohNoMyQueen,
} from '@achievements';

@Injectable({
  providedIn: 'root',
})
export class GameCheckerService {
  private adoptionMatch = new AdoptionMatchTracker();

  public checkGame(game: Game): Map<string, TrophyCheckResult> {
    const results = new Map<string, TrophyCheckResult>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moves = game.moves as any[];

    if (!moves || moves.length === 0) {
      return results;
    }

    results.set('castleAfterMove40', moveChecks.castleAfterMove40(moves));
    results.set('pawnCheckmate', moveChecks.pawnCheckmate(moves));
    results.set('g5mate', moveChecks.g5mate(moves));
    results.set('enPassantCheckmate', moveChecks.enPassantCheckmate(moves));
    results.set('castleKingsideWithCheckmate', moveChecks.castleKingsideWithCheckmate(moves));
    results.set('castleQueensideWithCheckmate', moveChecks.castleQueensideWithCheckmate(moves));
    results.set('checkmateWithKing', moveChecks.checkmateWithKing(moves));
    results.set('promoteToBishopCheckmate', moveChecks.promoteToBishopCheckmate(moves));
    results.set('promoteToKnightCheckmate', moveChecks.promoteToKnightCheckmate(moves));
    results.set('promotePawnBeforeMoveNumber', moveChecks.promotePawnBeforeMoveNumber(moves, 8));
    results.set('smotheredMate', smotheredMate(moves));
    results.set('smotheredPorkMate', smotheredPorkMate(moves));
    results.set('blockCheckWithCheckmate', blockCheckWithCheckmate(moves));
    results.set('royalFamilyFork', royalFamilyFork(moves));
    results.set('noCapturesBeforeMoveNumber', noCapturesBeforeMoveNumber(moves, 30));
    results.set('rosenTrap', rosenTrap(game, moves));
    results.set('castleFork', castleFork(moves));
    results.set('avoidTheFlagCheckmate', avoidTheFlagCheckmate(game));
    results.set('checkmateWithTenthSecondLeft', checkmateWithTenthSecondLeft(game));
    results.set('consecutiveCapturesSameSquare', consecutiveCapturesSameSquare(moves, 10));
    results.set('ohNoMyQueen', ohNoMyQueen(moves));
    results.set('lefongTrap', lefongTrap(moves));
    results.set('flagOpponentWhoHadMateInOne', dirtyWins.flagOpponentWhoHadMateInOne(game, moves));
    results.set('pawnStormOpening', pawnStormOpening(game, moves));

    for (const moveNumber of [2, 3, 4]) {
      results.set(`checkmateAtMoveNumber:${moveNumber}`, checkmateAtMoveNumber(moves, moveNumber));
    }

    this.adoptionMatch.processGame(game);
    results.set('adoptionMatch:10', this.adoptionMatch.checkForAdoption(game, 10));
    results.set('adoptionMatch:20', this.adoptionMatch.checkForAdoption(game, 20));

    const words = ['badegg', 'beachcafe', 'beef', 'cabbage', 'chad', 'egg', 'eggegg', 'headache'];
    for (const word of words) {
      results.set(`alphabet:${word}`, alphabetOpening(game, word, moves));
    }

    const chessJs = new Chess();

    for (const move of moves) {
      chessJs.move(move.notation.notation);
      const fen = chessJs.fen();

      results.set(
        'quadrupledPawns',
        this.mergeResults(results.get('quadrupledPawns'), pieceStructures.quadrupledPawns(fen)),
      );
      results.set(
        'pawnCube',
        this.mergeResults(results.get('pawnCube'), pieceStructures.pawnCube(fen)),
      );
      results.set(
        'pawnCubeCenter',
        this.mergeResults(results.get('pawnCubeCenter'), pieceStructures.pawnCubeCenter(fen)),
      );
      results.set('pawnX', this.mergeResults(results.get('pawnX'), pieceStructures.pawnX(fen)));
      results.set(
        'pawnDiamond',
        this.mergeResults(results.get('pawnDiamond'), pieceStructures.pawnDiamond(fen)),
      );
      results.set(
        'pawnDiamondSolid',
        this.mergeResults(results.get('pawnDiamondSolid'), pieceStructures.pawnDiamondSolid(fen)),
      );
      results.set(
        'doublePawnDiamond',
        this.mergeResults(results.get('doublePawnDiamond'), pieceStructures.doublePawnDiamond(fen)),
      );
      results.set(
        'knightCube',
        this.mergeResults(results.get('knightCube'), pieceStructures.knightCube(fen)),
      );
      results.set(
        'knightRectangle',
        this.mergeResults(results.get('knightRectangle'), pieceStructures.knightRectangle(fen)),
      );
      results.set(
        'connectEightOnRank:4',
        this.mergeResults(
          results.get('connectEightOnRank:4'),
          pieceStructures.connectEightOnRank(fen, 4),
        ),
      );
      results.set(
        'connectEightOnRank:5',
        this.mergeResults(
          results.get('connectEightOnRank:5'),
          pieceStructures.connectEightOnRank(fen, 5),
        ),
      );
      results.set(
        'connectEightOnRank:6',
        this.mergeResults(
          results.get('connectEightOnRank:6'),
          pieceStructures.connectEightOnRank(fen, 6),
        ),
      );
      results.set(
        'connectEightOnRank:7',
        this.mergeResults(
          results.get('connectEightOnRank:7'),
          pieceStructures.connectEightOnRank(fen, 7),
        ),
      );
      results.set(
        'connectDiagonally:5',
        this.mergeResults(
          results.get('connectDiagonally:5'),
          pieceStructures.connectDiagonally(fen, 5),
        ),
      );
      results.set(
        'connectDiagonally:6',
        this.mergeResults(
          results.get('connectDiagonally:6'),
          pieceStructures.connectDiagonally(fen, 6),
        ),
      );
      results.set(
        'sixPawnsInTheSameFile',
        this.mergeResults(
          results.get('sixPawnsInTheSameFile'),
          pieceStructures.sixPawnsInTheSameFile(fen),
        ),
      );
    }

    const finalFen = chessJs.fen();

    results.set(
      'stalemateTricks',
      this.mergeResults(results.get('stalemateTricks'), gameChecks.stalemateTricks(game, finalFen)),
    );
    results.set(
      'bishopAndKnightMate',
      this.mergeResults(
        results.get('bishopAndKnightMate'),
        gameChecks.bishopAndKnightMate(game, finalFen),
      ),
    );
    results.set(
      'twoBishopMate',
      this.mergeResults(results.get('twoBishopMate'), gameChecks.twoBishopMate(game, finalFen)),
    );
    results.set(
      'fourKnightMate',
      this.mergeResults(results.get('fourKnightMate'), gameChecks.fourKnightMate(game, finalFen)),
    );
    results.set(
      'fourKnightCubeMate',
      this.mergeResults(
        results.get('fourKnightCubeMate'),
        gameChecks.fourKnightCubeMate(game, finalFen),
      ),
    );
    results.set(
      'sixKnightRectangleMate',
      this.mergeResults(
        results.get('sixKnightRectangleMate'),
        gameChecks.sixKnightRectangleMate(game, finalFen),
      ),
    );
    results.set(
      'winInsufficientMaterial',
      this.mergeResults(
        results.get('winInsufficientMaterial'),
        dirtyWins.winInsufficientMaterial(game, finalFen),
      ),
    );
    results.set(
      'clutchPawn',
      this.mergeResults(results.get('clutchPawn'), dirtyWins.clutchPawn(game, finalFen)),
    );
    results.set(
      'doubleCheckCheckmate',
      this.mergeResults(results.get('doubleCheckCheckmate'), doubleCheckCheckmate(game, finalFen)),
    );
    results.set(
      'monaLisaCheckmate',
      this.mergeResults(results.get('monaLisaCheckmate'), monaLisaCheckmate(game, finalFen)),
    );

    return results;
  }

  private mergeResults(
    existing: TrophyCheckResult | undefined,
    newResult: TrophyCheckResult,
  ): TrophyCheckResult {
    if (!existing || existing.length === 0) {
      return newResult;
    }
    if (!newResult || newResult.length === 0) {
      return existing;
    }
    return [...existing, ...newResult];
  }
}
