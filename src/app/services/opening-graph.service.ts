import { Injectable } from '@angular/core';
import { Chess } from 'chess.js';
import type { Game } from '@model';
import type { MoveStats, PgnStats, ExplorerMove } from '@model/opening-explorer.model';

function simplifiedFen(fen: string): string {
  const parts = fen.split(' ');
  if (parts.length <= 4) return fen;
  return `${parts[0]} ${parts[1]} ${parts[2]}`;
}

function emptyStats(): MoveStats {
  return {
    hasData: false,
    count: 0,
    blackWins: 0,
    whiteWins: 0,
    draws: 0,
    totalOpponentElo: 0,
  };
}

interface GraphNode {
  fen: string;
  playedBy: Map<string, number>;
  playedByMax: number;
  details: number | MoveStats;
  gameResults: number[];
}

@Injectable({ providedIn: 'root' })
export class OpeningGraphService {
  private nodes = new Map<string, GraphNode>();
  private bookCache = new Map<string, unknown>();
  public pgnStats: PgnStats[] = [];
  public playerColor: string = '';
  public hasMoves = false;

  public clear(): void {
    this.nodes = new Map<string, GraphNode>();
    this.bookCache = new Map<string, unknown>();
    this.pgnStats = [];
    this.playerColor = '';
    this.hasMoves = false;
  }

  public clearBookNodes(): void {
    this.bookCache = new Map<string, unknown>();
  }

  public addGame(game: Game, playerColor: string): void {
    const chess = new Chess();
    const rawMoves = game.moves as unknown as { notation: { notation: string } }[];
    if (!rawMoves || rawMoves.length < 2) return;

    const resultStr = game.result.label;
    const whiteName = game.players.white.username ?? '';
    const blackName = game.players.black.username ?? '';
    const isWhite = playerColor === 'white';

    const pgnStats: PgnStats = {
      result: resultStr,
      white: whiteName,
      black: blackName,
      whiteElo: game.players.white.rating ?? 0,
      blackElo: game.players.black.rating ?? 0,
      url: isWhite ? game.links.white : game.links.black,
      numberOfPlys: rawMoves.length,
    };
    pgnStats.index = this.pgnStats.length;
    this.pgnStats.push(pgnStats);
    this.playerColor = playerColor;
    this.hasMoves = true;

    for (const element of rawMoves) {
      const san = element.notation?.notation;
      if (!san) continue;
      const sourceFen = chess.fen();
      const move = chess.move(san, { strict: false });
      if (!move) continue;
      const targetFen = chess.fen();
      this.addMoveForFen(sourceFen, targetFen, move.san, pgnStats);
    }
    const lastFen = chess.fen();
    this.addGameResultOnFen(lastFen, pgnStats.index!);
    this.addStatsToRoot(pgnStats);
  }

  private addGameResultOnFen(fullFen: string, resultIndex: number): void {
    const node = this.getNode(fullFen, true);
    if (!node.gameResults) node.gameResults = [];
    node.gameResults.push(resultIndex);
  }

  private addStatsToRoot(pgnStats: PgnStats): void {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const targetNode = this.getNode(fen, true);
    if (!targetNode.details || typeof targetNode.details !== 'object') {
      targetNode.details = { ...emptyStats() };
    }
    targetNode.details = this.mergeStats(targetNode.details as MoveStats, pgnStats);
  }

  private addMoveForFen(
    fullSourceFen: string,
    fullTargetFen: string,
    moveSan: string,
    resultObject: PgnStats,
  ): void {
    const targetNode = this.getNode(fullTargetFen, true);
    const existing = targetNode.details;
    targetNode.details =
      typeof existing === 'object' && existing
        ? this.mergeStats(existing as MoveStats, resultObject)
        : (resultObject.index as unknown as MoveStats);

    const sourceNode = this.getNode(fullSourceFen, true);
    if (!sourceNode.playedBy) sourceNode.playedBy = new Map();
    const current = sourceNode.playedBy.get(moveSan) ?? 0;
    sourceNode.playedBy.set(moveSan, current + 1);
    sourceNode.playedByMax = Math.max(sourceNode.playedByMax, current + 1);
  }

  private mergeStats(stats: MoveStats, resultObject: PgnStats): MoveStats {
    const resultStr = resultObject.result;
    const playerColor = this.playerColor;

    let whiteInc = 0,
      blackInc = 0,
      drawInc = 0;
    if (resultStr === '1-0') {
      whiteInc = 1;
    } else if (resultStr === '0-1') {
      blackInc = 1;
    } else {
      drawInc = 1;
    }

    const opponentElo = playerColor === 'white' ? resultObject.blackElo : resultObject.whiteElo;

    return {
      whiteWins: stats.whiteWins + whiteInc,
      blackWins: stats.blackWins + blackInc,
      draws: stats.draws + drawInc,
      count: stats.count + 1,
      totalOpponentElo: stats.totalOpponentElo + (opponentElo || 0),
      hasData: true,
    };
  }

  public getDetailsForFen(fullFen: string): MoveStats {
    const fen = simplifiedFen(fullFen);
    const node = this.nodes.get(fen);
    const details = node?.details;
    if (!details) return emptyStats();
    if (typeof details === 'number') {
      const idx = details as number;
      const pg = this.pgnStats[idx];
      if (!pg) return emptyStats();
      const merged = this.mergeStats(emptyStats(), pg);
      merged.count = merged.whiteWins + merged.blackWins + merged.draws;
      return merged;
    }
    const ms = details as MoveStats;
    ms.count = ms.whiteWins + ms.blackWins + ms.draws;
    return ms;
  }

  public movesForFen(fullFen: string): ExplorerMove[] | null {
    const fen = simplifiedFen(fullFen);
    const node = this.nodes.get(fen);
    if (!node?.playedBy || node.playedBy.size === 0) return null;

    const result: ExplorerMove[] = [];
    const maxCount = node.playedByMax;
    for (const [san, count] of node.playedBy) {
      const chess = new Chess(fullFen);
      const move = chess.move(san, { strict: false });
      if (!move) continue;

      const targetDetails = this.getDetailsForFen(chess.fen());
      result.push({
        san: move.san,
        orig: move.from,
        dest: move.to,
        level: this.levelFor(count, maxCount),
        details: targetDetails,
        moveCount: count,
      });
    }
    result.sort((a, b) => {
      if (a.moveCount === b.moveCount) return b.details.count - a.details.count;
      return b.moveCount - a.moveCount;
    });
    return result;
  }

  public gameResultsForFen(fullFen: string): PgnStats[] | null {
    const fen = simplifiedFen(fullFen);
    const node = this.nodes.get(fen);
    if (node?.gameResults) {
      return node.gameResults.map((i) => this.pgnStats[i]).filter(Boolean);
    }
    return null;
  }

  private levelFor(moveCount: number, maxCount: number): number {
    if (maxCount <= 0 || moveCount / maxCount > 0.8) return 3;
    if (moveCount / maxCount > 0.3) return 2;
    return 1;
  }

  private getNode(fullFen: string, addIfNull: boolean): GraphNode {
    const fen = simplifiedFen(fullFen);
    let node = this.nodes.get(fen);
    if (!node && addIfNull) {
      node = { fen, playedBy: new Map(), playedByMax: 0, details: emptyStats(), gameResults: [] };
      this.nodes.set(fen, node);
    }
    return node!;
  }

  public getBookNode(fullFen: string): unknown {
    return this.bookCache.get(simplifiedFen(fullFen));
  }

  public addBookNode(fullFen: string, data: unknown): void {
    this.bookCache.set(simplifiedFen(fullFen), data);
  }
}
