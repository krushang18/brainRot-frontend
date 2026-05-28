import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './page';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useAuth
const mockLogout = vi.fn();
const mockUseAuth = vi.fn().mockReturnValue({
  user: { name: 'Aarya', fullName: 'Aarya Patel', email: 'aarya@example.com' },
  isAuthenticated: true,
  isLoading: false,
  logout: mockLogout,
});
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Home Page (Notes Dashboard)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state when auth is loading', () => {
    mockUseAuth.mockReturnValueOnce({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      logout: mockLogout,
    });

    render(<Home />);
    expect(screen.getByText(/Loading sketchbook.../i)).toBeInTheDocument();
  });

  it('renders unauthenticated state and handles login/signup navigation', () => {
    mockUseAuth.mockReturnValueOnce({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: mockLogout,
    });

    render(<Home />);
    expect(screen.getByText('BrainRot Notes')).toBeInTheDocument();

    // Click Log In button
    const loginBtn = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(loginBtn);
    expect(mockPush).toHaveBeenCalledWith('/auth');

    // Click Sign Up button
    const signupBtn = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signupBtn);
    expect(mockPush).toHaveBeenCalledWith('/auth?tab=signup');
  });

  it('renders dashboard with default starter notes', () => {
    render(<Home />);

    // Check header
    expect(screen.getAllByText('BrainRot')[0]).toBeInTheDocument();

    // Check avatar exists
    expect(screen.getByLabelText('Avatar')).toBeInTheDocument();

    // Check search input exists
    expect(screen.getByPlaceholderText(/Search notes/i)).toBeInTheDocument();

    // Check some starter notes are rendered
    expect(screen.getByText('Project Ideas for 2024')).toBeInTheDocument();
    expect(screen.getByText('Cafe Sketches')).toBeInTheDocument();

    // Verify image renders for Cafe Sketches (covers dynamic imageUrl rendering branches)
    const imageEl = screen.getByAltText('Cafe Sketches');
    expect(imageEl).toBeInTheDocument();
  });

  it('filters notes by search query', () => {
    render(<Home />);

    const searchInput = screen.getByPlaceholderText(/Search notes/i);
    fireEvent.change(searchInput, { target: { value: 'Project' } });

    expect(screen.getByText('Project Ideas for 2024')).toBeInTheDocument();
    expect(screen.queryByText('Grocery List?')).not.toBeInTheDocument();
  });

  it('filters notes by folder toggles', () => {
    render(<Home />);

    // Click "serious" folder button in the navigation sidebar
    const seriousBtn = screen.getByRole('button', { name: 'serious' });
    fireEvent.click(seriousBtn);

    // Only notes of serious category should be shown, others filtered
    expect(screen.getByText('Deep Thoughts on Minimalism')).toBeInTheDocument();
    expect(screen.queryByText('Project Ideas for 2024')).not.toBeInTheDocument();

    // Clear filters button should be visible now
    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    expect(clearBtn).toBeInTheDocument();

    // Click All Notes button (covers selectedTab/filterCategories reset lines 420-421)
    const allNotesBtn = screen.getByRole('button', { name: /All Notes/i });
    fireEvent.click(allNotesBtn);
    expect(screen.getByText('Project Ideas for 2024')).toBeInTheDocument();

    // Filter again to test clear filters button click
    fireEvent.click(seriousBtn);
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByText('Project Ideas for 2024')).toBeInTheDocument();
  });

  it('toggles a note as favorite', () => {
    render(<Home />);

    // Find the favorite button on a non-favorite note (Cafe Sketches has Favorite title)
    const favoriteButton = screen.getAllByTitle('Favorite')[0];
    fireEvent.click(favoriteButton);

    // Click Favorites filter folder button
    const favoritesFolderBtn = screen.getByRole('button', { name: /favorites/i });
    fireEvent.click(favoritesFolderBtn);

    // Should show the favorited note
    expect(screen.getByText('Cafe Sketches')).toBeInTheDocument();
  });

  it('deletes a note', () => {
    render(<Home />);

    const initialNoteCount = screen.getAllByText('Delete').length;

    // Find the delete button on the first note card
    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    const newNoteCount = screen.getAllByText('Delete').length;
    expect(newNoteCount).toBe(initialNoteCount - 1);
  });

  it('opens new note modal and creates a note successfully', () => {
    render(<Home />);

    // Click "+ New Note" button to open modal
    const openModalBtn = screen.getByRole('button', { name: /\+ New Note/i });
    fireEvent.click(openModalBtn);

    // Modal forms fields should exist
    const titleInput = screen.getByLabelText(/title/i);
    const tagsInput = screen.getByLabelText(/tags/i);
    const contentInput = screen.getByLabelText(/scribble content/i);

    fireEvent.change(titleInput, { target: { value: 'New Test Note' } });
    fireEvent.change(tagsInput, { target: { value: 'test, coverage' } });
    fireEvent.change(contentInput, { target: { value: 'This is the note content body' } });

    // Select category button inside form (e.g. serious)
    const seriousFormBtns = screen.getAllByRole('button', { name: 'serious' });
    // Click the second serious button (the first is in the sidebar category filter, the second is in the modal form)
    fireEvent.click(seriousFormBtns[1]);

    // Click submit/create button
    const submitBtn = screen.getByRole('button', { name: /pin note/i });
    fireEvent.click(submitBtn);

    // Modal should close and the new note should be visible
    expect(screen.getByText('New Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is the note content body')).toBeInTheDocument();
  });

  it('displays form error if title or content is empty', () => {
    render(<Home />);

    // Open modal
    const openModalBtn = screen.getByRole('button', { name: /\+ New Note/i });
    fireEvent.click(openModalBtn);

    // Click submit/create button directly (covers empty title validation)
    const submitBtn = screen.getByRole('button', { name: /pin note/i });
    fireEvent.click(submitBtn);

    // Error alert should display
    expect(screen.getByText(/Title is required!/i)).toBeInTheDocument();

    // Fill title but leave content empty (covers empty content validation line 157)
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Content cannot be empty!/i)).toBeInTheDocument();
  });

  it('handles note modal cancellation and image URL input', () => {
    render(<Home />);

    // Test cancellation via "Cancel" button
    const openModalBtn1 = screen.getByRole('button', { name: /\+ New Note/i });
    fireEvent.click(openModalBtn1);
    const imageInput = screen.getByLabelText(/image url/i);
    fireEvent.change(imageInput, { target: { value: 'https://example.com/test.png' } });
    expect(imageInput).toHaveValue('https://example.com/test.png');
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();

    // Test cancellation via close note modal X button (covers lines 661-663)
    fireEvent.click(screen.getByRole('button', { name: /\+ New Note/i }));
    const closeXBtn = screen.getByRole('button', { name: /Close note modal/i });
    fireEvent.click(closeXBtn);
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();

    // Test cancellation via backdrop click (covers lines 647-648)
    fireEvent.click(screen.getByRole('button', { name: /\+ New Note/i }));
    const backdropBtn = screen.getByLabelText('Close modal');
    fireEvent.click(backdropBtn);
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });

  it('navigates to settings on avatar click and handles logout click', async () => {
    render(<Home />);

    // Click Avatar to navigate to settings (covers line 363)
    const avatarBtn = screen.getByLabelText('Avatar');
    fireEvent.click(avatarBtn);
    expect(mockPush).toHaveBeenCalledWith('/settings');

    // Click Logout button (covers lines 210-211)
    const logoutBtn = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
  });
});
