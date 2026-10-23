import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';

import { version } from '../package.json';
import { ChessRoot } from './app/app.component';
import { appConfig } from './app/app.config';

// Replaced by Angular's build configuration, not fetched at runtime.
declare const SENTRY_ENVIRONMENT: string;

Sentry.init({
  dsn: 'https://233a91f6b7eaa12f742ee61b87e71d9e@o4512125933977600.ingest.de.sentry.io/4512193809416272',
  release: `v${version}`,
  environment: SENTRY_ENVIRONMENT,
  enabled: !isDevMode(),
});

bootstrapApplication(ChessRoot, appConfig).catch((err) => console.error(err));
