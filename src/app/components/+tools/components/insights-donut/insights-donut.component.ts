import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  viewChild,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'cr-insights-donut',
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './insights-donut.component.html',
  styleUrl: './insights-donut.component.scss',
})
export class InsightsDonutComponent {
  public totalGames = input.required<number>();
  public wins = input.required<number>();
  public losses = input.required<number>();
  public draws = input.required<number>();
  public whiteWins = input.required<number>();
  public whiteLosses = input.required<number>();
  public whiteDraws = input.required<number>();
  public whiteGames = input.required<number>();
  public blackWins = input.required<number>();
  public blackLosses = input.required<number>();
  public blackDraws = input.required<number>();
  public blackGames = input.required<number>();

  public $whiteWinRate = computed(() => {
    const total = this.whiteGames();
    return total === 0 ? 0 : Math.round((this.whiteWins() / total) * 100);
  });

  public $blackWinRate = computed(() => {
    const total = this.blackGames();
    return total === 0 ? 0 : Math.round((this.blackWins() / total) * 100);
  });

  public $segments = computed(() => {
    const total = this.totalGames() || 1;
    return [
      { label: 'Wins', count: this.wins(), color: '#4caf50', pct: (this.wins() / total) * 100 },
      {
        label: 'Losses',
        count: this.losses(),
        color: '#f44336',
        pct: (this.losses() / total) * 100,
      },
      { label: 'Draws', count: this.draws(), color: '#9e9e9e', pct: (this.draws() / total) * 100 },
    ].filter((s) => s.count > 0);
  });

  public donutCanvas = viewChild<ElementRef<HTMLCanvasElement>>('donutCanvas');
  private chart: Chart | null = null;

  constructor() {
    afterNextRender(() => {
      this.updateChart();
    });
  }

  private updateChart(): void {
    const canvas = this.donutCanvas()?.nativeElement;
    if (!canvas) return;

    this.chart?.destroy();

    const segments = this.$segments();
    if (segments.length === 0) return;

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: segments.map((s) => s.label),
        datasets: [
          {
            data: segments.map((s) => s.count),
            backgroundColor: segments.map((s) => s.color),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((ctx.parsed as number) / total) * 100 : 0;
                return `${ctx.label}: ${ctx.parsed} (${pct.toFixed(1)}%)`;
              },
            },
          },
        },
        cutout: '65%',
      },
    });
  }
}
