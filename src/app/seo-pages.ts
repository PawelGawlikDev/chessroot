import type { SeoData } from './services/seo.service';

export const SEO_PAGES = {
  home: {
    title: 'Free Chess Opening Tree & Game Analysis',
    description:
      'Analyze your Lichess and Chess.com games with ChessRoot, a free, open-source chess opening tree, repertoire explorer, game insights, and achievements.',
  },
  explorer: {
    title: 'Chess Opening Tree & Repertoire Explorer',
    description:
      'Build a personal chess opening tree from your Lichess or Chess.com games. Explore moves, compare results, and analyze positions with Stockfish.',
  },
  tools: {
    title: 'Chess Game Statistics for Lichess & Chess.com',
    description:
      'Analyze your Lichess and Chess.com game statistics. Compare win rates, openings, opponents, and time controls with free ChessRoot insights.',
  },
  achievements: {
    title: 'Chess Achievements for Lichess & Chess.com',
    description:
      'Discover chess achievements in your Lichess and Chess.com games. Find rare checkmates, pawn structures, tactical patterns, and memorable milestones.',
  },
} satisfies Record<string, SeoData>;
