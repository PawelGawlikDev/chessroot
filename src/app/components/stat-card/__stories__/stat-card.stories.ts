import { Meta, StoryObj } from '@storybook/angular';
import { StatCardComponent } from '../stat-card.component';

const meta: Meta<StatCardComponent> = {
  title: 'Shared/StatCard',
  component: StatCardComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<StatCardComponent>;

export const Wins: Story = {
  args: {
    value: 128,
    label: 'Wins',
  },
};

export const WinRate: Story = {
  args: {
    value: '68.5%',
    label: 'Win Rate',
  },
};

export const TotalGames: Story = {
  args: {
    value: 187,
    label: 'Total Games',
  },
};

export const LongLabel: Story = {
  args: {
    value: 42,
    label: 'Games Played as Black',
  },
};
