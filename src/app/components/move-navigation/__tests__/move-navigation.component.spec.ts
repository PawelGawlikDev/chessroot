import { TestBed } from '@angular/core/testing';
import { MoveNavigationComponent } from '../move-navigation.component';
import type { NavigatorPly } from '@model/opening-explorer.model';

describe('MoveNavigationComponent', () => {
  const mockPlys: NavigatorPly[] = [
    { fen: 'start', move: null },
    { fen: 'fen1', move: { from: 'e2', to: 'e4', san: 'e4' } },
    { fen: 'fen2', move: { from: 'e7', to: 'e5', san: 'e5' } },
    { fen: 'fen3', move: { from: 'g1', to: 'f3', san: 'Nf3' } },
  ];

  function createComponent(plys: NavigatorPly[], currentIndex: number) {
    const fixture = TestBed.createComponent(MoveNavigationComponent);
    fixture.componentRef.setInput('plys', plys);
    fixture.componentRef.setInput('currentIndex', currentIndex);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MoveNavigationComponent] });
  });

  it('should create', () => {
    const { component } = createComponent(mockPlys, 0);
    expect(component).toBeTruthy();
  });

  describe('computed signals', () => {
    it('should compute canGoForward correctly', () => {
      const { component } = createComponent(mockPlys, 0);
      expect(component.$canGoForward()).toBe(true);

      const { component: atEnd } = createComponent(mockPlys, 3);
      expect(atEnd.$canGoForward()).toBe(false);
    });

    it('should compute canGoBack correctly', () => {
      const { component } = createComponent(mockPlys, 0);
      expect(component.$canGoBack()).toBe(false);

      const { component: atEnd } = createComponent(mockPlys, 3);
      expect(atEnd.$canGoBack()).toBe(true);
    });

    it('should build PGN list from plys', () => {
      const { component } = createComponent(mockPlys, 0);
      const pgnList = component.$pgnList();
      expect(pgnList.length).toBe(2);
      expect(pgnList[0].moveNumber).toBe(1);
      expect(pgnList[0].whitePly).toBe('e4');
      expect(pgnList[0].blackPly).toBe('e5');
      expect(pgnList[1].moveNumber).toBe(2);
      expect(pgnList[1].whitePly).toBe('Nf3');
      expect(pgnList[1].blackPly).toBe('');
    });

    it('should handle incomplete pair (only white move)', () => {
      const plys: NavigatorPly[] = [
        { fen: 'start', move: null },
        { fen: 'fen1', move: { from: 'e2', to: 'e4', san: 'e4' } },
      ];
      const { component } = createComponent(plys, 0);
      const pgnList = component.$pgnList();
      expect(pgnList.length).toBe(1);
      expect(pgnList[0].whitePly).toBe('e4');
      expect(pgnList[0].blackPly).toBe('');
    });

    it('should filter out plys without move', () => {
      const plysWithMissing: NavigatorPly[] = [
        { fen: 'start', move: null },
        { fen: 'fen1', move: null },
        { fen: 'fen2', move: { from: 'e7', to: 'e5', san: 'e5' } },
      ];
      const { component } = createComponent(plysWithMissing, 0);
      const pgnList = component.$pgnList();
      expect(pgnList.length).toBe(0);
    });
  });

  describe('outputs', () => {
    it('should emit goForward', () => {
      const { component } = createComponent(mockPlys, 0);
      const spy = vi.fn();
      component.goForward.subscribe(spy);
      component.goForward.emit();
      expect(spy).toHaveBeenCalled();
    });

    it('should emit goBack', () => {
      const { component } = createComponent(mockPlys, 2);
      const spy = vi.fn();
      component.goBack.subscribe(spy);
      component.goBack.emit();
      expect(spy).toHaveBeenCalled();
    });

    it('should emit reset', () => {
      const { component } = createComponent(mockPlys, 2);
      const spy = vi.fn();
      component.reset.subscribe(spy);
      component.reset.emit();
      expect(spy).toHaveBeenCalled();
    });

    it('should emit navigate with index', () => {
      const { component } = createComponent(mockPlys, 0);
      let emittedIndex: number | undefined;
      component.navigate.subscribe((i) => (emittedIndex = i));
      component.navigate.emit(2);
      expect(emittedIndex).toBe(2);
    });
  });

  describe('activePlyIndex', () => {
    it('should return the move index unchanged', () => {
      const { component } = createComponent(mockPlys, 0);
      expect(component.activePlyIndex(0)).toBe(0);
      expect(component.activePlyIndex(3)).toBe(3);
    });
  });

  describe('template', () => {
    it('should render navigation buttons', () => {
      const { fixture } = createComponent(mockPlys, 1);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('.nav__btn').length).toBe(3);
    });

    it('should disable back button at start', () => {
      const { fixture } = createComponent(mockPlys, 0);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector<HTMLButtonElement>('.nav__btn')?.disabled).toBe(true);
    });

    it('should disable forward button at end', () => {
      const { fixture } = createComponent(mockPlys, 3);
      const el = fixture.nativeElement as HTMLElement;
      const buttons = el.querySelectorAll<HTMLButtonElement>('.nav__btn');
      expect(buttons[1].disabled).toBe(true);
    });

    it('should render move list items', () => {
      const { fixture } = createComponent(mockPlys, 1);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.moves-list__move-number')?.textContent).toContain('1.');
      expect(el.querySelector('.moves-list__ply')?.textContent).toContain('e4');
    });
  });
});
