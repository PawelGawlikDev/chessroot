import { Meta, StoryObj } from '@storybook/angular';
import { MovesTableComponent } from '../moves-table.component';
import type { ExplorerMove } from '@model/opening-explorer.model';

const sampleMoves: ExplorerMove[] = [
  {
    san: 'e4',
    orig: 'e2',
    dest: 'e4',
    moveCount: 1_200_000,
    level: 0,
    details: {
      whiteWins: 480_000,
      blackWins: 420_000,
      draws: 300_000,
      count: 1_200_000,
      totalOpponentElo: 0,
      hasData: true,
    },
  },
  {
    san: 'd4',
    orig: 'd2',
    dest: 'd4',
    moveCount: 980_000,
    level: 0,
    details: {
      whiteWins: 410_000,
      blackWins: 330_000,
      draws: 240_000,
      count: 980_000,
      totalOpponentElo: 0,
      hasData: true,
    },
  },
  {
    san: 'Nf3',
    orig: 'g1',
    dest: 'f3',
    moveCount: 520_000,
    level: 0,
    details: {
      whiteWins: 210_000,
      blackWins: 180_000,
      draws: 130_000,
      count: 520_000,
      totalOpponentElo: 0,
      hasData: true,
    },
  },
  {
    san: 'c4',
    orig: 'c2',
    dest: 'c4',
    moveCount: 380_000,
    level: 0,
    details: {
      whiteWins: 160_000,
      blackWins: 130_000,
      draws: 90_000,
      count: 380_000,
      totalOpponentElo: 0,
      hasData: true,
    },
  },
  {
    san: 'g3',
    orig: 'g2',
    dest: 'g3',
    moveCount: 45_000,
    level: 0,
    details: {
      whiteWins: 19_000,
      blackWins: 15_000,
      draws: 11_000,
      count: 45_000,
      totalOpponentElo: 0,
      hasData: true,
    },
  },
];

const meta: Meta<MovesTableComponent> = {
  title: 'Shared/MovesTable',
  component: MovesTableComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<MovesTableComponent>;

export const Default: Story = {
  args: {
    moves: sampleMoves,
  },
};

export const AsPercentages: Story = {
  args: {
    moves: sampleMoves,
    showAsPercentage: true,
  },
};

export const WithHighlight: Story = {
  args: {
    moves: sampleMoves,
    highlightSan: 'd4',
  },
};

export const WithSettings: Story = {
  args: {
    moves: sampleMoves,
    showSettings: true,
  },
};

export const Empty: Story = {
  args: {
    moves: [],
  },
};

export const SingleMove: Story = {
  args: {
    moves: [sampleMoves[0]],
  },
};
