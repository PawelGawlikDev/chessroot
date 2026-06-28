import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  computed,
  model,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UserDataFormComponent } from '@components/user-data-form/user-data-form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'cr-game-fetch-panel',
  imports: [MatButtonModule, MatProgressSpinnerModule, MatIconModule, UserDataFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-fetch-panel.component.html',
  styleUrl: './game-fetch-panel.component.scss',
})
export class GameFetchPanelComponent {
  private router = inject(Router);
  public title = input.required<string>();
  public readonly username = model<string>('');
  public headerIcon = input<string>('');
  public buttonLabel = input.required<string>();
  public buttonIcon = input('analytics');
  public isLoading = input.required<boolean>();
  public isButtonDisabled = input.required<boolean>();
  public progress = input.required<number>();
  public gameCount = input.required<number>();
  public gamesAnalyzed = input.required<number>();
  public totalGames = input.required<number>();
  public extraStat = input<string>('');
  public summary = input<string>('');
  public showColorFilter = input(false);

  public fetch = output<void>();

  public $isExplorerPage = computed(() => this.router.url.includes('explorer'));
}
