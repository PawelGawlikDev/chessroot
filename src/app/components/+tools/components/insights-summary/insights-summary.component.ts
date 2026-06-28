import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { StatCardComponent } from '@components/stat-card/stat-card.component';

@Component({
  selector: 'cr-insights-summary',
  imports: [StatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './insights-summary.component.html',
  styleUrl: './insights-summary.component.scss',
})
export class InsightsSummaryComponent {
  public totalGames = input.required<number>();
  public winRate = input.required<number>();
  public wins = input.required<number>();
  public losses = input.required<number>();
  public draws = input.required<number>();
}
