import { TestBed } from '@angular/core/testing';
import { AcknowledgementsDialogComponent } from '../acknowledgements-dialog.component';

describe('AcknowledgementsDialogComponent', () => {
  function createComponent() {
    const fixture = TestBed.createComponent(AcknowledgementsDialogComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AcknowledgementsDialogComponent] });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should have 9 acknowledgements', () => {
    const { component } = createComponent();
    expect(component.acknowledgements.length).toBe(9);
  });

  it('should display all acknowledgement names', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Lichess API');
    expect(el.textContent).toContain('Chess.com API');
    expect(el.textContent).toContain('chess.js');
    expect(el.textContent).toContain('Chessground');
    expect(el.textContent).toContain('ngx-chessground');
    expect(el.textContent).toContain('chessops');
    expect(el.textContent).toContain('PGN Parser');
    expect(el.textContent).toContain('Opening Tree');
    expect(el.textContent).toContain('Rosen Score');
  });

  it('should include Lichess API URL', () => {
    const { component } = createComponent();
    const item = component.acknowledgements.find((a) => a.name === 'Lichess API');
    expect(item?.url).toBe('https://lichess.org/api');
  });

  it('should include chess.js URL', () => {
    const { component } = createComponent();
    const item = component.acknowledgements.find((a) => a.name === 'chess.js');
    expect(item?.url).toBe('https://github.com/jhlywa/chess.js');
  });

  it('should render a close button', () => {
    const { fixture } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Close');
  });

  it('should render links with target _blank', () => {
    const { fixture, component } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('a[target="_blank"]');
    expect(links.length).toBe(component.acknowledgements.length);
  });

  it('should render links with rel noopener noreferrer', () => {
    const { fixture, component } = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('a[rel="noopener noreferrer"]');
    expect(links.length).toBe(component.acknowledgements.length);
  });
});
