import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import type { NavigatorPly } from '@model/opening-explorer.model';
import { buildPgnList } from './utils';

@Component({
  selector: 'cr-move-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './move-navigation.component.html',
  styleUrl: './move-navigation.component.scss',
})
export class MoveNavigationComponent {
  public plys = input.required<NavigatorPly[]>();
  public currentIndex = input.required<number>();

  public goForward = output<void>();
  public goBack = output<void>();
  public reset = output<void>();
  public navigate = output<number>();

  public $canGoForward = computed(() => this.currentIndex() < this.plys().length - 1);
  public $canGoBack = computed(() => this.currentIndex() > 0);
  public $pgnList = computed(() => buildPgnList(this.plys()));

  public activePlyIndex(moveIdx: number): number {
    return moveIdx;
  }
}
