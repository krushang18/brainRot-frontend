import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ResetPasswordForm from './ResetPasswordForm';

// Mock next/link to render an <a> tag
vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => {
      return <a href={href}>{children}</a>;
    },
  };
});

// Mock next/navigation's useSearchParams to return a mock token
const mockGetSearchParam = vi.fn().mockReturnValue('mock-reset-token-xyz');
vi.mock('next/navigation', () => {
  return {
    useSearchParams: () => {
      return {
        get: mockGetSearchParam,
      };
    },
  };
});

describe('ResetPasswordForm', () => {
  it('renders correctly', () => {
    render(<ResetPasswordForm />);
    expect(screen.getByRole('heading', { name: /choose new password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('validates empty password fields on submit', async () => {
    render(<ResetPasswordForm />);

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Confirm password is required')).toBeInTheDocument();
    });
  });

  it('validates password length (< 8 chars)', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/^confirm password$/i);

    await userEvent.type(passwordInput, 'abc1!');
    await userEvent.type(confirmInput, 'abc1!');

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('validates password must contain at least one number or special character', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/^confirm password$/i);

    await userEvent.type(passwordInput, 'abcdefgh');
    await userEvent.type(confirmInput, 'abcdefgh');

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Password must contain at least one number or special character')
      ).toBeInTheDocument();
    });
  });

  it('validates password and confirm password mismatch', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/^confirm password$/i);

    await userEvent.type(passwordInput, 'Password123!');
    await userEvent.type(confirmInput, 'Password456!');

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('submits successfully with valid data, displaying loading spinner and success banner', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/^confirm password$/i);

    await userEvent.type(passwordInput, 'Password123!');
    await userEvent.type(confirmInput, 'Password123!');

    // Check that the token input extracts the correct token value from the mocked search parameters
    const tokenInput = screen.getByTestId('token-input') as HTMLInputElement;
    expect(tokenInput.value).toBe('mock-reset-token-xyz');

    // Click submit and verify loading states
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(screen.getByRole('button', { name: /updating.../i })).toBeDisabled();
    expect(screen.getAllByTestId('loading-spinner')[0]).toBeInTheDocument();

    // Verify transition to success banner after mock dispatch completes
    await waitFor(
      () => {
        expect(screen.queryAllByTestId('loading-spinner').length).toBe(0);
        expect(screen.getByTestId('success-alert')).toBeInTheDocument();
        expect(
          screen.getByText(
            /password updated successfully! you can now log in with your new credentials/i
          )
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /go to log in/i })).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('contains the back-link to /auth portal', () => {
    render(<ResetPasswordForm />);
    const backLink = screen.getByRole('link', { name: /back to log in/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/auth');
  });
});
