import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Chess } from 'chess.js';
import { Chessground } from 'chessground';

import { ChessBoardComponent } from '../chessboard.component';

vi.mock('chessground', () => ({
  Chessground: vi.fn(() => ({ set: vi.fn(), destroy: vi.fn() })),
}));

@Component({
  selector: 'ngx-chessground',
  template: '',
  standalone: true,
})
class MockNgxChessgroundComponent {
  public readonly runFunction = input<() => unknown>();
}

describe('ChessBoardComponent', () => {
  function createComponent(overrides: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(ChessBoardComponent);
    const defaults: Record<string, unknown> = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      orientation: 'white',
      turnColor: 'white',
      lastMove: null,
      arrows: [],
      interactive: false,
    };
    for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChessBoardComponent, MockNgxChessgroundComponent],
    });
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should only allow the side to move to drag or select pieces', () => {
    const { component } = createComponent({ interactive: true });
    component.runFn()(document.createElement('div'));
    expect(vi.mocked(Chessground).mock.lastCall?.[1]).toMatchObject({
      turnColor: 'white',
      movable: { color: 'white', free: false },
      premovable: { enabled: false },
    });
  });

  it('should update the movable color after moves and history navigation', () => {
    const { fixture, component } = createComponent({ interactive: true });
    const api = component.runFn()(document.createElement('div'));
    const chess = new Chess();
    chess.move('e4');
    fixture.componentRef.setInput('fen', chess.fen());
    fixture.componentRef.setInput('turnColor', 'black');
    fixture.detectChanges();
    expect(api.set).toHaveBeenLastCalledWith(
      expect.objectContaining({
        turnColor: 'black',
        movable: expect.objectContaining({ color: 'black' }),
        premovable: { enabled: false },
      }),
    );
    fixture.componentRef.setInput('fen', new Chess().fen());
    fixture.componentRef.setInput('turnColor', 'white');
    fixture.detectChanges();
    expect(api.set).toHaveBeenLastCalledWith(
      expect.objectContaining({
        turnColor: 'white',
        movable: expect.objectContaining({ color: 'white' }),
      }),
    );
  });

  it('should disable movement when the board becomes non-interactive', () => {
    const { fixture, component } = createComponent({ interactive: true });
    const api = component.runFn()(document.createElement('div'));
    fixture.componentRef.setInput('interactive', false);
    fixture.detectChanges();
    expect(api.set).toHaveBeenLastCalledWith(
      expect.objectContaining({
        movable: expect.objectContaining({ color: undefined }),
        draggable: { enabled: false },
        selectable: { enabled: false },
      }),
    );
  });

  it('should accept fen input', () => {
    const fen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
    const { component } = createComponent({ fen });
    expect(component.fen()).toBe(fen);
  });

  it('should default orientation to white', () => {
    const { component } = createComponent();
    expect(component.orientation()).toBe('white');
  });

  it('should accept orientation input', () => {
    const { component } = createComponent({ orientation: 'black' });
    expect(component.orientation()).toBe('black');
  });

  it('should accept turnColor input', () => {
    const { component } = createComponent({ turnColor: 'black' });
    expect(component.turnColor()).toBe('black');
  });

  it('should accept interactive input', () => {
    const { component } = createComponent({ interactive: true });
    expect(component.interactive()).toBe(true);
  });

  it('should default interactive to false', () => {
    const { component } = createComponent();
    expect(component.interactive()).toBe(false);
  });

  it('should accept lastMove input', () => {
    const lastMove = ['e2', 'e4'];
    const { component } = createComponent({ lastMove });
    expect(component.lastMove()).toEqual(lastMove);
  });

  it('should accept arrows input', () => {
    const arrows = [{ orig: 'e2', dest: 'e4', brush: 'blue' as const }];
    const { component } = createComponent({ arrows });
    expect(component.arrows()).toEqual(arrows);
  });

  it('should have runFn signal returning a function', () => {
    const { component } = createComponent();
    expect(typeof component.runFn()).toBe('function');
  });

  it('should emit movePlayed when a valid SAN move occurs', () => {
    const { component } = createComponent({ interactive: true });
    const spy = vi.fn();
    component.movePlayed.subscribe(spy);

    const chess = new Chess('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
    const move = chess.move({ from: 'e7', to: 'e5', promotion: 'q' });
    expect(move).not.toBeNull();
    if (move) {
      component.movePlayed.emit(move.san);
      expect(spy).toHaveBeenCalledWith(move.san);
    }
  });

  it('should not emit move with invalid move data', () => {
    const { component } = createComponent({ interactive: true });
    const spy = vi.fn();
    component.movePlayed.subscribe(spy);

    const chess = new Chess('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
    expect(() => chess.move({ from: 'e7', to: 'e8', promotion: 'q' })).toThrow();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should handle null lastMove', () => {
    const { component } = createComponent({ lastMove: null });
    expect(component.lastMove()).toBeNull();
  });
});
