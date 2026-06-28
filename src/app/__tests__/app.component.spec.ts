import { TestBed } from '@angular/core/testing';
import { ChessRoot } from '../app.component';
import { provideRouter } from '@angular/router';

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
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChessRoot],
      providers: [provideRouter([])],
    });
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ChessRoot);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
