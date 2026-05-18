import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './page';

// Mock the LoginForm component so we only test the page layout
vi.mock('@/components/login/LoginForm', () => ({
  default: () => <div data-testid="mock-login-form">Login Form</div>,
}));

describe('LoginPage', () => {
  it('renders the layout and the LoginForm', () => {
    render(<LoginPage />);

    // Check if the logo "BrainRot" is rendered
    expect(screen.getByText('BrainRot')).toBeInTheDocument();

    // Check if the mocked form is rendered
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
  });
});
