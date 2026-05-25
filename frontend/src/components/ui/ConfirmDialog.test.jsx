import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ConfirmDialog from './ConfirmDialog.jsx';

describe('ConfirmDialog', () => {
  it('renders as an alert dialog and confirms explicit user action', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Hapus CV?"
        description="CV akan dihapus permanen."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        danger
        type="delete"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole('alertdialog', { name: 'Hapus CV?' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Hapus' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });
});

