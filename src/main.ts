import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';

import { version } from '../package.json';
import { ChessRoot } from './app/app.component';
import { appConfig } from './app/app.config';

// Replaced by Angular's build configuration, not fetched at runtime. CI defines
// SENTRY_RELEASE from the git tag so development and production share the exact
// version that was released; local builds fall back to package.json.
declare const SENTRY_ENVIRONMENT: string;
declare const SENTRY_RELEASE: string | undefined;

Sentry.init({
  dsn: 'https://233a91f6b7eaa12f742ee61b87e71d9e@o4512125933977600.ingest.de.sentry.io/4512193809416272',
  release: typeof SENTRY_RELEASE === 'undefined' ? `v${version}` : SENTRY_RELEASE,
  environment: SENTRY_ENVIRONMENT,
  enabled: !isDevMode(),
});

bootstrapApplication(ChessRoot, appConfig).catch((err) => console.error(err));
