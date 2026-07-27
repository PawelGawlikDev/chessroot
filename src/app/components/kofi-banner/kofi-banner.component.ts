import { Component, inject, signal, effect, OnInit } from '@angular/core';
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
export class KofiBannerComponent implements OnInit {
  private storage = inject(LocalStorageService);

  public visible = signal(false);

  private dismissed = signal(false);

  constructor() {
    effect(() => {
      if (this.dismissed()) {
        this.visible.set(false);
      }
    });
  }

  public ngOnInit(): void {
    const wasDismissed = this.storage.getItem<boolean>(KOFI_BANNER_DISMISSED_KEY);
    this.visible.set(!wasDismissed);
  }

  public dismiss(): void {
    this.dismissed.set(true);
    this.storage.setItem(KOFI_BANNER_DISMISSED_KEY, true);
  }
}
