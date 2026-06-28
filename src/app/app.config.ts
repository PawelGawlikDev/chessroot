import {
  ApplicationConfig,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { routes } from './app.routes';
import { LichessAuthService } from '@services/lichess-auth.service';
import { userDataReducer, explorerReducer, EXPLORER_FEATURE_KEY } from '@state/reducers';
import { USER_DATA_FEATURE_KEY } from '@state/selectors';
import { ExplorerEffects } from '@state/effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({
      [USER_DATA_FEATURE_KEY]: userDataReducer,
      [EXPLORER_FEATURE_KEY]: explorerReducer,
    }),
    provideEffects(ExplorerEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
      connectInZone: true,
    }),
    provideAppInitializer(() => {
      const authService = inject(LichessAuthService);
      return authService.init();
    }),
    provideNativeDateAdapter(),
  ],
};
