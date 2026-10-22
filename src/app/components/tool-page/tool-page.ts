import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AchievementsComponent } from '../+achivements/achievements.component';
import { OpeningExplorerComponent } from '../+opening-explorer/opening-explorer.component';
import { ToolsComponent } from '../+tools/tools.component';
import type { RouteReactivatable } from '../../route-reuse-strategy';
import { SEO_PAGES } from '../../seo-pages';
import { SeoService } from '../../services/seo.service';

type Tool = 'explorer' | 'tools' | 'achievements';

@Component({
  selector: 'cr-tool-page',
  imports: [OpeningExplorerComponent, ToolsComponent, AchievementsComponent],
  templateUrl: './tool-page.html',
})
export class ToolPage implements OnInit, RouteReactivatable {
  private seo = inject(SeoService);
  public readonly tool = inject(ActivatedRoute).snapshot.data['tool'] as Tool;
  private readonly page = SEO_PAGES[this.tool];

  public ngOnInit(): void {
    this.onRouteReactivated();
  }

  public onRouteReactivated(): void {
    this.seo.setSeo(this.page, `/${this.tool}`);
  }
}
