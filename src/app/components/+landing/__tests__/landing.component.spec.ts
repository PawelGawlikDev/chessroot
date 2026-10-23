import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LichessAuthService } from '@services';

import { LandingComponent } from '../landing.component';

describe('LandingComponent', () => {
  const mockAuthService = {
    isLoggedIn: vi.fn().mockReturnValue(false),
    getUsername: vi.fn().mockReturnValue(''),
    login: vi.fn(),
  };

  function createComponent() {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideRouter([]), { provide: LichessAuthService, useValue: mockAuthService }],
    });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should display the hero title', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Chess opening tree');
  });

  it('should display workspace cards', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.workspace-card').length).toBe(4);
  });

  it('should show the Ko-fi support link on the landing page', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const supportLink = Array.from(el.querySelectorAll('a')).find(
      (link) => link.getAttribute('href') === 'https://ko-fi.com/N0F523L5OT',
    );

    expect(supportLink?.textContent).toContain('Open Ko-fi');
  });

  it('shows the disclosed Chess.com affiliate link near the homepage actions', () => {
    const { fixture } = createComponent();
    const promotion = (fixture.nativeElement as HTMLElement).querySelector('.hero__affiliate');
    const link = promotion?.querySelector('a');
    const url = new URL(link!.href);

    expect(url.origin).toBe('https://www.chess.com');
    expect(url.pathname).toBe('/membership');
    expect(url.searchParams.get('ref_id')).toBe('78564684');
    expect(link?.target).toBe('_blank');
    expect(link?.relList.contains('sponsored')).toBe(true);
    expect(link?.relList.contains('noopener')).toBe(true);
    expect(link?.getAttribute('aria-label')).toContain('opens in a new tab');
    const disclosure = promotion?.querySelector('#affiliate-disclosure');
    expect(disclosure?.textContent).toContain('may earn a commission');
    expect(link?.getAttribute('aria-describedby')).toBe(disclosure?.id);
  });

  it('should have navigation links to explorer, insights, achievements', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('a[routerLink]');
    const paths = Array.from(links).map((l) => l.getAttribute('routerLink'));
    expect(paths).toContain('/explorer');
    expect(paths).toContain('/tools');
    expect(paths).toContain('/achievements');
  });

  it('should show login button when not logged in', () => {
    mockAuthService.isLoggedIn.mockReturnValue(false);
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Log in with Lichess');
  });

  it('should show username when logged in', () => {
    mockAuthService.isLoggedIn.mockReturnValue(true);
    mockAuthService.getUsername.mockReturnValue('testuser');
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('testuser');
    expect(el.textContent).not.toContain('Log in with Lichess');
  });

  it('should call auth.login on login button click', () => {
    mockAuthService.isLoggedIn.mockReturnValue(false);
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const loginBtn = el.querySelector('.hero__login-btn') as HTMLElement;
    loginBtn.click();
    expect(mockAuthService.login).toHaveBeenCalled();
  });
});
