import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignupPage from './page';

// Mock the SignupForm component so we only test the page layout
vi.mock('@/components/signup/SignupForm', () => ({
  default: () => <div data-testid="mock-signup-form">Signup Form</div>,
}));

describe('SignupPage', () => {
  it('renders the layout and the SignupForm', () => {
    render(<SignupPage />);

    // Check if the logo "BrainRot" is rendered
    expect(screen.getByText('BrainRot')).toBeInTheDocument();

    // Check if the mocked form is rendered
    expect(screen.getByTestId('mock-signup-form')).toBeInTheDocument();
  });
});
