import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthPage from './page';

// Mock next/navigation's useSearchParams
const mockGetSearchParam = vi.fn().mockReturnValue(null);
vi.mock('next/navigation', () => {
  return {
    useSearchParams: () => {
      return {
        get: mockGetSearchParam,
      };
    },
  };
});

// MockLoginForm and MockSignupForm to isolate tests
vi.mock('@/components/login/LoginForm', () => ({
  default: ({ onToggle }: { onToggle: () => void }) => (
    <div data-testid="mock-login-form">
      <span>Mock Login Form</span>
      <button onClick={onToggle} data-testid="to-signup">
        Switch to Sign up
      </button>
    </div>
  ),
}));

vi.mock('@/components/signup/SignupForm', () => ({
  default: ({ onToggle }: { onToggle: () => void }) => (
    <div data-testid="mock-signup-form">
      <span>Mock Signup Form</span>
      <button onClick={onToggle} data-testid="to-login">
        Switch to Log in
      </button>
    </div>
  ),
}));

describe('AuthPage', () => {
  beforeEach(() => {
    mockGetSearchParam.mockReturnValue(null);
  });

  it('renders correctly and defaults to Login page', () => {
    render(<AuthPage />);

    expect(screen.getAllByText('BrainRot')[0]).toBeInTheDocument();
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-signup-form')).not.toBeInTheDocument();
  });

  it('defaults to Signup page when tab query param is signup', () => {
    mockGetSearchParam.mockReturnValue('signup');
    render(<AuthPage />);

    expect(screen.getByTestId('mock-signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-login-form')).not.toBeInTheDocument();
  });

  it('toggles successfully to Signup', () => {
    render(<AuthPage />);

    fireEvent.click(screen.getByTestId('to-signup'));

    expect(screen.getByTestId('mock-signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-login-form')).not.toBeInTheDocument();
  });

  it('toggles back to Login', () => {
    render(<AuthPage />);

    // Toggle to signup
    fireEvent.click(screen.getByTestId('to-signup'));
    expect(screen.getByTestId('mock-signup-form')).toBeInTheDocument();

    // Toggle back to login
    fireEvent.click(screen.getByTestId('to-login'));
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
  });
});
