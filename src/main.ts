import { bootstrapApplication } from '@angular/platform-browser';

import { ChessRoot } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(ChessRoot, appConfig).catch((err) => console.error(err));
