import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { ChessRoot } from '../app.component';
import { LichessAuthService } from '@services';
import { AcknowledgementsDialogComponent } from '../components/dialogs/acknowledgements-dialog/acknowledgements-dialog.component';
import { ContactDialogComponent } from '../components/dialogs/contact-dialog/contact-dialog.component';
import pkg from '../../../package.json';

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
});
