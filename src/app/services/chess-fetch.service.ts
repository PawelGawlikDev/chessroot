import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { FetchOptions, FetchError, NetworkError } from '@model';

interface RetryConfig {
  maxRetries?: number;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
};

@Injectable({
  providedIn: 'root',
})
export class ChessFetchService {
  private http = inject(HttpClient);
  private lichessOauthToken: string | null = null;
  private abortController = new AbortController();

  public addLichessOauthToken(token: string): void {
    this.lichessOauthToken = token;
  }

  public resetOauthToken(): void {
    this.lichessOauthToken = null;
  }

  public cancelFetch(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  public async fetchFromEndpoint(url: string, options: FetchOptions = {}): Promise<Response> {
    const headers = this.buildHeaders(url, options);

    if (headers['Accept']?.includes('ndjson')) {
      return this.fetchStream(url, headers);
    }

    try {
      const data = await firstValueFrom(
        this.http.get(url, { headers }).pipe(
          retry({
            count: DEFAULT_RETRY_CONFIG.maxRetries,
            delay: (error) => {
              if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500) {
                throw error;
              }
              return new Promise((resolve) =>
                setTimeout(() => resolve(null), 1000 * Math.pow(2, 0)),
              );
            },
          }),
          catchError((error: HttpErrorResponse) => {
            throw new FetchError(
              `${error.status}: ${error.statusText}`,
              error.status,
              error.statusText,
            );
          }),
        ),
      );

      return this.createJsonResponse(data);
    } catch (error) {
      if (error instanceof FetchError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new NetworkError(message);
    }
  }

  public checkForServerError(response: Response): void {
    if (!response.ok) {
      throw new FetchError(
        `${response.status}: ${response.statusText}`,
        response.status,
        response.statusText,
      );
    }
  }

  private buildHeaders(url: string, options: FetchOptions): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    };

    if (
      this.lichessOauthToken &&
      (url.startsWith('https://lichess.org/') || url.startsWith('https://explorer.lichess.ovh/'))
    ) {
      headers['Authorization'] = `Bearer ${this.lichessOauthToken}`;
    }

    return headers;
  }

  private async fetchStream(url: string, headers: Record<string, string>): Promise<Response> {
    try {
      return await fetch(url, {
        headers,
        signal: this.abortController.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request cancelled');
      }
      const message = error instanceof Error ? error.message : 'Unknown network error';
      throw new NetworkError(message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createJsonResponse(data: any): Response {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => data,
    } as unknown as Response;
  }
}
