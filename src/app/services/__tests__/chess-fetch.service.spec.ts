import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChessFetchService } from '../chess-fetch.service';
import { FetchError, NetworkError } from '@model';

interface ChessFetchServicePrivate {
  abortController: AbortController;
  buildHeaders(url: string, options: { headers?: Record<string, string> }): Record<string, string>;
  fetchStream(url: string, headers: Record<string, string>): Promise<Response>;
}

describe('ChessFetchService', () => {
  let service: ChessFetchService;
  let httpMock: HttpTestingController;
  let privateService: ChessFetchServicePrivate;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChessFetchService, provideHttpClient(withFetch()), provideHttpClientTesting()],
    });

    service = TestBed.inject(ChessFetchService);
    httpMock = TestBed.inject(HttpTestingController);
    privateService = service as unknown as ChessFetchServicePrivate;
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('should abort the current request and replace the abort controller', () => {
    const originalController = privateService.abortController;
    const abortSpy = vi.spyOn(originalController, 'abort');

    service.cancelFetch();

    expect(abortSpy).toHaveBeenCalledTimes(1);
    expect(privateService.abortController).not.toBe(originalController);
  });

  it('should fetch JSON data from an endpoint', async () => {
    const promise = service.fetchFromEndpoint('https://api.example.com/profile');
    const request = httpMock.expectOne('https://api.example.com/profile');

    expect(request.request.headers.get('Accept')).toBe('application/json');
    request.flush({ username: 'alpha' });

    const response = await promise;

    expect(response.ok).toBe(true);
    await expect(response.json()).resolves.toEqual({ username: 'alpha' });
  });

  it('should throw FetchError for 4xx responses without retrying', async () => {
    const promise = service.fetchFromEndpoint('https://api.example.com/missing');
    const requests = httpMock.match('https://api.example.com/missing');

    expect(requests).toHaveLength(1);
    requests[0].flush('Missing', { status: 404, statusText: 'Not Found' });

    await expect(promise).rejects.toMatchObject({
      name: 'FetchError',
      status: 404,
      statusText: 'Not Found',
      message: '404: Not Found',
    });
  });

  it('should throw NetworkError when HttpClient throws before the request is created', async () => {
    const httpClient = TestBed.inject(HttpClient);
    vi.spyOn(httpClient, 'get').mockImplementation(() => {
      throw new Error('Network down');
    });

    await expect(service.fetchFromEndpoint('https://api.example.com/offline')).rejects.toEqual(
      new NetworkError('Network down'),
    );
  });

  it('should send custom headers with JSON requests', async () => {
    const promise = service.fetchFromEndpoint('https://api.example.com/custom', {
      headers: {
        Accept: 'application/vnd.api+json',
        'X-Test': '123',
      },
    });
    const request = httpMock.expectOne('https://api.example.com/custom');

    expect(request.request.headers.get('Accept')).toBe('application/vnd.api+json');
    expect(request.request.headers.get('X-Test')).toBe('123');
    request.flush({ ok: true });

    const response = await promise;

    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('should use the native fetch stream path for ndjson requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ streamed: true }),
    } as Response);

    const response = await service.fetchFromEndpoint('https://lichess.org/api/games/user/test', {
      headers: { Accept: 'application/x-ndjson' },
    });

    expect(fetchSpy).toHaveBeenCalledWith('https://lichess.org/api/games/user/test', {
      headers: { Accept: 'application/x-ndjson' },
      signal: privateService.abortController.signal,
    });
    await expect(response.json()).resolves.toEqual({ streamed: true });
    httpMock.expectNone('https://lichess.org/api/games/user/test');
  });

  it('should add lichess authorization header for lichess endpoints only', () => {
    service.addLichessOauthToken('secret-token');

    expect(privateService.buildHeaders('https://lichess.org/api/account', {})).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer secret-token',
    });
    expect(privateService.buildHeaders('https://explorer.lichess.ovh/player', {})).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer secret-token',
    });
  });

  it('should not add lichess authorization header for non-lichess endpoints', () => {
    service.addLichessOauthToken('secret-token');

    expect(privateService.buildHeaders('https://api.chess.com/pub/player/test', {})).toEqual({
      Accept: 'application/json',
    });
  });

  it('should throw Request cancelled when the stream fetch is aborted', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      Object.assign(new Error('Request aborted'), { name: 'AbortError' }),
    );

    await expect(
      privateService.fetchStream('https://lichess.org/api/games/user/test', {
        Accept: 'application/x-ndjson',
      }),
    ).rejects.toEqual(new NetworkError('Request cancelled'));
  });

  it('should wrap other stream fetch failures in NetworkError', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Socket hang up'));

    await expect(
      privateService.fetchStream('https://lichess.org/api/games/user/test', {
        Accept: 'application/x-ndjson',
      }),
    ).rejects.toEqual(new NetworkError('Socket hang up'));
  });

  it('should throw FetchError on server error', () => {
    expect(() => {
      service.checkForServerError({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);
    }).toThrow(FetchError);
  });
});
