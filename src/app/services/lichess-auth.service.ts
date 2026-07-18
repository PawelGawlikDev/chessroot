import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OAuth2AuthCodePKCE } from '@bity/oauth2-auth-code-pkce';
import { ChessFetchService } from '@services';

const LICHESS_HOST = 'https://lichess.org';
const CLIENT_ID = 'http://localhost:4200/';
const STORAGE_KEY_TOKEN = 'lichessToken';
const STORAGE_KEY_USERNAME = 'lichessUsername';
const STORAGE_KEY_RETURN_URL = 'chessroot_return_url';

@Injectable({
  providedIn: 'root',
})
export class LichessAuthService {
  private router = inject(Router);
  private fetchService = inject(ChessFetchService);
  private http = inject(HttpClient);

  private oauth = new OAuth2AuthCodePKCE({
    authorizationUrl: `${LICHESS_HOST}/oauth`,
    tokenUrl: `${LICHESS_HOST}/api/token`,
    clientId: CLIENT_ID,
    scopes: [],
    redirectUrl: window.location.href.split('?')[0],
    onAccessTokenExpiry: (refreshAccessToken) => refreshAccessToken(),
    onInvalidGrant: () => {
      // placeholder - tokens cannot be refreshed
    },
  });

  public isLoggedIn(): boolean {
    return !!localStorage.getItem(STORAGE_KEY_TOKEN);
  }

  public getUsername(): string {
    return localStorage.getItem(STORAGE_KEY_USERNAME) ?? '';
  }

  public async init(): Promise<void> {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (token) {
      this.fetchService.addLichessOauthToken(token);
    }

    try {
      const isReturning = await this.oauth.isReturningFromAuthServer();
      if (isReturning) {
        const accessContext = await this.oauth.getAccessToken();
        const token = accessContext.token?.value;
        if (token) {
          localStorage.setItem(STORAGE_KEY_TOKEN, token);
          this.fetchService.addLichessOauthToken(token);
          await this.fetchUsername(token);
          const returnUrl = sessionStorage.getItem(STORAGE_KEY_RETURN_URL) ?? '/';
          sessionStorage.removeItem(STORAGE_KEY_RETURN_URL);
          this.router.navigateByUrl(returnUrl);
        }
      }
    } catch {
      // User cancelled or error
    }
  }

  public async login(returnUrl?: string): Promise<void> {
    if (returnUrl) {
      sessionStorage.setItem(STORAGE_KEY_RETURN_URL, returnUrl);
    } else {
      sessionStorage.setItem(STORAGE_KEY_RETURN_URL, this.router.url);
    }
    await this.oauth.fetchAuthorizationCode();
  }

  public async logout(returnUrl?: string): Promise<void> {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (token) {
      try {
        await firstValueFrom(
          this.http.delete(`${LICHESS_HOST}/api/token`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        );
      } catch {
        // Ignore
      }
    }
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USERNAME);
    this.fetchService.resetOauthToken();

    const url = returnUrl ?? sessionStorage.getItem(STORAGE_KEY_RETURN_URL) ?? '/';
    sessionStorage.removeItem(STORAGE_KEY_RETURN_URL);
    window.location.href = url;
  }

  private async fetchUsername(token: string): Promise<void> {
    const account = await firstValueFrom(
      this.http.get<{ username: string }>(`${LICHESS_HOST}/api/account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
    if (account) {
      localStorage.setItem(STORAGE_KEY_USERNAME, account.username);
    }
  }
}
