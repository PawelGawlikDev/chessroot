import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AchievementCardComponent } from '../achievement-card/achievement-card.component';
import { CategoryResult } from '@model';

@Component({
  selector: 'cr-achievement-category',
  imports: [AchievementCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './achievement-category.component.html',
  styleUrl: './achievement-category.component.scss',
})
export class AchievementCategoryComponent {
  public category = input.required<CategoryResult>();
  public expandedKeys = input.required<Set<string>>();
  public toggle = output<string>();
}
