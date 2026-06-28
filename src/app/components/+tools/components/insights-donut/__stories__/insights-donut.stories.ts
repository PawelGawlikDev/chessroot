import { Meta, StoryObj } from '@storybook/angular';
import { InsightsDonutComponent } from '../insights-donut.component';

const meta: Meta<InsightsDonutComponent> = {
  title: 'Insights/InsightsDonut',
  component: InsightsDonutComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<InsightsDonutComponent>;

export const Balanced: Story = {
  args: {
    totalGames: 200,
    wins: 110,
    losses: 75,
    draws: 15,
    whiteWins: 60,
    whiteLosses: 35,
    whiteDraws: 8,
    whiteGames: 103,
    blackWins: 50,
    blackLosses: 40,
    blackDraws: 7,
    blackGames: 97,
  },
};

export const Dominant: Story = {
  args: {
    totalGames: 500,
    wins: 390,
    losses: 85,
    draws: 25,
    whiteWins: 200,
    whiteLosses: 40,
    whiteDraws: 12,
    whiteGames: 252,
    blackWins: 190,
    blackLosses: 45,
    blackDraws: 13,
    blackGames: 248,
  },
};

export const NoDraws: Story = {
  args: {
    totalGames: 150,
    wins: 90,
    losses: 60,
    draws: 0,
    whiteWins: 48,
    whiteLosses: 30,
    whiteDraws: 0,
    whiteGames: 78,
    blackWins: 42,
    blackLosses: 30,
    blackDraws: 0,
    blackGames: 72,
  },
};

export const AllLosses: Story = {
  args: {
    totalGames: 50,
    wins: 0,
    losses: 50,
    draws: 0,
    whiteWins: 0,
    whiteLosses: 25,
    whiteDraws: 0,
    whiteGames: 25,
    blackWins: 0,
    blackLosses: 25,
    blackDraws: 0,
    blackGames: 25,
  },
};
