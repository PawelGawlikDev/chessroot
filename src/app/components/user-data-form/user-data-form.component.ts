import { Component, effect, inject, input, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';

import { Platform } from '@enums';
import { TIME_CONTROL_FILTERS, type ChessColor } from '@model';
import { UserActions, selectTimeControls } from '@state';
import { formatDate } from '@utils';

@Component({
  selector: 'cr-user-data-form',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
  ],
  templateUrl: './user-data-form.component.html',
  styleUrl: './user-data-form.component.scss',
})
export class UserDataFormComponent {
  private store = inject(Store);

  public readonly username = model<string>('');
  public readonly usernameError = model(false);

  public readonly timeControlFilters = Object.entries(TIME_CONTROL_FILTERS).map(([key, val]) => ({
    key,
    label: val.label,
  }));
  public readonly platformOptions = [Platform.Lichess, Platform.ChessCom];
  public readonly colorOptions: ChessColor[] = ['white', 'black'];
  public readonly showColorFilter = input(false);

  public $filtersOpen = signal(false);

  public userDataForm = new FormGroup({
    username: new FormControl('', { nonNullable: true }),
    platform: new FormControl(Platform.Lichess, { nonNullable: true }),
    playerColor: new FormControl<ChessColor>('white', { nonNullable: true }),
    fromDate: new FormControl<Date | null>(null),
    toDate: new FormControl<Date | null>(null),
  });

  public $timeControls = this.store.selectSignal(selectTimeControls);

  constructor() {
    this.userDataForm.controls.username.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((username) => {
        this.username.set(username);
        this.usernameError.set(false);
        this.userDataForm.controls.username.setErrors(null);
      });

    this.userDataForm.controls.platform.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((platform) => this.store.dispatch(UserActions.updatePlatform({ platform })));

    this.userDataForm.controls.playerColor.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((playerColor) =>
        this.store.dispatch(UserActions.updatePlayerColor({ playerColor })),
      );

    this.userDataForm.controls.fromDate.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((fromDate) =>
        this.store.dispatch(
          UserActions.updateFromDate({ fromDate: fromDate ? formatDate(fromDate) : null }),
        ),
      );

    this.userDataForm.controls.toDate.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((toDate) =>
        this.store.dispatch(
          UserActions.updateToDate({ toDate: toDate ? formatDate(toDate) : null }),
        ),
      );

    effect(() => {
      const control = this.userDataForm.controls.username;
      if (this.usernameError()) {
        control.setErrors({ invalidUsername: true });
        control.markAsTouched();
      } else if (control.hasError('invalidUsername')) {
        control.setErrors(null);
      }
    });
  }

  public onTimeControlChange(key: string, checked: boolean): void {
    const current = { ...this.$timeControls() };
    current[key] = checked;
    this.store.dispatch(UserActions.updateTimeControls({ timeControls: current }));
  }
}
