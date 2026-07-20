import { TestBed } from '@angular/core/testing';
import { OpeningBookService } from '../opening-book.service';
import { ChessFetchService } from '@services';
import { DEFAULT_BOOK_CONFIG } from '@model/opening-explorer.model';
import type { BookApiResponse, OpeningBookConfig } from '@model/opening-explorer.model';

describe('OpeningBookService', () => {
  let service: OpeningBookService;
  let mockFetchService: {
    fetchFromEndpoint: ReturnType<typeof vi.fn>;
    checkForServerError: ReturnType<typeof vi.fn>;
  };

  const TEST_FEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
  const TEST_FEN_2 = 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1';

  function createMockApiResponse(overrides?: Partial<BookApiResponse>): BookApiResponse {
    return {
      moves: [
        { san: 'e5', white: 100, black: 80, draws: 50, averageRating: 2100 },
        { san: 'c5', white: 90, black: 70, draws: 40, averageRating: 2200 },
      ],
      opening: { eco: 'C20', name: "King's Pawn Game" },
      ...overrides,
    };
  }

  function createMockResponse(data: BookApiResponse): Response {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue(data),
    } as unknown as Response;
  }

  beforeEach(() => {
    mockFetchService = {
      fetchFromEndpoint: vi.fn(),
      checkForServerError: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [OpeningBookService, { provide: ChessFetchService, useValue: mockFetchService }],
    });

    service = TestBed.inject(OpeningBookService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should have default config matching DEFAULT_BOOK_CONFIG', () => {
    expect(service.config()).toEqual(DEFAULT_BOOK_CONFIG);
  });

  describe('updateConfig', () => {
    it('should change the config signal', () => {
      const newConfig: OpeningBookConfig = {
        bookType: 'masters',
        ratings: [2200, 2500],
        speeds: ['classical'],
      };
      service.updateConfig(newConfig);
      expect(service.config()).toEqual(newConfig);
    });

    it('should clear the cache when updating config', async () => {
      const apiResponse = createMockApiResponse();
      mockFetchService.fetchFromEndpoint.mockResolvedValue(createMockResponse(apiResponse));
      mockFetchService.checkForServerError.mockImplementation(() => {});

      await service.fetchBookMoves(TEST_FEN);
      expect(mockFetchService.fetchFromEndpoint).toHaveBeenCalledTimes(1);

      service.updateConfig({ ...DEFAULT_BOOK_CONFIG, bookType: 'masters' });

      await service.fetchBookMoves(TEST_FEN);
      expect(mockFetchService.fetchFromEndpoint).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchBookMoves', () => {
    it('should return { fetch: "off" } when bookType is off', async () => {
      service.updateConfig({ bookType: 'off', ratings: [], speeds: [] });
      const result = await service.fetchBookMoves(TEST_FEN);
      expect(result).toEqual({ fetch: 'off' });
      expect(mockFetchService.fetchFromEndpoint).not.toHaveBeenCalled();
    });

    it('should call fetchFromEndpoint with correct URL', async () => {
      const apiResponse = createMockApiResponse();
      mockFetchService.fetchFromEndpoint.mockResolvedValue(createMockResponse(apiResponse));
      mockFetchService.checkForServerError.mockImplementation(() => {});

      await service.fetchBookMoves(TEST_FEN);

      const expectedUrl = `https://explorer.lichess.ovh/lichess?fen=${encodeURIComponent(TEST_FEN)}&variant=standard&ratings=2000,2200,2500&speeds=rapid,classical`;
      expect(mockFetchService.fetchFromEndpoint).toHaveBeenCalledWith(expectedUrl, {
        headers: { 'User-Agent': 'chess-app/1.0' },
      });
    });

    it('should call checkForServerError after fetch', async () => {
      const apiResponse = createMockApiResponse();
      const mockResponse = createMockResponse(apiResponse);
      mockFetchService.fetchFromEndpoint.mockResolvedValue(mockResponse);
      mockFetchService.checkForServerError.mockImplementation(() => {});

      await service.fetchBookMoves(TEST_FEN);

      expect(mockFetchService.checkForServerError).toHaveBeenCalledWith(mockResponse);
    });

    it('should transform API response correctly', async () => {
      const apiResponse = createMockApiResponse();
      mockFetchService.fetchFromEndpoint.mockResolvedValue(createMockResponse(apiResponse));
      mockFetchService.checkForServerError.mockImplementation(() => {});

      const result = await service.fetchBookMoves(TEST_FEN);

      expect(result.fetch).toBe('success');
      expect(result.openingName).toBe("C20 King's Pawn Game");
      expect(result.moves).toHaveLength(2);

      const firstMove = result.moves![0];
      expect(firstMove.san).toBe('e5');
      expect(firstMove.moveCount).toBe(230); // 100 + 80 + 50
      expect(firstMove.details).toEqual({
        hasData: true,
        whiteWins: 100,
        blackWins: 80,
        draws: 50,
        count: 230,
        totalOpponentElo: 2100 * 230,
        averageElo: 2100,
      });
    });

    it('should handle empty moves array', async () => {
      const apiResponse = createMockApiResponse({ moves: [] });
      mockFetchService.fetchFromEndpoint.mockResolvedValue(createMockResponse(apiResponse));
      mockFetchService.checkForServerError.mockImplementation(() => {});

      const result = await service.fetchBookMoves(TEST_FEN);

      expect(result.fetch).toBe('success');
      expect(result.moves).toEqual([]);
    });

    it('should handle missing opening in response by using lastOpeningName', async () => {
      const apiResponseWithOpening = createMockApiResponse();
      mockFetchService.fetchFromEndpoint.mockResolvedValue(
        createMockResponse(apiResponseWithOpening),
      );
      mockFetchService.checkForServerError.mockImplementation(() => {});

      await service.fetchBookMoves(TEST_FEN);

      const apiResponseWithoutOpening = createMockApiResponse({ opening: undefined });
      mockFetchService.fetchFromEndpoint.mockResolvedValue(
        createMockResponse(apiResponseWithoutOpening),
      );

      const result = await service.fetchBookMoves(TEST_FEN_2);

      expect(result.openingName).toBe("C20 King's Pawn Game");
    });

    it('should cache results for same FEN', async () => {
      const apiResponse = createMockApiResponse();
      mockFetchService.fetchFromEndpoint.mockResolvedValue(createMockResponse(apiResponse));
      mockFetchService.checkForServerError.mockImplementation(() => {});

      const result1 = await service.fetchBookMoves(TEST_FEN);
      const result2 = await service.fetchBookMoves(TEST_FEN);

      expect(mockFetchService.fetchFromEndpoint).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
    });

    it('should return pending from cache for second concurrent call', async () => {
      const apiResponse = createMockApiResponse();
      mockFetchService.fetchFromEndpoint.mockResolvedValue(createMockResponse(apiResponse));
      mockFetchService.checkForServerError.mockImplementation(() => {});

      const promise1 = service.fetchBookMoves(TEST_FEN);
      const promise2 = service.fetchBookMoves(TEST_FEN);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(mockFetchService.fetchFromEndpoint).toHaveBeenCalledTimes(1);
      expect(result1.fetch).toBe('success');
      // Second concurrent call gets the pending placeholder from cache
      expect(result2.fetch).toBe('pending');
    });

    it('should return "failed" when fetch throws', async () => {
      mockFetchService.fetchFromEndpoint.mockRejectedValue(new Error('Network error'));

      const result = await service.fetchBookMoves(TEST_FEN);

      expect(result).toEqual({ fetch: 'failed' });
    });

    it('should cache the failed result', async () => {
      mockFetchService.fetchFromEndpoint.mockRejectedValue(new Error('Network error'));

      await service.fetchBookMoves(TEST_FEN);
      const result = await service.fetchBookMoves(TEST_FEN);

      expect(mockFetchService.fetchFromEndpoint).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ fetch: 'failed' });
    });

    it('should use masters bookType in URL when configured', async () => {
      service.updateConfig({ bookType: 'masters', ratings: [2500], speeds: ['classical'] });
      const apiResponse = createMockApiResponse();
      mockFetchService.fetchFromEndpoint.mockResolvedValue(createMockResponse(apiResponse));
      mockFetchService.checkForServerError.mockImplementation(() => {});

      await service.fetchBookMoves(TEST_FEN);

      const calledUrl = mockFetchService.fetchFromEndpoint.mock.calls[0][0];
      expect(calledUrl).toContain('/masters?');
      expect(calledUrl).toContain('ratings=2500');
      expect(calledUrl).toContain('speeds=classical');
    });

    it('should handle moves with missing data correctly', async () => {
      const apiResponse = createMockApiResponse({ moves: [] });
      mockFetchService.fetchFromEndpoint.mockResolvedValue(createMockResponse(apiResponse));
      mockFetchService.checkForServerError.mockImplementation(() => {});

      const result = await service.fetchBookMoves(TEST_FEN);

      expect(result.moves).toEqual([]);
      expect(result.fetch).toBe('success');
    });
  });

  describe('clearCache', () => {
    it('should reset cache and lastOpeningName', async () => {
      const apiResponse = createMockApiResponse();
      mockFetchService.fetchFromEndpoint.mockResolvedValue(createMockResponse(apiResponse));
      mockFetchService.checkForServerError.mockImplementation(() => {});

      await service.fetchBookMoves(TEST_FEN);
      expect(mockFetchService.fetchFromEndpoint).toHaveBeenCalledTimes(1);

      service.clearCache();

      await service.fetchBookMoves(TEST_FEN);
      expect(mockFetchService.fetchFromEndpoint).toHaveBeenCalledTimes(2);
    });

    it('should not use previous openingName after cache clear', async () => {
      const apiResponseWithOpening = createMockApiResponse();
      mockFetchService.fetchFromEndpoint.mockResolvedValue(
        createMockResponse(apiResponseWithOpening),
      );
      mockFetchService.checkForServerError.mockImplementation(() => {});

      await service.fetchBookMoves(TEST_FEN);

      service.clearCache();

      const apiResponseWithoutOpening = createMockApiResponse({ opening: undefined });
      mockFetchService.fetchFromEndpoint.mockResolvedValue(
        createMockResponse(apiResponseWithoutOpening),
      );

      const result = await service.fetchBookMoves(TEST_FEN);

      expect(result.openingName).toBeUndefined();
    });
  });
});
