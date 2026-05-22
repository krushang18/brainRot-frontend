import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ForgotPasswordForm from './ForgotPasswordForm';
import { authService } from '@/services/authService';

vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => {
      return <a href={href}>{children}</a>;
    },
  };
});

vi.mock('@/services/authService', () => ({
  authService: {
    forgotPassword: vi.fn().mockResolvedValue({ message: 'Success' }),
  },
}));

describe('ForgotPasswordForm', () => {
  it('renders correctly', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByText(/back to log in/i)).toBeInTheDocument();
  });

  it('validates empty email on submit', async () => {
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('validates invalid email pattern', async () => {
    render(<ForgotPasswordForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid-email');

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('validates excessive email length (> 254 chars)', async () => {
    render(<ForgotPasswordForm />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    // Generate a long email with length > 254
    const longLocalPart = 'a'.repeat(245);
    const excessiveEmail = `${longLocalPart}@example.com`; // Length 257

    await user.type(emailInput, excessiveEmail);

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('submits successfully with valid email and shows loading and success screens', async () => {
    const user = userEvent.setup();

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    // Click submit and check active loading/spinner state
    fireEvent.click(screen.getByTestId('submit-button'));
    expect(screen.getByTestId('submit-button')).toBeDisabled();
    expect(screen.getAllByTestId('loading-spinner')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Sending...')[0]).toBeInTheDocument();

    // Wait for the mock submit timeout to finish and verify success screen shows up
    await waitFor(
      () => {
        expect(screen.queryAllByTestId('loading-spinner').length).toBe(0);
        expect(screen.getByTestId('success-alert')).toBeInTheDocument();
        expect(
          screen.getByText(/check your inbox! a reset link has been dispatched to/i)
        ).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Verify mock call
    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' });

    // Test clicking "Try Again" to go back to the form
    const tryAgainBtn = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainBtn).toBeInTheDocument();
    fireEvent.click(tryAgainBtn);

    // Form should be visible again
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.queryByTestId('success-alert')).not.toBeInTheDocument();
  });

  it('contains the back-link to /auth routing', () => {
    render(<ForgotPasswordForm />);
    const backLink = screen.getByText(/back to log in/i).closest('a');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/auth');
  });
});
