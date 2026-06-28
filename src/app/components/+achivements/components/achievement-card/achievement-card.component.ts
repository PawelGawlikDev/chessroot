import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TrophyCollectionComponent } from '@components/trophy-collection/trophy-collection.component';
import { AchievementResult } from '@model';

@Component({
  selector: 'cr-achievement-card',
  imports: [TrophyCollectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './achievement-card.component.html',
  styleUrl: './achievement-card.component.scss',
})
export class AchievementCardComponent {
  public achievement = input.required<AchievementResult>();
  public isExpanded = input(false);
  public toggle = output<string>();

  public onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle.emit(this.achievement().key);
    }
  }
}
