import { act, fireEvent, renderHook } from '@testing-library/react';
import {
  MOTION_EXIT_MS,
  motionScrollBehavior,
  useAnimatedDismiss,
  useAppMotion,
  useReducedMotion,
} from './motion';

let reduced = false;
let preferenceListeners: Set<() => void>;

beforeEach(() => {
  jest.useFakeTimers();
  reduced = false;
  preferenceListeners = new Set();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  window.matchMedia = jest.fn().mockImplementation(() => ({
    get matches() { return reduced; },
    addEventListener: (_event: string, listener: () => void) => preferenceListeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => preferenceListeners.delete(listener),
  }));
  delete document.documentElement.dataset.umaInput;
  delete document.documentElement.dataset.umaBackground;
});

afterEach(() => {
  jest.useRealTimers();
});

test('tracks keyboard, pointer and background state across the app and cleans up', () => {
  const { unmount } = renderHook(useAppMotion);
  expect(motionScrollBehavior()).toBe('smooth');
  fireEvent.keyDown(window, { key: 'Tab' });
  expect(motionScrollBehavior()).toBe('auto');
  fireEvent.pointerDown(window);
  expect(motionScrollBehavior()).toBe('smooth');
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  fireEvent(document, new Event('visibilitychange'));
  expect(document.documentElement.dataset.umaBackground).toBe('true');
  expect(motionScrollBehavior()).toBe('auto');
  unmount();
  expect(document.documentElement.dataset.umaInput).toBeUndefined();
  expect(document.documentElement.dataset.umaBackground).toBeUndefined();
  fireEvent.keyDown(window, { key: 'Tab' });
  expect(document.documentElement.dataset.umaInput).toBeUndefined();
});

test('subscribes to live reduced-motion changes and removes the subscription', () => {
  const { result, unmount } = renderHook(useReducedMotion);
  expect(result.current).toBe(false);
  act(() => {
    reduced = true;
    preferenceListeners.forEach((listener) => listener());
  });
  expect(result.current).toBe(true);
  expect(motionScrollBehavior()).toBe('auto');
  unmount();
  expect(preferenceListeners.size).toBe(0);
});

test('coalesces repeated dismissal and calls the latest callback once after exit', () => {
  const first = jest.fn();
  const latest = jest.fn();
  const { result, rerender } = renderHook(({ close }) => useAnimatedDismiss(close), {
    initialProps: { close: first },
  });
  act(() => { result.current.dismiss(); result.current.dismiss(); });
  expect(result.current.closing).toBe(true);
  expect(first).not.toHaveBeenCalled();
  rerender({ close: latest });
  act(() => { jest.advanceTimersByTime(MOTION_EXIT_MS); });
  expect(first).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledTimes(1);
});

test('Escape completes an in-flight close immediately without a second callback', () => {
  const close = jest.fn();
  const { result } = renderHook(() => useAnimatedDismiss(close));
  act(() => { result.current.dismiss(); result.current.dismiss(true); });
  expect(close).toHaveBeenCalledTimes(1);
  act(() => { jest.runAllTimers(); });
  expect(close).toHaveBeenCalledTimes(1);
});

test.each(['reduced', 'keyboard', 'hidden'])('%s dismissal never waits for animation', (mode) => {
  reduced = mode === 'reduced';
  if (mode === 'keyboard') document.documentElement.dataset.umaInput = 'keyboard';
  if (mode === 'hidden') Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  const close = jest.fn();
  const { result } = renderHook(() => useAnimatedDismiss(close));
  act(() => { result.current.dismiss(); });
  expect(close).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

test('unmounting cancels a pending dismissal', () => {
  const close = jest.fn();
  const { result, unmount } = renderHook(() => useAnimatedDismiss(close));
  act(() => { result.current.dismiss(); });
  unmount();
  act(() => { jest.runAllTimers(); });
  expect(close).not.toHaveBeenCalled();
});
