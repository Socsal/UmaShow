import { act, renderHook } from '@testing-library/react';
import useFormDraft from './useFormDraft';

test('tracks edits, undo, save, and switching records without cross-record dirty state', () => {
  const { result, rerender } = renderHook(
    ({ scope, value }) => useFormDraft(scope, value),
    { initialProps: { scope: 'one', value: { count: 1, name: '预设' } } },
  );
  expect(result.current.dirty).toBe(false);
  rerender({ scope: 'one', value: { count: 2, name: '预设' } });
  expect(result.current.dirty).toBe(true);
  rerender({ scope: 'one', value: { count: 1, name: '预设' } });
  expect(result.current.dirty).toBe(false);
  rerender({ scope: 'one', value: { count: 3, name: '预设' } });
  act(() => result.current.markSaved());
  expect(result.current.dirty).toBe(false);
  rerender({ scope: 'two', value: { count: 9, name: '另一预设' } });
  expect(result.current.dirty).toBe(false);
});

test('saving an earlier snapshot does not mark edits made during the request as saved', () => {
  const { result, rerender } = renderHook(
    ({ value }) => useFormDraft('one', value),
    { initialProps: { value: [1, 2] } },
  );
  rerender({ value: [2, 1] });
  const saveSubmittedValues = result.current.markSaved;
  rerender({ value: [2, 1, 3] });
  act(saveSubmittedValues);
  expect(result.current.dirty).toBe(true);
  rerender({ value: [2, 1] });
  expect(result.current.dirty).toBe(false);
});

test('object key order is ignored but priority array order remains significant', () => {
  const { result, rerender } = renderHook(
    ({ value }) => useFormDraft('one', value),
    { initialProps: { value: { a: [1, 2], b: 3 } } },
  );
  rerender({ value: { b: 3, a: [1, 2] } });
  expect(result.current.dirty).toBe(false);
  rerender({ value: { a: [2, 1], b: 3 } });
  expect(result.current.dirty).toBe(true);
});
