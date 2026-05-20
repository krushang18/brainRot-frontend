import '@testing-library/jest-dom';

class ResizeObserverMock {
  observe() {
    return;
  }
  unobserve() {
    return;
  }
  disconnect() {
    return;
  }
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
