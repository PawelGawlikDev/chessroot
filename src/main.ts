import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';

import { ChessRoot } from './app/app.component';
import { appConfig } from './app/app.config';

Sentry.init({
  dsn: 'https://233a91f6b7eaa12f742ee61b87e71d9e@o4512125933977600.ingest.de.sentry.io/4512193809416272',
});

bootstrapApplication(ChessRoot, appConfig).catch((err) => console.error(err));
