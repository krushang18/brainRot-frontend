import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SocialAuthButtons from './SocialAuthButtons';

describe('SocialAuthButtons', () => {
  it('renders Google and GitHub links correctly', () => {
    render(<SocialAuthButtons />);
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument();

    const googleLink = screen.getByRole('link', { name: /google/i });
    expect(googleLink).toBeInTheDocument();
    expect(googleLink).toHaveAttribute('href', expect.stringContaining('/auth/google/login'));

    const githubLink = screen.getByRole('link', { name: /github/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', expect.stringContaining('/auth/github/login'));
  });
});
