import { TestBed } from '@angular/core/testing';
import { LichessAuthService } from '../lichess-auth.service';
import { ChessFetchService } from '../chess-fetch.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

const routerMock = {
  url: '/current-route',
  navigate: vi.fn(() => Promise.resolve(true)),
  navigateByUrl: vi.fn(() => Promise.resolve(true)),
};

describe('LichessAuthService', () => {
  let service: LichessAuthService;
  let httpMock: HttpTestingController;
  let fetchService: ChessFetchService;

  beforeEach(() => {
    routerMock.url = '/current-route';
    routerMock.navigate.mockClear();
    routerMock.navigateByUrl.mockClear();

    TestBed.configureTestingModule({
      providers: [
        LichessAuthService,
        ChessFetchService,
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(LichessAuthService);
    httpMock = TestBed.inject(HttpTestingController);
    fetchService = TestBed.inject(ChessFetchService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('isLoggedIn', () => {
    it('should return false when no token in localStorage', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when token exists in localStorage', () => {
      localStorage.setItem('lichessToken', 'test-token');
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('getUsername', () => {
    it('should return empty string when no username in localStorage', () => {
      expect(service.getUsername()).toBe('');
    });

    it('should return username when it exists in localStorage', () => {
      localStorage.setItem('lichessUsername', 'testuser');
      expect(service.getUsername()).toBe('testuser');
    });
  });

  describe('init', () => {
    it('should restore an existing token from localStorage', async () => {
      localStorage.setItem('lichessToken', 'saved-token');
      const addTokenSpy = vi.spyOn(fetchService, 'addLichessOauthToken');
      vi.spyOn(service['oauth'], 'isReturningFromAuthServer').mockResolvedValue(false);

      await service.init();

      expect(addTokenSpy).toHaveBeenCalledWith('saved-token');
    });

    it('should handle a return from the auth server', async () => {
      sessionStorage.setItem('chessroot_return_url', '/dashboard');
      const addTokenSpy = vi.spyOn(fetchService, 'addLichessOauthToken');
      vi.spyOn(service['oauth'], 'isReturningFromAuthServer').mockResolvedValue(true);
      vi.spyOn(service['oauth'], 'getAccessToken').mockResolvedValue({
        token: { value: 'oauth-token' },
      } as never);

      const promise = service.init();
      await Promise.resolve();
      await Promise.resolve();

      const req = httpMock.expectOne('https://lichess.org/api/account');
      expect(req.request.headers.get('Authorization')).toBe('Bearer oauth-token');
      req.flush({ username: 'testuser' });

      await promise;

      expect(localStorage.getItem('lichessToken')).toBe('oauth-token');
      expect(localStorage.getItem('lichessUsername')).toBe('testuser');
      expect(addTokenSpy).toHaveBeenCalledWith('oauth-token');
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/dashboard');
      expect(sessionStorage.getItem('chessroot_return_url')).toBeNull();
    });

    it('should do nothing when not returning from auth server', async () => {
      vi.spyOn(service['oauth'], 'isReturningFromAuthServer').mockResolvedValue(false);

      await service.init();

      expect(localStorage.getItem('lichessToken')).toBeNull();
      expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should swallow oauth errors', async () => {
      vi.spyOn(service['oauth'], 'isReturningFromAuthServer').mockRejectedValue(
        new Error('cancelled'),
      );

      await expect(service.init()).resolves.toBeUndefined();
      expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should initiate login process', async () => {
      const spy = vi
        .spyOn(service['oauth'], 'fetchAuthorizationCode')
        .mockReturnValue(Promise.resolve());

      await service.login();

      expect(spy).toHaveBeenCalled();
    });

    it('should store returnUrl in sessionStorage if provided', async () => {
      vi.spyOn(service['oauth'], 'fetchAuthorizationCode').mockReturnValue(Promise.resolve());

      await service.login('/dashboard');

      expect(sessionStorage.getItem('chessroot_return_url')).toBe('/dashboard');
    });

    it('should use router.url when returnUrl is not provided', async () => {
      routerMock.url = '/tools';
      vi.spyOn(service['oauth'], 'fetchAuthorizationCode').mockReturnValue(Promise.resolve());

      await service.login();

      expect(sessionStorage.getItem('chessroot_return_url')).toBe('/tools');
    });
  });

  describe('logout', () => {
    it('should clear localStorage items', async () => {
      localStorage.setItem('lichessToken', 'test-token');
      localStorage.setItem('lichessUsername', 'testuser');
      const resetSpy = vi.spyOn(fetchService, 'resetOauthToken');
      vi.stubGlobal('location', { href: 'http://localhost/start' });

      const promise = service.logout();
      const req = httpMock.expectOne('https://lichess.org/api/token');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush(null);
      await promise;

      expect(localStorage.getItem('lichessToken')).toBeNull();
      expect(localStorage.getItem('lichessUsername')).toBeNull();
      expect(resetSpy).toHaveBeenCalled();
      expect(window.location.href).toBe('/');
    });

    it('should prefer an explicit returnUrl', async () => {
      localStorage.setItem('lichessToken', 'test-token');
      sessionStorage.setItem('chessroot_return_url', '/saved');
      vi.stubGlobal('location', { href: 'http://localhost/start' });

      const promise = service.logout('/provided');
      const req = httpMock.expectOne('https://lichess.org/api/token');
      req.flush(null);
      await promise;

      expect(window.location.href).toBe('/provided');
      expect(sessionStorage.getItem('chessroot_return_url')).toBeNull();
    });

    it('should use the sessionStorage return url when present', async () => {
      localStorage.setItem('lichessToken', 'test-token');
      sessionStorage.setItem('chessroot_return_url', '/from-session');
      vi.stubGlobal('location', { href: 'http://localhost/start' });

      const promise = service.logout();
      const req = httpMock.expectOne('https://lichess.org/api/token');
      req.flush(null);
      await promise;

      expect(window.location.href).toBe('/from-session');
    });

    it('should default to root when there is no token or stored url', async () => {
      const resetSpy = vi.spyOn(fetchService, 'resetOauthToken');
      vi.stubGlobal('location', { href: 'http://localhost/start' });

      await service.logout();

      expect(resetSpy).toHaveBeenCalled();
      expect(window.location.href).toBe('/');
    });
  });

  describe('fetchUsername', () => {
    it('should fetch and store the lichess username', async () => {
      const promise = service['fetchUsername']('private-token');
      await Promise.resolve();

      const req = httpMock.expectOne('https://lichess.org/api/account');
      expect(req.request.headers.get('Authorization')).toBe('Bearer private-token');
      req.flush({ username: 'private-user' });
      await promise;

      expect(localStorage.getItem('lichessUsername')).toBe('private-user');
    });
  });
});
