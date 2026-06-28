import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { ChessRoot } from './app/app.component';

bootstrapApplication(ChessRoot, appConfig).catch((err) => console.error(err));
