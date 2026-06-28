import { Meta, StoryObj } from '@storybook/angular';
import { AchievementCategoryComponent } from '../achievement-category.component';

const meta: Meta<AchievementCategoryComponent> = {
  title: 'Achievements/AchievementCategory',
  component: AchievementCategoryComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<AchievementCategoryComponent>;

export const WithAchievements: Story = {
  args: {
    category: {
      category: 'proud',
      categoryTitle: 'Win Streaks',
      goals: [
        {
          key: 'win-streak-3',
          metadata: { title: 'On Fire', desc: 'Win 3 games in a row', category: 'proud' },
          trophies: [],
          trophyCount: 0,
        },
        {
          key: 'win-streak-5',
          metadata: { title: 'Hot Streak', desc: 'Win 5 games in a row', category: 'proud' },
          trophies: [
            {
              gameId: 'g1',
              opponent: 'Player1',
              opponentTitle: '',
              link: '#',
              date: '2024-01-01',
              color: 'w',
            },
          ],
          trophyCount: 1,
        },
        {
          key: 'win-streak-10',
          metadata: { title: 'Unstoppable', desc: 'Win 10 games in a row', category: 'proud' },
          trophies: [
            {
              gameId: 'g2',
              opponent: 'Player2',
              opponentTitle: 'IM',
              link: '#',
              date: '2024-01-05',
              color: 'w',
            },
            {
              gameId: 'g3',
              opponent: 'Player3',
              opponentTitle: '',
              link: '#',
              date: '2024-01-06',
              color: 'b',
            },
          ],
          trophyCount: 2,
        },
      ],
    },
    expandedKeys: new Set<string>(),
  },
};

export const EmptyCategory: Story = {
  args: {
    category: {
      category: 'dirty',
      categoryTitle: 'Special Achievements',
      goals: [],
    },
    expandedKeys: new Set<string>(),
  },
};

export const WithExpandedCard: Story = {
  args: {
    category: {
      category: 'checkmate',
      categoryTitle: 'Opening Traps',
      goals: [
        {
          key: 'fool-mate',
          metadata: { title: "Fool's Mate", desc: 'Checkmate in 2 moves', category: 'checkmate' },
          trophies: [
            {
              gameId: 'g1',
              opponent: 'Beginner123',
              opponentTitle: '',
              link: '#',
              date: '2024-02-14',
              color: 'w',
            },
          ],
          trophyCount: 1,
        },
        {
          key: 'scholars-mate',
          metadata: {
            title: "Scholar's Mate",
            desc: 'Checkmate in 4 moves',
            category: 'checkmate',
          },
          trophies: [],
          trophyCount: 0,
        },
      ],
    },
    expandedKeys: new Set<string>(['fool-mate']),
  },
};
