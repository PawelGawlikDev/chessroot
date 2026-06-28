import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export interface BarChartRow {
  label: string;
  count: number;
  wins: number;
  losses: number;
  draws: number;
  barWidth: number;
}

@Component({
  selector: 'cr-bar-chart',
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent {
  public title = input.required<string>();
  public rows = input.required<BarChartRow[]>();
  public barColor = input('linear-gradient(90deg, #4caf50, #66bb6a)');
}
