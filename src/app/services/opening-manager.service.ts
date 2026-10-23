import { Injectable, computed, signal } from '@angular/core';
import { Chess } from 'chess.js';

import type { NavigatorNode, NavigatorPly } from '@model/opening-explorer.model';

@Injectable({ providedIn: 'root' })
export class OpeningManagerService {
  private readonly $nodes = signal<NavigatorNode[]>([]);
  private readonly $currentId = signal(0);
  private nextId = 1;
  public readonly nodes = this.$nodes.asReadonly();
  public readonly currentId = this.$currentId.asReadonly();
  public readonly currentNode = computed(() =>
    this.nodes().find((n) => n.id === this.currentId())!,
  );
  public readonly currentIndex = computed(() => this.currentNode().ply);
  public readonly continuations = computed(() => this.children(this.currentId()));
  public readonly line = computed(() => {
    const nodes = this.nodes();
    const path: NavigatorNode[] = [];
    let node: NavigatorNode | undefined = this.currentNode();
    while (node) {
      path.unshift(node);
      node = nodes.find((n) => n.id === node!.parentId);
    }
    node = this.children(this.currentId())[0];
    while (node) {
      path.push(node);
      node = this.children(node.id)[0];
    }
    return path;
  });

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.$nodes.set([{ id: 0, parentId: null, ply: 0, fen: new Chess().fen(), move: null }]);
    this.$currentId.set(0);
  }

  public fen(): string {
    return this.currentNode().fen;
  }

  public currentMove(): number {
    return Math.floor((this.currentIndex() - 1) / 2);
  }

  public canGoForward(): boolean {
    return this.continuations().length > 0;
  }

  public canGoBack(): boolean {
    return this.currentIndex() > 0;
  }

  public moveForward(): NavigatorPly | null {
    const next = this.continuations()[0];
    return next ? this.moveToNode(next.id) : null;
  }

  public moveBack(): NavigatorPly | null {
    const parent = this.currentNode().parentId;
    return parent === null ? null : this.moveToNode(parent);
  }

  public moveTo(index: number): NavigatorPly | null {
    const node = this.line()[index];
    return node ? this.moveToNode(node.id) : null;
  }

  public moveToNode(id: number): NavigatorNode | null {
    const node = this.nodes().find((n) => n.id === id);
    if (!node) return null;
    this.$currentId.set(id);
    return node;
  }

  public addPly(fen: string, move: NonNullable<NavigatorPly['move']>): NavigatorPly {
    const existing = this.continuations().find((n) => n.move?.san === move.san);
    if (existing) return this.moveToNode(existing.id)!;
    const node: NavigatorNode = {
      id: this.nextId++,
      parentId: this.currentId(),
      ply: this.currentIndex() + 1,
      fen,
      move,
    };
    this.$nodes.update((nodes) => [...nodes, node]);
    this.$currentId.set(node.id);
    return node;
  }

  /** Remove a move and its entire subtree, returning to its parent if needed. */
  public removeNode(id: number): boolean {
    const node = this.nodes().find((n) => n.id === id);
    if (!node || node.parentId === null) return false;
    const children = new Map<number, number[]>();
    for (const entry of this.nodes()) {
      if (entry.parentId === null) continue;
      const siblings = children.get(entry.parentId) ?? [];
      siblings.push(entry.id);
      children.set(entry.parentId, siblings);
    }
    const removed = new Set<number>();
    const pending = [id];
    while (pending.length) {
      const next = pending.pop()!;
      removed.add(next);
      pending.push(...(children.get(next) ?? []));
    }
    if (removed.has(this.currentId())) this.$currentId.set(node.parentId);
    this.$nodes.update((nodes) => nodes.filter((n) => !removed.has(n.id)));
    return true;
  }

  /** Make the selected path the main line without discarding any alternatives. */
  public promoteNode(id: number): boolean {
    const nodes = [...this.nodes()];
    let node = nodes.find((n) => n.id === id);
    if (!node || node.parentId === null) return false;
    while (node && node.parentId !== null) {
      const firstSibling = nodes.findIndex((n) => n.parentId === node!.parentId);
      const index = nodes.findIndex((n) => n.id === node!.id);
      nodes.splice(index, 1);
      nodes.splice(firstSibling, 0, node);
      node = nodes.find((n) => n.id === node!.parentId);
    }
    this.$nodes.set(nodes);
    return true;
  }

  private children(id: number): NavigatorNode[] {
    return this.nodes().filter((n) => n.parentId === id);
  }
}
