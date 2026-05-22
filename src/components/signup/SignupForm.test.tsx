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

const mockSignup = vi.fn().mockResolvedValue(undefined);
const mockPush = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signup: mockSignup,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SignupForm', () => {
  it('renders correctly', () => {
    render(<SignupForm />);
    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
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
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!Mismatch');

    fireEvent.click(screen.getByTestId('submit-button'));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits successfully with valid data', async () => {
    const user = userEvent.setup();

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

    fireEvent.click(screen.getByTestId('submit-button'));

    // Check loading state
    expect(screen.getByTestId('submit-button')).toBeDisabled();

    await waitFor(
      () => {
        expect(mockSignup).toHaveBeenCalledWith(
          'John Doe',
          'john@example.com',
          'Password123!',
          'Password123!'
        );
        expect(mockPush).toHaveBeenCalledWith('/settings');
      },
      { timeout: 2000 }
    );
  });
});
