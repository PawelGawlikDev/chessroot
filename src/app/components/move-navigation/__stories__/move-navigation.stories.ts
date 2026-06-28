import { Meta, StoryObj } from '@storybook/angular';
import { MoveNavigationComponent } from '../move-navigation.component';
import type { NavigatorPly } from '@model/opening-explorer.model';

const samplePlys: NavigatorPly[] = [
  { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: null },
  {
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    move: { from: 'e2', to: 'e4', san: 'e4' },
  },
  {
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    move: { from: 'e7', to: 'e5', san: 'e5' },
  },
  {
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    move: { from: 'g1', to: 'f3', san: 'Nf3' },
  },
  {
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    move: { from: 'b8', to: 'c6', san: 'Nc6' },
  },
  {
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    move: { from: 'f1', to: 'b5', san: 'Bb5' },
  },
];

const meta: Meta<MoveNavigationComponent> = {
  title: 'Shared/MoveNavigation',
  component: MoveNavigationComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<MoveNavigationComponent>;

export const Start: Story = {
  args: {
    plys: samplePlys,
    currentIndex: 0,
  },
};

export const Middle: Story = {
  args: {
    plys: samplePlys,
    currentIndex: 3,
  },
};

export const End: Story = {
  args: {
    plys: samplePlys,
    currentIndex: 5,
  },
};

export const Empty: Story = {
  args: {
    plys: [],
    currentIndex: 0,
  },
};
