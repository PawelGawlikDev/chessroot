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
    } else if (currentScrollY < this.lastScrollY - 8) {
      this.$isHeaderHidden.set(false);
    }

    this.lastScrollY = currentScrollY;
  }
}
