import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import '@analogjs/vitest-angular/setup-serializers';

if (typeof ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    public observe() {}
    public unobserve() {}
    public disconnect() {}
  };
}
