import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount between tests. Without this, every render stays in the document and
// `getBy*` queries start matching leftovers from earlier cases.
afterEach(cleanup);

// jsdom implements neither of these, and both are reached during a full-page
// render. Stubbing them here keeps the failure surface to real regressions.

// AnimatedBackground reads the reduced-motion preference before starting its
// loop. Report "no preference" so the component takes its normal path.
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// jsdom has no canvas backend and logs a "Not implemented" error on every call.
// Returning null is what the real guard in AnimatedBackground already handles.
HTMLCanvasElement.prototype.getContext = (() => null) as HTMLCanvasElement['getContext'];
