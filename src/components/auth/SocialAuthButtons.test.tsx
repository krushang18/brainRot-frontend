import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SocialAuthButtons from './SocialAuthButtons';

describe('SocialAuthButtons', () => {
  it('renders Google and GitHub buttons correctly', () => {
    render(<SocialAuthButtons />);
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
  });
});
