import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PasswordInput from './PasswordInput.jsx';

describe('PasswordInput', () => {
  it('toggles password visibility with an accessible button', () => {
    render(
      <PasswordInput
        id="password"
        value="secret"
        onChange={() => {}}
        autoComplete="current-password"
        placeholder="Password"
      />,
    );

    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Tampilkan password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Sembunyikan password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

