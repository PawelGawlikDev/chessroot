import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'cr-contact-dialog',
  imports: [MatDialogModule, MatButtonModule, MatListModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-dialog.component.html',
  styleUrl: './contact-dialog.component.scss',
})
export class ContactDialogComponent {
  public readonly contacts = [
    {
      platform: 'Lichess',
      username: 'pg_chess_training',
      url: 'https://lichess.org/@/pg_chess_training',
      icon: 'chess',
    },
    {
      platform: 'Chess.com',
      username: 'pg_chess_training',
      url: 'https://www.chess.com/member/pg_chess_training',
      icon: 'chess',
    },
    {
      platform: 'Reddit',
      username: 'NullPointerGambit',
      url: 'https://www.reddit.com/user/NullPointerGambit',
      icon: 'forum',
    },
  ];
}
