if (typeof ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    public observe() {}
    public unobserve() {}
    public disconnect() {}
  };
}
