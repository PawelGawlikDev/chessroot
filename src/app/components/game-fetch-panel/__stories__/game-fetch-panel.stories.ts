import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideStore } from '@ngrx/store';
import { GameFetchPanelComponent } from '../game-fetch-panel.component';
import { userDataReducer } from '@state/reducers';
import { USER_DATA_FEATURE_KEY } from '@state/selectors';

const meta: Meta<GameFetchPanelComponent> = {
  title: 'Shared/GameFetchPanel',
  component: GameFetchPanelComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideNativeDateAdapter(),
        provideStore({ [USER_DATA_FEATURE_KEY]: userDataReducer }),
      ],
    }),
  ],
  argTypes: {
    fetch: { action: 'fetch' },
  },
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<GameFetchPanelComponent>;

export const Idle: Story = {
  args: {
    title: 'Analyze Your Games',
    buttonLabel: 'Fetch Games',
    buttonIcon: 'analytics',
    isLoading: false,
    isButtonDisabled: false,
    progress: 0,
    gameCount: 0,
    gamesAnalyzed: 0,
    totalGames: 0,
  },
};

export const Loading: Story = {
  args: {
    title: 'Analyze Your Games',
    buttonLabel: 'Fetch Games',
    buttonIcon: 'analytics',
    isLoading: true,
    isButtonDisabled: true,
    progress: 45,
    gameCount: 200,
    gamesAnalyzed: 90,
    totalGames: 200,
    extraStat: 'Finding achievements...',
  },
};

export const Complete: Story = {
  args: {
    title: 'Analysis Complete',
    buttonLabel: 'Re-analyze',
    buttonIcon: 'refresh',
    isLoading: false,
    isButtonDisabled: false,
    progress: 100,
    gameCount: 200,
    gamesAnalyzed: 200,
    totalGames: 200,
    summary: 'Found <strong>15 achievements</strong> across 200 games!',
  },
};

export const Disabled: Story = {
  args: {
    title: 'Analyze Your Games',
    buttonLabel: 'Fetch Games',
    isLoading: false,
    isButtonDisabled: true,
    progress: 0,
    gameCount: 0,
    gamesAnalyzed: 0,
    totalGames: 0,
  },
};

export const WithExtraStat: Story = {
  args: {
    title: 'Fetching Games',
    buttonLabel: 'Fetch',
    isLoading: true,
    isButtonDisabled: true,
    progress: 72,
    gameCount: 150,
    gamesAnalyzed: 108,
    totalGames: 150,
    extraStat: 'Processing game 108 of 150',
    summary: '',
  },
};
