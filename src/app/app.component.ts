import { Component, signal, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { LichessAuthService } from '@services/lichess-auth.service';
import { AcknowledgementsDialogComponent } from './components/dialogs/acknowledgements-dialog/acknowledgements-dialog.component';
import { ContactDialogComponent } from './components/dialogs/contact-dialog/contact-dialog.component';
import pkg from '../../package.json';

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
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class ChessRoot {
  public $isDarkTheme = signal(true);
  public auth = inject(LichessAuthService);
  public router = inject(Router);
  private iconRegistry = inject(MatIconRegistry);
  private dialog = inject(MatDialog);

  public version = pkg.version;

  constructor() {
    this.iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    const saved = localStorage.getItem('chess-theme');
    if (saved) {
      this.$isDarkTheme.set(saved === 'dark');
    } else {
      this.$isDarkTheme.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    effect(() => {
      const isDark = this.$isDarkTheme();
      document.documentElement.classList.toggle('dark-theme', isDark);
      document.documentElement.classList.toggle('light-theme', !isDark);
      localStorage.setItem('chess-theme', isDark ? 'dark' : 'light');
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
}
