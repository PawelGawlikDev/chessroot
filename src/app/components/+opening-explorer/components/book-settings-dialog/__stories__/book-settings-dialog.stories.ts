import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookSettingsDialogComponent } from '../book-settings-dialog.component';
import type { OpeningBookConfig } from '@model/opening-explorer.model';

const defaultConfig: OpeningBookConfig = {
  bookType: 'lichess',
  ratings: [2000, 2200, 2500],
  speeds: ['rapid', 'classical'],
};

const mastersConfig: OpeningBookConfig = {
  bookType: 'masters',
  ratings: [2000, 2200, 2500],
  speeds: ['rapid', 'classical'],
};

const offConfig: OpeningBookConfig = {
  bookType: 'off',
  ratings: [],
  speeds: [],
};

const meta: Meta<BookSettingsDialogComponent> = {
  title: 'OpeningExplorer/BookSettingsDialog',
  component: BookSettingsDialogComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [{ provide: MatDialogRef, useValue: { close: () => {} } }],
    }),
  ],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<BookSettingsDialogComponent>;

export const LichessBook: Story = {
  decorators: [
    applicationConfig({
      providers: [{ provide: MAT_DIALOG_DATA, useValue: defaultConfig }],
    }),
  ],
};

export const MastersBook: Story = {
  decorators: [
    applicationConfig({
      providers: [{ provide: MAT_DIALOG_DATA, useValue: mastersConfig }],
    }),
  ],
};

export const BookOff: Story = {
  decorators: [
    applicationConfig({
      providers: [{ provide: MAT_DIALOG_DATA, useValue: offConfig }],
    }),
  ],
};
