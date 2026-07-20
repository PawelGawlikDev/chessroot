import { ChessComService } from '../chess-com.service';
import { TestBed } from '@angular/core/testing';

describe('ChessComService', () => {
  let service: ChessComService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChessComService],
    });

    service = TestBed.inject(ChessComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch player profile', async () => {
    const username = 'erik';
    const profile = await service.profile(username);
    expect(profile).toBeDefined();
    expect(profile.username).toBe(username);
  });

  it('should fetch player stats', async () => {
    const username = 'erik';
    const stats = await service.stats(username);
    expect(stats).toBeDefined();
    expect(stats.chess_blitz).toBeDefined();
  });
});
