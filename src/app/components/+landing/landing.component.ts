import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LichessAuthService, SeoService } from '@services';

@Component({
  selector: 'cr-landing',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  private seo = inject(SeoService);
  public auth = inject(LichessAuthService);

  public ngOnInit(): void {
    this.seo.setSeo(
      {
        title: 'Home',
        description:
          'Analyze your chess games from Lichess and Chess.com. Discover insights, track achievements, and explore openings with ChessRoot.',
      },
      '/',
    );
  }
}
