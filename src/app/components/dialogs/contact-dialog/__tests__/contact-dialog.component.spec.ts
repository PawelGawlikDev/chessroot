import { TestBed } from '@angular/core/testing';
import { ContactDialogComponent } from '../contact-dialog.component';

describe('ContactDialogComponent', () => {
  function createComponent() {
    const fixture = TestBed.createComponent(ContactDialogComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ContactDialogComponent] });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should have 4 contacts', () => {
    const { component } = createComponent();
    expect(component.contacts.length).toBe(4);
  });

  it('should display all contact platforms', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Lichess');
    expect(el.textContent).toContain('Chess.com');
    expect(el.textContent).toContain('Reddit');
    expect(el.textContent).toContain('GitHub');
  });

  it('should display contact usernames', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('pg_chess_training');
    expect(el.textContent).toContain('NullPointerGambit');
    expect(el.textContent).toContain('PawelGawlikDev');
  });

  it('should have correct GitHub URL', () => {
    const { component } = createComponent();
    const github = component.contacts.find((c) => c.platform === 'GitHub');
    expect(github?.url).toBe('https://github.com/PawelGawlikDev/chessroot');
  });

  it('should have correct Lichess URL', () => {
    const { component } = createComponent();
    const lichess = component.contacts.find((c) => c.platform === 'Lichess');
    expect(lichess?.url).toBe('https://lichess.org/@/pg_chess_training');
  });

  it('should have correct Chess.com URL', () => {
    const { component } = createComponent();
    const chesscom = component.contacts.find((c) => c.platform === 'Chess.com');
    expect(chesscom?.url).toBe('https://www.chess.com/member/pg_chess_training');
  });

  it('should have correct Reddit URL', () => {
    const { component } = createComponent();
    const reddit = component.contacts.find((c) => c.platform === 'Reddit');
    expect(reddit?.url).toBe('https://www.reddit.com/user/NullPointerGambit');
  });

  it('should render a close button', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Close');
  });

  it('should render contact links with target _blank', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('a[target="_blank"]');
    expect(links.length).toBe(4);
  });
});
