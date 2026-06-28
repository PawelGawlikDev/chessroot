import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import type { ExplorerMove } from '@model/opening-explorer.model';
import { simplifyCount } from './utils';

@Component({
  selector: 'cr-moves-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './moves-table.component.html',
  styleUrl: './moves-table.component.scss',
})
export class MovesTableComponent {
  public moves = input.required<ExplorerMove[]>();
  public showAsPercentage = input(false);
  public highlightSan = input<string | null>(null);

  public showSettings = input(false);

  public playMove = output<ExplorerMove>();
  public highlight = output<ExplorerMove | null>();
  public settingsClick = output<void>();

  public simplify = simplifyCount;

  public pct(count: number, total: number): number {
    if (total === 0) return 0;
    return (count / total) * 100;
  }

  public label(count: number, total: number): string {
    const p = this.pct(count, total);
    if (p < 8) return '';
    if (this.showAsPercentage()) return p.toFixed(1) + '%';
    return simplifyCount(count);
  }
}
