import { TestBed } from '@angular/core/testing';
import { LichessService } from '../lichess.service';
import { ChessFetchService } from '../chess-fetch.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('LichessService', () => {
  let service: LichessService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LichessService,
        ChessFetchService,
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(LichessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('qs', () => {
    it('should build query string from empty object', () => {
      expect(service.qs({})).toBe('');
    });

    it('should build query string from object with params', () => {
      const result = service.qs({ max: 10, rated: true });
      expect(result).toContain('max=10');
      expect(result).toContain('rated=true');
    });

    it('should handle single param', () => {
      const result = service.qs({ since: 1234567890 });
      expect(result).toContain('since=1234567890');
    });

    it('should handle perfType with comma-separated values', () => {
      const result = service.qs({ perfType: 'bullet,blitz,rapid' });
      expect(result).toContain('perfType=');
      expect(result).toContain('bullet');
      expect(result).toContain('blitz');
      expect(result).toContain('rapid');
    });

    it('should handle color param', () => {
      const result = service.qs({ color: 'white' });
      expect(result).toContain('color=white');
    });

    it('should handle combined since, until, perfType and color params', () => {
      const result = service.qs({
        since: 1609459200000,
        until: 1640995200000,
        perfType: 'blitz',
        color: 'white',
      });
      expect(result).toContain('since=1609459200000');
      expect(result).toContain('until=1640995200000');
      expect(result).toContain('perfType=');
      expect(result).toContain('color=white');
    });
  });
});
