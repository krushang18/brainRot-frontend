import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from './LoginForm';

vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => {
      return <a href={href}>{children}</a>;
    },
  };
});

describe('LoginForm', () => {
  it('renders correctly', () => {
    render(<LoginForm />);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('validates empty fields on submit', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid@email');

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('submits successfully with valid data', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'password123');

    fireEvent.click(screen.getByTestId('submit-button'));

    // Check loading state
    expect(screen.getByTestId('submit-button')).toBeDisabled();

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith('Login data:', expect.any(Object));
      },
      { timeout: 2000 }
    );

    consoleSpy.mockRestore();
  });
});
