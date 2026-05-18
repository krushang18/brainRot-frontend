import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SignupForm from './SignupForm';

vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => {
      return <a href={href}>{children}</a>;
    },
  };
});

describe('SignupForm', () => {
  it('renders correctly', () => {
    render(<SignupForm />);
    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates empty fields on submit', async () => {
    render(<SignupForm />);
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/^password is required/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<SignupForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid@email');

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('validates password length and matching', async () => {
    render(<SignupForm />);
    const user = userEvent.setup();

    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, '12345');

    fireEvent.click(screen.getByTestId('submit-button'));
    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, '123456');
    await user.type(confirmPasswordInput, '1234567');

    fireEvent.click(screen.getByTestId('submit-button'));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits successfully with valid data', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    fireEvent.click(screen.getByTestId('submit-button'));

    // Check loading state
    expect(screen.getByTestId('submit-button')).toBeDisabled();

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith('Signup data:', expect.any(Object));
      },
      { timeout: 2000 }
    );

    consoleSpy.mockRestore();
  });
});
