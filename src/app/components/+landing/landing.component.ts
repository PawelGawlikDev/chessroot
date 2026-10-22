import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  afterNextRender,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { LichessAuthService, SeoService } from '@services';

import { SEO_PAGES } from '../../seo-pages';

@Component({
  selector: 'cr-landing',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  private seo = inject(SeoService);
  public auth = inject(LichessAuthService);
  public $hasHydrated = signal(false);

  constructor() {
    afterNextRender(() => this.$hasHydrated.set(true));
  }

  public ngOnInit(): void {
    this.seo.setSeo(SEO_PAGES.home, '/');
  }
}
