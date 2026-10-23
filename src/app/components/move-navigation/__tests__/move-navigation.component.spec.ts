import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';

import type { NavigatorNode, NavigatorPly } from '@model/opening-explorer.model';

import { MoveNavigationComponent } from '../move-navigation.component';

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
    const tree: NavigatorNode[] = [
      { ...mockPlys[0], id: 0, parentId: null, ply: 0 },
      { ...mockPlys[1], id: 1, parentId: 0, ply: 1 },
      { ...mockPlys[2], id: 2, parentId: 1, ply: 2 },
      { ...mockPlys[3], id: 3, parentId: 2, ply: 3 },
      { fen: 'c5', move: { from: 'c7', to: 'c5', san: 'c5' }, id: 4, parentId: 1, ply: 2 },
      { fen: 'nc3', move: { from: 'b1', to: 'c3', san: 'Nc3' }, id: 5, parentId: 4, ply: 3 },
      { fen: 'd6', move: { from: 'd7', to: 'd6', san: 'd6' }, id: 6, parentId: 5, ply: 4 },
      { fen: 'e6', move: { from: 'e7', to: 'e6', san: 'e6' }, id: 7, parentId: 5, ply: 4 },
    ];

    it('should navigate variations with native buttons and mark the active move', () => {
      const { fixture, component } = createComponent(mockPlys, 2);
      fixture.componentRef.setInput('nodes', tree);
      fixture.componentRef.setInput('activeNodeId', 4);
      fixture.detectChanges();
      const spy = vi.fn();
      component.navigateNode.subscribe(spy);
      const active = fixture.nativeElement.querySelector(
        '[aria-current="step"]',
      ) as HTMLButtonElement;
      expect(active.textContent).toContain('c5');
      active.click();
      expect(spy).toHaveBeenCalledWith(4);
    });

    it('should collapse nested lines and reveal the active branch automatically', () => {
      const { fixture, component } = createComponent(mockPlys, 1);
      fixture.componentRef.setInput('nodes', tree);
      component.toggleLine(4);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('e6');
      fixture.componentRef.setInput('activeNodeId', 7);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[aria-current="step"]').textContent).toContain(
        'e6',
      );
      expect(component.isFolded(4)).toBe(false);
    });

    it('should render continuation previews and emit the chosen index', () => {
      const { fixture, component } = createComponent(mockPlys, 1);
      fixture.componentRef.setInput('nodes', tree);
      fixture.componentRef.setInput('continuations', [tree[2], tree[4]]);
      fixture.componentRef.setInput('pickerOpen', true);
      fixture.componentRef.setInput('selectedContinuation', 1);
      fixture.detectChanges();
      const spy = vi.fn();
      component.chooseContinuation.subscribe(spy);
      const choice = fixture.nativeElement.querySelector(
        '[aria-pressed="true"]',
      ) as HTMLButtonElement;
      expect(choice.textContent).toContain('Nc3 d6');
      choice.click();
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('offers Material menu actions and deletes the targeted move immediately', async () => {
      const { fixture, component } = createComponent(mockPlys, 2);
      fixture.componentRef.setInput('nodes', tree);
      fixture.componentRef.setInput('activeNodeId', 5);
      fixture.detectChanges();
      const promote = vi.fn();
      const remove = vi.fn();
      component.promoteNode.subscribe(promote);
      component.removeNode.subscribe(remove);
      const overlay = TestBed.inject(OverlayContainer).getContainerElement();
      expect(fixture.nativeElement.textContent).not.toContain('Selected:');
      expect(fixture.nativeElement.textContent).not.toContain('Move actions');
      const move = fixture.nativeElement.querySelector(
        '[aria-label="1... c5"]',
      ) as HTMLButtonElement;
      move.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, button: 2 }));
      fixture.detectChanges();
      await fixture.whenStable();
      (overlay.querySelector('[role="menuitem"]') as HTMLButtonElement).click();
      expect(promote).toHaveBeenCalledWith(4);
      fixture.detectChanges();
      await fixture.whenStable();
      move.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, button: 2 }));
      fixture.detectChanges();
      await fixture.whenStable();
      (overlay.querySelectorAll('[role="menuitem"]')[1] as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(remove).toHaveBeenCalledWith(4);
      expect(remove).toHaveBeenCalledTimes(1);
      expect(fixture.nativeElement.textContent).not.toContain('Confirm delete');
    });

    it('identifies main-line moves independently of the current selection', () => {
      const { fixture, component } = createComponent(mockPlys, 2);
      fixture.componentRef.setInput('nodes', tree);
      fixture.componentRef.setInput('activeNodeId', 4);
      fixture.detectChanges();
      fixture.componentRef.setInput('activeNodeId', 2);
      fixture.detectChanges();
      expect(component.$mainLineIds().has(2)).toBe(true);
      expect(component.$mainLineIds().has(4)).toBe(false);
    });

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
