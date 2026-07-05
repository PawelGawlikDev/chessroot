import { TestBed } from '@angular/core/testing';
import { LichessAuthService } from '../lichess-auth.service';
import { ChessFetchService } from '../chess-fetch.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('LichessAuthService', () => {
  let service: LichessAuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LichessAuthService,
        ChessFetchService,
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: () => Promise.resolve() } },
      ],
    });

    service = TestBed.inject(LichessAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('isLoggedIn', () => {
    it('should return false when no token in localStorage', () => {
      localStorage.clear();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when token exists in localStorage', () => {
      localStorage.setItem('lichessToken', 'test-token');
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('getUsername', () => {
    it('should return empty string when no username in localStorage', () => {
      localStorage.clear();
      expect(service.getUsername()).toBe('');
    });

    it('should return username when it exists in localStorage', () => {
      localStorage.setItem('lichessUsername', 'testuser');
      expect(service.getUsername()).toBe('testuser');
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

    it('should store returnUrl in sessionStorage if provided', () => {
      const returnUrl = '/dashboard';
      service.login(returnUrl);
      expect(sessionStorage.getItem('chessroot_return_url')).toBe(returnUrl);
    });
  });

  describe('logout', () => {
    it('should clear localStorage items', () => {
      localStorage.setItem('lichessToken', 'test-token');
      localStorage.setItem('lichessUsername', 'testuser');

      service.logout();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockReq = httpMock.expectOne((req: any) => req.url.includes('api/token'));
      mockReq.flush(null);
    });
  });
});
