import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';

import { ChessRoot } from './app/app.component';
import { appConfig } from './app/app.config';

let deploy: { environment?: string; tag?: string } | null = null;

void fetch('/assets/deploy.json')
  .then((response) => response.json())
  .then((metadata) => (deploy = metadata))
  .catch(() => undefined);

Sentry.init({
  dsn: 'https://233a91f6b7eaa12f742ee61b87e71d9e@o4512125933977600.ingest.de.sentry.io/4512193809416272',
  environment: isDevMode() ? 'development' : 'production',
  beforeSend: (event) => {
    if (deploy?.tag) {
      event.environment = deploy.environment;
      event.release = deploy.tag;
    }

    return event;
  },
});

bootstrapApplication(ChessRoot, appConfig).catch((err) => console.error(err));
