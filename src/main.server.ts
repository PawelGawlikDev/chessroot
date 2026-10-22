import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';

import { ChessRoot } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(ChessRoot, config, context);

export default bootstrap;
