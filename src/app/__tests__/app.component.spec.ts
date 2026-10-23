import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { provideRouter } from '@angular/router';

import { LichessAuthService } from '@services';

import pkg from '../../../package.json';
import { ChessRoot } from '../app.component';
import { AcknowledgementsDialogComponent } from '../components/dialogs/acknowledgements-dialog/acknowledgements-dialog.component';
import { ContactDialogComponent } from '../components/dialogs/contact-dialog/contact-dialog.component';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

describe('ChessRoot', () => {
  const dialog = {
    open: vi.fn(),
  };
  const auth = {
    isLoggedIn: vi.fn().mockReturnValue(false),
    getUsername: vi.fn().mockReturnValue(''),
    login: vi.fn(),
    logout: vi.fn(),
  };
  const iconRegistry = {
    setDefaultFontSetClass: vi.fn(),
    getDefaultFontSetClass: vi.fn().mockReturnValue([]),
  };

  function createComponent() {
    const fixture = TestBed.createComponent(ChessRoot);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  function setScrollY(value: number) {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value,
    });
  }

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-theme', 'light-theme');
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [ChessRoot],
      providers: [
        provideRouter([]),
        { provide: MatDialog, useValue: dialog },
        { provide: LichessAuthService, useValue: auth },
        { provide: MatIconRegistry, useValue: iconRegistry },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-theme', 'light-theme');
  });

  it('should create the component', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should not add an affiliate footer below the routed workspace', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('footer')).toBeNull();
    expect(el.querySelector('main a[href*="ref_id="]')).toBeNull();
  });

  it('shows a header affiliate icon with a disclosure tooltip', () => {
    const { fixture } = createComponent();
    const element = fixture.debugElement.query((entry) =>
      entry.nativeElement?.classList?.contains('app__affiliate-btn'),
    );
    const link = element.nativeElement as HTMLAnchorElement;
    expect(link.href).toBe('https://www.chess.com/membership?ref_id=78564684');
    expect(link.target).toBe('_blank');
    expect(link.relList.contains('sponsored')).toBe(true);
    expect(link.relList.contains('noopener')).toBe(true);
    expect(link.getAttribute('aria-label')).toContain('affiliate link');
    expect(element.injector.get(MatTooltip).message).toContain('may earn a commission');
    expect(link.querySelector('img')?.getAttribute('ngSrc')).toBe('/assets/chesscom.svg');
  });

  it('should toggle the theme signal between dark and light', () => {
    localStorage.setItem('chess-theme', 'dark');
    const { component } = createComponent();

    expect(component.$isDarkTheme()).toBe(true);

    component.toggleTheme();
    expect(component.$isDarkTheme()).toBe(false);

    component.toggleTheme();
    expect(component.$isDarkTheme()).toBe(true);
  });

  it('should expose the app version from package.json', () => {
    const { component } = createComponent();

    expect(component.version).toBe(pkg.version);
  });

  it('should apply dark theme classes to the document element from saved preference', () => {
    localStorage.setItem('chess-theme', 'dark');
    createComponent();

    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(document.documentElement.classList.contains('light-theme')).toBe(false);
    expect(localStorage.getItem('chess-theme')).toBe('dark');
  });

  it('should apply light theme classes to the document element from saved preference', () => {
    localStorage.setItem('chess-theme', 'light');
    createComponent();

    expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
    expect(document.documentElement.classList.contains('light-theme')).toBe(true);
    expect(localStorage.getItem('chess-theme')).toBe('light');
  });

  it('should open the acknowledgements dialog', () => {
    const { component } = createComponent();

    component.openAcknowledgements();

    expect(dialog.open).toHaveBeenCalledWith(AcknowledgementsDialogComponent, { width: '28rem' });
  });

  it('should open the contact dialog', () => {
    const { component } = createComponent();

    component.openContact();

    expect(dialog.open).toHaveBeenCalledWith(ContactDialogComponent, { width: '28rem' });
  });

  it('should keep the header hidden on upward layout shifts without user scroll intent', () => {
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(1_000);
    const { component } = createComponent();

    setScrollY(200);
    component.onWindowWheel({ deltaY: 120 } as WheelEvent);
    component.onWindowScroll();

    expect(component.$isHeaderHidden()).toBe(true);

    setScrollY(140);
    component.onWindowScroll();

    expect(component.$isHeaderHidden()).toBe(true);
    nowSpy.mockRestore();
  });

  it('should show the header again after a real upward scroll intent', () => {
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(1_000);
    const { component } = createComponent();

    setScrollY(220);
    component.onWindowWheel({ deltaY: 120 } as WheelEvent);
    component.onWindowScroll();

    expect(component.$isHeaderHidden()).toBe(true);

    nowSpy.mockReturnValue(1_100);
    component.onWindowWheel({ deltaY: -120 } as WheelEvent);
    setScrollY(160);
    component.onWindowScroll();

    expect(component.$isHeaderHidden()).toBe(false);
    nowSpy.mockRestore();
  });
});
