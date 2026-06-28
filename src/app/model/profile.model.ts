import { ChessSite } from './chess-site.model';

interface Rating {
  rating: number;
  games: number;
}

export interface Profile {
  site: ChessSite;
  type: 'profile';
  link: string;
  username: string;
  title?: string;
  createdAt?: number;
  lastSeenAt?: number;
  name?: string;
  location?: string;
  ratings?: {
    bullet: Rating;
    blitz: Rating;
    rapid: Rating;
  };
  counts?: {
    all?: number;
  };
  disabled?: boolean;
  marked?: boolean;
}
