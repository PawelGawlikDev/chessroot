import { TestBed } from '@angular/core/testing';

import { SoundService } from '../sound.service';

describe('SoundService', () => {
  let service: SoundService;
  let playSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    playSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve());
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundService);
  });

  afterEach(() => {
    playSpy.mockRestore();
    localStorage.clear();
  });

  it('should create the service enabled by default', () => {
    expect(service.enabled()).toBe(true);
  });

  it('should play a sound when enabled', () => {
    service.play('move');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('should not play a sound when disabled', () => {
    service.toggle();
    service.play('move');
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('should persist the enabled state across instances', () => {
    service.toggle();
    expect(service.enabled()).toBe(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const other = TestBed.inject(SoundService);
    expect(other.enabled()).toBe(false);
  });

  describe('playForSan', () => {
    it('should play the check sound for a checking move', () => {
      const spy = vi.spyOn(service, 'play');
      service.playForSan('Qh5+');
      expect(spy).toHaveBeenCalledWith('check');
    });

    it('should play the check sound for a checkmating move', () => {
      const spy = vi.spyOn(service, 'play');
      service.playForSan('Qxf7#');
      expect(spy).toHaveBeenCalledWith('check');
    });

    it('should play the capture sound for a capturing move', () => {
      const spy = vi.spyOn(service, 'play');
      service.playForSan('Nxe5');
      expect(spy).toHaveBeenCalledWith('capture');
    });

    it('should play the move sound for a quiet move', () => {
      const spy = vi.spyOn(service, 'play');
      service.playForSan('e4');
      expect(spy).toHaveBeenCalledWith('move');
    });
  });
});
