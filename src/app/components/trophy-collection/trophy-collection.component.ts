import { Component, input } from '@angular/core';

@Component({
  selector: 'cr-trophy-collection',
  templateUrl: './trophy-collection.component.html',
  styleUrl: './trophy-collection.component.scss',
})
export class TrophyCollectionComponent {
  public count = input<number>(0);
  public size = input<'small' | 'large'>('small');

  public getTrophiesArray(): number[] {
    return Array(this.count()).fill(0);
  }
}
