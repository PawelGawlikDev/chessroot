import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KofiBannerComponent } from './kofi-banner.component';

const KOFI_KEY = 'chess-kofi-banner-dismissed';

describe('KofiBannerComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [KofiBannerComponent],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(KofiBannerComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show banner when not previously dismissed', () => {
    const fixture = TestBed.createComponent(KofiBannerComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTruthy();
    const bannerEl = fixture.debugElement.query(By.css('.kofi-fab'));
    expect(bannerEl).toBeTruthy();
  });

  it('should hide banner when previously dismissed', () => {
    localStorage.setItem(KOFI_KEY, JSON.stringify(true));
    const fixture = TestBed.createComponent(KofiBannerComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalsy();
    const bannerEl = fixture.debugElement.query(By.css('.kofi-fab'));
    expect(bannerEl).toBeNull();
  });

  it('should hide banner and persist after dismiss()', () => {
    const fixture = TestBed.createComponent(KofiBannerComponent);
    fixture.detectChanges();

    fixture.componentInstance.dismiss();
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBeFalsy();
    const bannerEl = fixture.debugElement.query(By.css('.kofi-fab'));
    expect(bannerEl).toBeNull();

    const stored = JSON.parse(localStorage.getItem(KOFI_KEY) as string);
    expect(stored).toBeTruthy();
  });

  it('should render the Ko-fi link with correct href', () => {
    const fixture = TestBed.createComponent(KofiBannerComponent);
    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('.kofi-fab__link'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.getAttribute('href')).toBe('https://ko-fi.com/N0F523L5OT');
    expect(link.nativeElement.getAttribute('target')).toBe('_blank');
  });

  it('should render the Ko-fi image', () => {
    const fixture = TestBed.createComponent(KofiBannerComponent);
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('.kofi-fab__image'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.getAttribute('alt')).toBe('Buy Me a Coffee at ko-fi.com');
  });

  it('should have a dismiss button', () => {
    const fixture = TestBed.createComponent(KofiBannerComponent);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('.kofi-fab__close'));
    expect(btn).toBeTruthy();
  });
});
