import { Component, inject, signal, effect, afterNextRender } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LocalStorageService } from '@services';

const KOFI_BANNER_DISMISSED_KEY = 'chess-kofi-banner-dismissed';

@Component({
  selector: 'cr-kofi-banner',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './kofi-banner.component.html',
  styleUrl: './kofi-banner.component.scss',
})
export class KofiBannerComponent {
  private storage = inject(LocalStorageService);

  public visible = signal(false);

  private dismissed = signal(false);

  constructor() {
    afterNextRender(() => {
      const wasDismissed = this.storage.getItem<boolean>(KOFI_BANNER_DISMISSED_KEY);
      this.visible.set(!wasDismissed);
    });
    effect(() => {
      if (this.dismissed()) {
        this.visible.set(false);
      }
    });
  }

  public dismiss(): void {
    this.dismissed.set(true);
    this.storage.setItem(KOFI_BANNER_DISMISSED_KEY, true);
  }
}
