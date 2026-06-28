import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

export interface Acknowledgement {
  name: string;
  url: string;
}

@Component({
  selector: 'cr-acknowledgements-dialog',
  imports: [MatDialogModule, MatButtonModule, MatListModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './acknowledgements-dialog.component.html',
  styleUrl: './acknowledgements-dialog.component.scss',
})
export class AcknowledgementsDialogComponent {
  public readonly acknowledgements: Acknowledgement[] = [
    { name: 'Lichess API', url: 'https://lichess.org/api' },
    { name: 'Chess.com API', url: 'https://www.chess.com/club/chess-com-developer-community' },
    { name: 'chess.js', url: 'https://github.com/jhlywa/chess.js' },
    { name: 'Chessground', url: 'https://github.com/lichess-org/chessground' },
    { name: 'ngx-chessground', url: 'https://github.com/flackr/ngx-chessground' },
    { name: 'chessops', url: 'https://github.com/niklasf/chessops' },
    { name: 'PGN Parser', url: 'https://github.com/mliebelt/pgn-parser' },
    { name: 'Opening Tree', url: 'https://openingtree.com' },
    { name: 'Rosen Score', url: 'https://rosen-score.vercel.app' },
  ];
}
