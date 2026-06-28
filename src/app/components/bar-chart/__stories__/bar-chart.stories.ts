import { Meta, StoryObj } from '@storybook/angular';
import { BarChartComponent } from '../bar-chart.component';

const meta: Meta<BarChartComponent> = {
  title: 'Shared/BarChart',
  component: BarChartComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<BarChartComponent>;

export const TopOpenings: Story = {
  args: {
    title: 'Top Openings',
    rows: [
      { label: 'Italian Game', count: 45, wins: 28, losses: 12, draws: 5, barWidth: 90 },
      { label: 'Sicilian Defense', count: 32, wins: 18, losses: 11, draws: 3, barWidth: 64 },
      { label: "Queen's Gambit", count: 28, wins: 20, losses: 6, draws: 2, barWidth: 56 },
      { label: 'French Defense', count: 21, wins: 12, losses: 7, draws: 2, barWidth: 42 },
      { label: 'Caro-Kann', count: 15, wins: 9, losses: 5, draws: 1, barWidth: 30 },
    ],
  },
};

export const TopOpponents: Story = {
  args: {
    title: 'Top Opponents',
    barColor: 'linear-gradient(90deg, #42a5f5, #64b5f6)',
    rows: [
      { label: 'MagnusCarlsen', count: 12, wins: 2, losses: 9, draws: 1, barWidth: 100 },
      { label: 'Hikaru', count: 8, wins: 3, losses: 4, draws: 1, barWidth: 67 },
      { label: 'Levy Rozman', count: 6, wins: 4, losses: 2, draws: 0, barWidth: 50 },
    ],
  },
};

export const Empty: Story = {
  args: {
    title: 'No Data',
    rows: [],
  },
};

export const SingleRow: Story = {
  args: {
    title: 'Favorite Opening',
    rows: [{ label: 'Italian Game', count: 45, wins: 28, losses: 12, draws: 5, barWidth: 100 }],
  },
};
