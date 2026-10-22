import { Routes } from '@angular/router';
import { LandingComponent } from '@components/+landing/landing.component';
import { ToolPage } from '@components/tool-page/tool-page';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'achievements', component: ToolPage, data: { tool: 'achievements' } },
  { path: 'tools', component: ToolPage, data: { tool: 'tools' } },
  { path: 'explorer', component: ToolPage, data: { tool: 'explorer' } },
  { path: '**', redirectTo: '' },
];
