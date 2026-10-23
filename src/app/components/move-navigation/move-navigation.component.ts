import {
  Component,
  input,
  output,
  computed,
  signal,
  viewChild,
  ElementRef,
  afterRenderEffect,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import type { NavigatorNode, NavigatorPly } from '@model/opening-explorer.model';

import { buildPgnList } from './utils';

@Component({
  selector: 'cr-move-navigation',
  imports: [MatMenuModule, MatIconModule],
  templateUrl: './move-navigation.component.html',
  styleUrl: './move-navigation.component.scss',
})
export class MoveNavigationComponent {
  public plys = input.required<NavigatorPly[]>();
  public currentIndex = input.required<number>();
  public nodes = input<NavigatorNode[]>([]);
  public activeNodeId = input(0);
  public continuations = input<NavigatorNode[]>([]);
  public pickerOpen = input(false);
  public selectedContinuation = input(0);
  public navigateNode = output<number>();
  public chooseContinuation = output<number>();
  public goEnd = output<void>();
  public removeNode = output<number>();
  public promoteNode = output<number>();
  public $mainLineIds = computed(() => {
    const ids = new Set<number>([0]);
    let node = this.nodes().find((entry) => entry.parentId === 0);
    while (node) {
      ids.add(node.id);
      const id = node.id;
      node = this.nodes().find((entry) => entry.parentId === id);
    }
    return ids;
  });
  private folded = signal(new Set<number>());
  private moveList = viewChild<ElementRef<HTMLElement>>('moveList');

  public $rows = computed(() => {
    const children = new Map<number, NavigatorNode[]>();
    for (const node of this.nodes()) {
      if (node.parentId === null) continue;
      const siblings = children.get(node.parentId) ?? [];
      siblings.push(node);
      children.set(node.parentId, siblings);
    }
    const rows: { key: number; depth: number; ancestors: number[]; moves: NavigatorNode[] }[] = [];
    const visit = (first: NavigatorNode, depth: number, ancestors: number[]) => {
      let node: NavigatorNode | undefined = first;
      let row: (typeof rows)[number] | undefined;
      while (node) {
        if (!row || (depth === 0 && node.ply % 2 === 1)) {
          row = { key: node.id, depth, ancestors, moves: [] };
          rows.push(row);
        }
        row.moves.push(node);
        const next: NavigatorNode[] = children.get(node.id) ?? [];
        for (const alternative of next.slice(1))
          visit(alternative, depth + 1, [...ancestors, alternative.id]);
        if (next.length > 1 && depth > 0) row = undefined;
        node = next[0];
      }
    };
    const roots = children.get(0) ?? [];
    if (roots[0]) visit(roots[0], 0, []);
    for (const alternative of roots.slice(1)) visit(alternative, 1, [alternative.id]);
    return rows;
  });

  public $activeAncestors = computed(() => {
    const ancestors = new Set<number>();
    const nodes = this.nodes();
    let node = nodes.find((n) => n.id === this.activeNodeId());
    while (node) {
      ancestors.add(node.id);
      node = nodes.find((n) => n.id === node!.parentId);
    }
    return ancestors;
  });

  constructor() {
    afterRenderEffect(() => {
      this.activeNodeId();
      const container = this.moveList()?.nativeElement;
      const active = container?.querySelector<HTMLElement>('[aria-current="step"]');
      if (!container || !active) return;
      const bounds = container.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      if (item.bottom > bounds.bottom) container.scrollTop += item.bottom - bounds.bottom + 8;
      else if (item.top < bounds.top) container.scrollTop -= bounds.top - item.top + 8;
    });
  }

  public isFolded(id: number): boolean {
    return this.folded().has(id) && !this.$activeAncestors().has(id);
  }

  public isExpanded = (id: number): boolean => !this.isFolded(id);
  public isCollapsed = (id: number): boolean => this.isFolded(id);

  public toggleLine(id: number): void {
    this.folded.update((folded) => {
      const next = new Set(folded);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  public moveLabel(node: NavigatorNode): string {
    return `${Math.ceil(node.ply / 2)}${node.ply % 2 ? '.' : '...'} ${node.move?.san ?? ''}`;
  }

  public preview(node: NavigatorNode): string {
    const moves: string[] = [];
    let next = this.nodes().find((n) => n.parentId === node.id);
    while (next && moves.length < 3) {
      moves.push(next.move?.san ?? '');
      const id = next.id;
      next = this.nodes().find((n) => n.parentId === id);
    }
    return moves.join(' ');
  }

  public goForward = output<void>();
  public goBack = output<void>();
  public reset = output<void>();
  public navigate = output<number>();

  public $canGoForward = computed(() =>
    this.nodes().length
      ? this.continuations().length > 0
      : this.currentIndex() < this.plys().length - 1,
  );
  public $canGoBack = computed(() => this.currentIndex() > 0);
  public $pgnList = computed(() => buildPgnList(this.plys()));

  public activePlyIndex(moveIdx: number): number {
    return moveIdx;
  }
}
