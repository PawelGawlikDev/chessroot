import { Injectable, inject, signal } from '@angular/core';

import { LocalStorageService } from '@services/local-storage.service';

export type SoundEffect = 'move' | 'capture' | 'check';

const SOUND_FILES: Record<SoundEffect, string> = {
  move: 'assets/sound/Move.mp3',
  capture: 'assets/sound/Capture.mp3',
  check: 'assets/sound/Check.mp3',
};

const SOUND_ENABLED_KEY = 'sound-enabled';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private localStorage = inject(LocalStorageService);
  private audioCache = new Map<SoundEffect, HTMLAudioElement>();
  private $enabled = signal(this.localStorage.getItem<boolean>(SOUND_ENABLED_KEY) ?? true);
  public readonly enabled = this.$enabled.asReadonly();

  public toggle(): void {
    this.$enabled.update((value) => !value);
    this.localStorage.setItem(SOUND_ENABLED_KEY, this.$enabled());
  }

  public playForSan(san: string): void {
    this.play(effectForSan(san));
  }

  public play(effect: SoundEffect): void {
    if (!this.$enabled()) return;
    const audio = this.getAudio(effect);
    audio.currentTime = 0;
    audio.play()?.catch(() => {
      /* playback can be blocked before the first user interaction */
    });
  }

  private getAudio(effect: SoundEffect): HTMLAudioElement {
    let audio = this.audioCache.get(effect);
    if (!audio) {
      audio = new Audio(SOUND_FILES[effect]);
      this.audioCache.set(effect, audio);
    }
    return audio;
  }
}

function effectForSan(san: string): SoundEffect {
  if (san.includes('+') || san.includes('#')) return 'check';
  if (san.includes('x')) return 'capture';
  return 'move';
}
