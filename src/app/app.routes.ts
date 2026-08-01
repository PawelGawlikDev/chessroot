import { Routes } from '@angular/router';
import { AchievementsComponent } from '@components/+achivements/achievements.component';
import { LandingComponent } from '@components/+landing/landing.component';
import { OpeningExplorerComponent } from '@components/+opening-explorer/opening-explorer.component';
import { ToolsComponent } from '@components/+tools/tools.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'achievements', component: AchievementsComponent },
  { path: 'tools', component: ToolsComponent },
  { path: 'explorer', component: OpeningExplorerComponent },
  { path: '**', redirectTo: '' },
];
