import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import type { OpeningBookConfig } from '@model/opening-explorer.model';
import { RATING_OPTIONS, SPEED_OPTIONS } from '@model/opening-explorer.model';

@Component({
  selector: 'cr-book-settings-dialog',
  imports: [MatDialogModule, MatButtonModule, MatButtonToggleModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book-settings-dialog.component.html',
  styleUrl: './book-settings-dialog.component.scss',
})
export class BookSettingsDialogComponent {
  private ref = inject(MatDialogRef<BookSettingsDialogComponent>);
  private data: OpeningBookConfig = inject(MAT_DIALOG_DATA);

  public readonly ratingOptions = RATING_OPTIONS;
  public readonly speedOptions = SPEED_OPTIONS;

  public config = signal<OpeningBookConfig>({ ...this.data });

  public setBookType(bookType: OpeningBookConfig['bookType']): void {
    this.config.update((c) => ({ ...c, bookType }));
  }

  public toggleRating(rating: number): void {
    this.config.update((c) => {
      const ratings = c.ratings.includes(rating)
        ? c.ratings.filter((r) => r !== rating)
        : [...c.ratings, rating].sort((a, b) => a - b);
      return { ...c, ratings };
    });
  }

  public toggleSpeed(speed: string): void {
    this.config.update((c) => {
      const speeds = c.speeds.includes(speed)
        ? c.speeds.filter((s) => s !== speed)
        : [...c.speeds, speed];
      return { ...c, speeds };
    });
  }

  public save(): void {
    this.ref.close(this.config());
  }
}
