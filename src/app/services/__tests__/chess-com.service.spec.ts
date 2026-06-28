import { TestBed } from '@angular/core/testing';
import { ChessComService } from '../chess-com.service';
import { ChessFetchService } from '../chess-fetch.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('ChessComService', () => {
  let service: ChessComService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChessComService,
        ChessFetchService,
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ChessComService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('getTimeControl', () => {
    it('should parse standard time control', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((service as any).getTimeControl('10+5')).toEqual({
        initial: 10,
        increment: 5,
      });
    });

    it('should parse correspondence time control', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((service as any).getTimeControl('1/86400')).toEqual({
        correspondence: 86400,
      });
    });
  });
});
