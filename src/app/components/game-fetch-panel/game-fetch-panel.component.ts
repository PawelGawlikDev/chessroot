import { Component, input, output, inject, computed, model, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { UserDataFormComponent } from '@components/user-data-form/user-data-form.component';
import { Store } from '@ngrx/store';

import { TIME_CONTROL_FILTERS } from '@model';
import { LocalStorageService } from '@services';
import {
  selectFromDate,
  selectPlatform,
  selectPlayerColor,
  selectTimeControls,
  selectToDate,
} from '@state';

@Component({
  selector: 'cr-game-fetch-panel',
  imports: [MatButtonModule, MatProgressSpinnerModule, MatIconModule, UserDataFormComponent],
  templateUrl: './game-fetch-panel.component.html',
  styleUrl: './game-fetch-panel.component.scss',
})
export class GameFetchPanelComponent {
  private router = inject(Router);
  private storage = inject(LocalStorageService);
  private store = inject(Store);
  private lastSuccessVersion = -1;

  public title = input.required<string>();
  public panelKey = input.required<string>();
  public readonly username = model<string>('');
  public readonly usernameError = model(false);
  public headerIcon = input<string>('');
  public buttonLabel = input.required<string>();
  public buttonIcon = input('analytics');
  public intro = input('');
  public helperTitle = input('');
  public helperText = input('');
  public helperItems = input<readonly string[]>([]);
  public helperNote = input('');
  public successVersion = input(0);
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

  private $platform = this.store.selectSignal(selectPlatform);
  private $playerColor = this.store.selectSignal(selectPlayerColor);
  private $fromDate = this.store.selectSignal(selectFromDate);
  private $toDate = this.store.selectSignal(selectToDate);
  private $timeControls = this.store.selectSignal(selectTimeControls);

  public $isFormCollapsed = model(false);
  public $isGuideHidden = model(false);
  public $isExplorerPage = computed(() => this.router.url.includes('explorer'));
  public $visibleTimeControls = computed(() => {
    const active = this.$timeControls();
    return Object.entries(TIME_CONTROL_FILTERS)
      .filter(([key]) => active[key])
      .map(([, value]) => value.label);
  });
  public $collapsedSummary = computed(() => {
    const details: string[] = [];
    const username = this.username().trim();

    if (username) {
      details.push(username);
    }

    details.push(this.$platform() === 'lichess' ? 'Lichess' : 'Chess.com');

    if (this.showColorFilter()) {
      details.push(this.$playerColor() === 'white' ? 'White games' : 'Black games');
    }

    const fromDate = this.$fromDate();
    const toDate = this.$toDate();
    if (fromDate || toDate) {
      details.push(`${fromDate ?? 'Any time'} to ${toDate ?? 'Now'}`);
    }

    const visibleTimeControls = this.$visibleTimeControls();
    if (
      visibleTimeControls.length > 0 &&
      visibleTimeControls.length < Object.keys(TIME_CONTROL_FILTERS).length
    ) {
      details.push(visibleTimeControls.join(', '));
    }

    return details;
  });

  constructor() {
    effect(() => {
      const key = this.panelKey();
      const collapsed = this.storage.getItem<boolean>(`${key}:formCollapsed`);
      const guideHidden = this.storage.getItem<boolean>(`${key}:guideHidden`);

      this.$isFormCollapsed.set(collapsed ?? false);
      this.$isGuideHidden.set(guideHidden ?? false);
    });

    effect(() => {
      const successVersion = this.successVersion();
      if (successVersion > this.lastSuccessVersion) {
        if (this.lastSuccessVersion >= 0 && this.username().trim()) {
          this.setFormCollapsed(true);
        }
        this.lastSuccessVersion = successVersion;
      }
    });
  }

  public toggleForm(): void {
    this.setFormCollapsed(!this.$isFormCollapsed());
  }

  public showGuide(): void {
    this.$isGuideHidden.set(false);
    this.storage.setItem(`${this.panelKey()}:guideHidden`, false);
  }

  public hideGuide(): void {
    this.$isGuideHidden.set(true);
    this.storage.setItem(`${this.panelKey()}:guideHidden`, true);
  }

  private setFormCollapsed(collapsed: boolean): void {
    this.$isFormCollapsed.set(collapsed);
    this.storage.setItem(`${this.panelKey()}:formCollapsed`, collapsed);
  }
}
