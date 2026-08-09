import { Component, signal, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { LichessAuthService, LocalStorageService } from '@services';

import pkg from '../../package.json';
import { AcknowledgementsDialogComponent } from './components/dialogs/acknowledgements-dialog/acknowledgements-dialog.component';
import { ContactDialogComponent } from './components/dialogs/contact-dialog/contact-dialog.component';
import { KofiBannerComponent } from './components/kofi-banner/kofi-banner.component';

@Component({
  selector: 'cr-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    KofiBannerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  host: {
    '(window:scroll)': 'onWindowScroll()',
    '(window:wheel)': 'onWindowWheel($event)',
    '(window:touchstart)': 'onWindowTouchStart($event)',
    '(window:touchmove)': 'onWindowTouchMove($event)',
    '(window:touchend)': 'onWindowTouchEnd()',
    '(window:keydown)': 'onWindowKeydown($event)',
  },
})
export class ChessRoot {
  public $isDarkTheme = signal(true);
  public $isHeaderHidden = signal(false);
  public auth = inject(LichessAuthService);
  public router = inject(Router);
  private iconRegistry = inject(MatIconRegistry);
  private dialog = inject(MatDialog);
  private storage = inject(LocalStorageService);
  private lastScrollY = 0;
  private lastTouchY: number | null = null;
  private lastScrollIntent: 'up' | 'down' | null = null;
  private lastScrollIntentAt = 0;
  private readonly scrollIntentTtlMs = 300;

  public version = pkg.version;

  constructor() {
    this.iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    const saved = this.storage.getItem<string>('chess-theme');
    if (saved) {
      this.$isDarkTheme.set(saved === 'dark');
    } else {
      this.$isDarkTheme.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    effect(() => {
      const isDark = this.$isDarkTheme();
      document.documentElement.classList.toggle('dark-theme', isDark);
      document.documentElement.classList.toggle('light-theme', !isDark);
      this.storage.setItem('chess-theme', isDark ? 'dark' : 'light');
    });
  }

  public toggleTheme(): void {
    this.$isDarkTheme.update((theme) => !theme);
  }

  public openAcknowledgements(): void {
    this.dialog.open(AcknowledgementsDialogComponent, { width: '28rem' });
  }

  public openContact(): void {
    this.dialog.open(ContactDialogComponent, { width: '28rem' });
  }

  public onWindowScroll(): void {
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 24) {
      this.$isHeaderHidden.set(false);
    } else if (currentScrollY > this.lastScrollY + 8) {
      this.$isHeaderHidden.set(true);
    } else if (currentScrollY < this.lastScrollY - 8 && this.hasRecentScrollIntent('up')) {
      this.$isHeaderHidden.set(false);
    }

    this.lastScrollY = currentScrollY;
  }

  public onWindowWheel(event: WheelEvent): void {
    if (Math.abs(event.deltaY) <= 1) {
      return;
    }

    this.setScrollIntent(event.deltaY > 0 ? 'down' : 'up');
  }

  public onWindowTouchStart(event: TouchEvent): void {
    this.lastTouchY = event.touches[0]?.clientY ?? null;
  }

  public onWindowTouchMove(event: TouchEvent): void {
    const currentTouchY = event.touches[0]?.clientY;
    if (currentTouchY === undefined || this.lastTouchY === null) {
      return;
    }

    const deltaY = currentTouchY - this.lastTouchY;
    if (Math.abs(deltaY) > 4) {
      this.setScrollIntent(deltaY < 0 ? 'down' : 'up');
    }

    this.lastTouchY = currentTouchY;
  }

  public onWindowTouchEnd(): void {
    this.lastTouchY = null;
  }

  public onWindowKeydown(event: KeyboardEvent): void {
    if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) {
      this.setScrollIntent('up');
      return;
    }

    if (['ArrowDown', 'PageDown', 'End'].includes(event.key)) {
      this.setScrollIntent('down');
      return;
    }

    if (event.key === ' ') {
      this.setScrollIntent(event.shiftKey ? 'up' : 'down');
    }
  }

  private setScrollIntent(direction: 'up' | 'down'): void {
    this.lastScrollIntent = direction;
    this.lastScrollIntentAt = performance.now();
  }

  private hasRecentScrollIntent(direction: 'up' | 'down'): boolean {
    return (
      this.lastScrollIntent === direction &&
      performance.now() - this.lastScrollIntentAt <= this.scrollIntentTtlMs
    );
  }
}
