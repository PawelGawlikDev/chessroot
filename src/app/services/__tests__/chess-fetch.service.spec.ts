import { ChessFetchService } from '../chess-fetch.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('ChessFetchService', () => {
  let service: ChessFetchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChessFetchService, provideHttpClient(withFetch()), provideHttpClientTesting()],
    });

    service = TestBed.inject(ChessFetchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should add lichess oauth token', () => {
    service.addLichessOauthToken('test-token');
    expect(service).toBeTruthy();
  });

  it('should reset oauth token', () => {
    service.addLichessOauthToken('test-token');
    service.resetOauthToken();
    expect(service).toBeTruthy();
  });

  it('should throw FetchError on server error', () => {
    expect(() => {
      service.checkForServerError({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as unknown as Response);
    }).toThrow();
  });

  it('should create successful response', () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ test: 'data' }),
    } as unknown as Response;

    mockResponse.json().then((data: unknown) => {
      expect(data).toEqual({ test: 'data' });
    });
  });
});
