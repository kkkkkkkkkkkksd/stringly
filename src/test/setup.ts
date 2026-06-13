import '@testing-library/jest-dom/vitest';

// jsdom не реализует ResizeObserver, а TanStack Virtual использует его для динамического
// измерения высоты строк (measureElement в Column Focus). Лёгкая заглушка для тестов.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (!('ResizeObserver' in globalThis)) {
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver =
    ResizeObserverStub;
}
