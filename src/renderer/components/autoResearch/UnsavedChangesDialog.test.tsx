import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UnsavedChangesDialog from './UnsavedChangesDialog';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
  };
});

test('cancel and discard are distinct explicit actions', () => {
  const cancel = jest.fn();
  const discard = jest.fn();
  const save = jest.fn().mockResolvedValue(true);
  render(
    <UnsavedChangesDialog
      label="预设"
      onCancel={cancel}
      onDiscard={discard}
      onSave={save}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: '继续编辑' }));
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(discard).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '放弃修改' }));
  expect(discard).toHaveBeenCalledTimes(1);
});

test('failed saves retain the dialog and never discard the draft', async () => {
  const discard = jest.fn();
  render(
    <UnsavedChangesDialog
      label="详设"
      onCancel={jest.fn()}
      onDiscard={discard}
      onSave={async () => false}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: '保存后离开' }));
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain('未能完成保存'),
  );
  expect(discard).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: '继续编辑' })).toBeTruthy();
});
