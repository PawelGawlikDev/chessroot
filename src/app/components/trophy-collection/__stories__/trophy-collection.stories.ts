import { Meta, StoryObj } from '@storybook/angular';
import { TrophyCollectionComponent } from '../trophy-collection.component';

const meta: Meta<TrophyCollectionComponent> = {
  title: 'Shared/TrophyCollection',
  component: TrophyCollectionComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<TrophyCollectionComponent>;

export const Empty: Story = {
  args: {
    count: 0,
    size: 'small',
  },
};

export const SingleTrophy: Story = {
  args: {
    count: 1,
    size: 'small',
  },
};

export const ThreeTrophies: Story = {
  args: {
    count: 3,
    size: 'small',
  },
};

export const FiveTrophies: Story = {
  args: {
    count: 5,
    size: 'small',
  },
};

export const LargeTrophies: Story = {
  args: {
    count: 3,
    size: 'large',
  },
};
