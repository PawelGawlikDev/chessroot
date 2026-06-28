import { Meta, StoryObj } from '@storybook/angular';
import { InsightsSummaryComponent } from '../insights-summary.component';

const meta: Meta<InsightsSummaryComponent> = {
  title: 'Insights/InsightsSummary',
  component: InsightsSummaryComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<InsightsSummaryComponent>;

export const Balanced: Story = {
  args: {
    totalGames: 200,
    winRate: 55,
    wins: 110,
    losses: 75,
    draws: 15,
  },
};

export const Dominant: Story = {
  args: {
    totalGames: 500,
    winRate: 78,
    wins: 390,
    losses: 85,
    draws: 25,
  },
};

export const Struggling: Story = {
  args: {
    totalGames: 100,
    winRate: 32,
    wins: 32,
    losses: 60,
    draws: 8,
  },
};

export const ZeroGames: Story = {
  args: {
    totalGames: 0,
    winRate: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  },
};
