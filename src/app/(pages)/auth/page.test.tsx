import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthPage from './page';

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

// Mock useSearchParams and useRouter
const mockReplace = vi.fn();
const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and defaults to Login page', () => {
    mockGet.mockReturnValue(null);
    render(<AuthPage />);

    expect(screen.getByText('BrainRot')).toBeInTheDocument();
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-signup-form')).not.toBeInTheDocument();
  });

  it('toggles successfully to Signup and updates URL parameter', () => {
    mockGet.mockReturnValue(null);
    render(<AuthPage />);

    fireEvent.click(screen.getByTestId('to-signup'));

    expect(screen.getByTestId('mock-signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-login-form')).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith('/auth?mode=signup');
  });

  it('initializes on Signup if query param mode is signup', () => {
    mockGet.mockReturnValue('signup');
    render(<AuthPage />);

    expect(screen.getByTestId('mock-signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-login-form')).not.toBeInTheDocument();
  });

  it('initializes on Login if query param mode is login', () => {
    mockGet.mockReturnValue('login');
    render(<AuthPage />);

    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-signup-form')).not.toBeInTheDocument();
  });
});
