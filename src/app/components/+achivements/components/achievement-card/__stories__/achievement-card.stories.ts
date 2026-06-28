import { Meta, StoryObj } from '@storybook/angular';
import { AchievementCardComponent } from '../achievement-card.component';
import { AchievementResult } from '@model';

const baseAchievement: AchievementResult = {
  key: 'win-streak-5',
  metadata: {
    title: 'Hot Streak',
    desc: 'Win 5 games in a row',
    category: 'proud',
  },
  trophies: [],
  trophyCount: 0,
};

const meta: Meta<AchievementCardComponent> = {
  title: 'Achievements/AchievementCard',
  component: AchievementCardComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<AchievementCardComponent>;

export const NoTrophies: Story = {
  args: {
    achievement: baseAchievement,
    isExpanded: false,
  },
};

export const WithTrophies: Story = {
  args: {
    achievement: {
      ...baseAchievement,
      trophyCount: 3,
      trophies: [
        {
          gameId: 'game1',
          opponent: 'GothamChess',
          opponentTitle: 'IM',
          link: 'https://lichess.org/game1',
          date: '2024-01-15',
          color: 'w',
        },
        {
          gameId: 'game2',
          opponent: 'Hikaru',
          opponentTitle: 'GM',
          link: 'https://lichess.org/game2',
          date: '2024-01-20',
          color: 'b',
        },
        {
          gameId: 'game3',
          opponent: 'AnnaCramling',
          opponentTitle: '',
          link: 'https://lichess.org/game3',
          date: '2024-02-01',
          color: 'w',
        },
      ],
    },
    isExpanded: false,
  },
};

export const Expanded: Story = {
  args: {
    achievement: {
      ...baseAchievement,
      trophyCount: 3,
      trophies: [
        {
          gameId: 'game1',
          opponent: 'GothamChess',
          opponentTitle: 'IM',
          link: 'https://lichess.org/game1',
          date: '2024-01-15',
          color: 'w',
        },
        {
          gameId: 'game2',
          opponent: 'Hikaru',
          opponentTitle: 'GM',
          link: 'https://lichess.org/game2',
          date: '2024-01-20',
          color: 'b',
        },
        {
          gameId: 'game3',
          opponent: 'AnnaCramling',
          opponentTitle: '',
          link: 'https://lichess.org/game3',
          date: '2024-02-01',
          color: 'w',
        },
      ],
    },
    isExpanded: true,
  },
};

export const ManyTrophies: Story = {
  args: {
    achievement: {
      ...baseAchievement,
      trophyCount: 8,
      trophies: Array.from({ length: 8 }, (_, i) => ({
        gameId: `game${i + 1}`,
        opponent: `Player${i + 1}`,
        opponentTitle: i % 2 === 0 ? 'FM' : '',
        link: `https://lichess.org/game${i + 1}`,
        date: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
        color: (i % 2 === 0 ? 'w' : 'b') as 'w' | 'b',
      })),
    },
    isExpanded: true,
  },
};

export const NoDescription: Story = {
  args: {
    achievement: {
      ...baseAchievement,
      metadata: {
        title: 'Grandmaster Slayer',
        desc: '',
        category: 'proud',
      },
      trophyCount: 1,
      trophies: [
        {
          gameId: 'gm-slayer-1',
          opponent: 'MagnusCarlsen',
          opponentTitle: 'GM',
          link: 'https://lichess.org/gm-slayer-1',
          date: '2024-03-10',
          color: 'b',
        },
      ],
    },
    isExpanded: true,
  },
};
