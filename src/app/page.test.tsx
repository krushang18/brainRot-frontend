import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './page';
import { Note } from '@/types/note';

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

const defaultNotesList: Note[] = [
  {
    id: '1',
    title: 'Project Ideas for 2024',
    category: 'genius',
    content:
      "1. AI that writes bad poetry.\n2. Digital garden for plants that don't exist.\n3. A clock that only counts weekend minutes.",
    created_at: '2023-10-24T12:00:00Z',
    tags: ['future', 'creative'],
    is_favorite: true,
  },
  {
    id: '2',
    title: 'Cafe Sketches',
    category: 'yaps',
    content: 'The barista looked like a wizard today. Note: try more cross-hatching.',
    created_at: '2023-10-22T12:00:00Z',
    images: [{ url: '/cafe_sketches.png', caption: 'Wizard' }],
    is_favorite: false,
  },
  {
    id: '3',
    title: 'Grocery List?',
    category: 'high-rot',
    content: '~~apples~~\nInk for the printer (CRITICAL)\nThose weird crackers I liked.',
    created_at: '2023-10-20T12:00:00Z',
    is_favorite: false,
  },
  {
    id: '4',
    title: 'Deep Thoughts on Minimalism',
    category: 'serious',
    content:
      "Minimalism isn't about having nothing. It's about making space for the things that actually matter. Like this notebook. It feels like real paper, but I can't spill coffee on it (physically). Digital permanence vs Analog feel.",
    created_at: '2023-10-15T12:00:00Z',
    is_favorite: false,
  },
  {
    id: '5',
    title: 'Call Mom',
    category: 'reminder',
    content:
      "She wanted to hear about the new job. Don't forget to mention the coffee machine is free.",
    created_at: '2023-10-10T12:00:00Z',
    is_favorite: true,
  },
];

let currentNotes: Note[] = [];

vi.mock('@/services/notesService', () => ({
  notesService: {
    listNotes: vi.fn().mockImplementation(async (params) => {
      let filtered = [...currentNotes];
      if (params?.category) {
        filtered = filtered.filter((n) => n.category === params.category);
      }
      if (params?.is_favorite) {
        filtered = filtered.filter((n) => n.is_favorite);
      }
      return { notes: filtered };
    }),
    searchNotes: vi.fn().mockImplementation(async (params) => {
      let filtered = [...currentNotes];
      if (params?.q) {
        filtered = filtered.filter(
          (n) =>
            n.title.toLowerCase().includes(params.q.toLowerCase()) ||
            n.content.toLowerCase().includes(params.q.toLowerCase())
        );
      }
      if (params?.category) {
        filtered = filtered.filter((n) => n.category === params.category);
      }
      if (params?.is_favorite) {
        filtered = filtered.filter((n) => n.is_favorite);
      }
      return { notes: filtered };
    }),
    createNote: vi.fn().mockImplementation(async (data) => {
      const newNote = {
        id: 'new-note-id',
        title: data.title,
        category: data.category,
        content: data.content,
        tags: data.tags || [],
        created_at: new Date().toISOString(),
        is_favorite: false,
        images: [],
      };
      currentNotes.unshift(newNote);
      return newNote;
    }),
    deleteNote: vi.fn().mockImplementation(async (id) => {
      currentNotes = currentNotes.filter((n) => n.id !== id);
      return { success: true };
    }),
    updateNote: vi.fn().mockImplementation(async (id, data) => {
      const idx = currentNotes.findIndex((n) => n.id === id);
      if (idx !== -1) {
        currentNotes[idx] = {
          ...currentNotes[idx],
          ...data,
        };
        return currentNotes[idx];
      }
      return currentNotes[0];
    }),
  },
}));

describe('Home Page (Notes Dashboard)', () => {
  beforeEach(() => {
    currentNotes = JSON.parse(JSON.stringify(defaultNotesList));
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

  it('renders dashboard with default starter notes', async () => {
    render(<Home />);

    // Check header
    expect(screen.getAllByText('BrainRot')[0]).toBeInTheDocument();

    // Check avatar exists
    expect(screen.getByLabelText('Avatar')).toBeInTheDocument();

    // Check search input exists
    expect(screen.getByPlaceholderText(/Search notes/i)).toBeInTheDocument();

    // Check some starter notes are rendered
    expect(await screen.findByText('Project Ideas for 2024')).toBeInTheDocument();
    expect(await screen.findByText('Cafe Sketches')).toBeInTheDocument();

    // Verify image count indicator renders for Cafe Sketches, but no image is shown on dashboard
    const badge = screen.getByTestId('image-count-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('1');
  });

  it('filters notes by search query', async () => {
    render(<Home />);

    // Wait for initial notes to load
    await screen.findByText('Project Ideas for 2024');

    const searchInput = screen.getByPlaceholderText(/Search notes/i);
    fireEvent.change(searchInput, { target: { value: 'Project' } });

    await waitFor(
      () => {
        expect(screen.getByText('Project Ideas for 2024')).toBeInTheDocument();
        expect(screen.queryByText('Grocery List?')).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('filters notes by folder toggles', async () => {
    render(<Home />);

    // Wait for initial notes
    await screen.findByText('Project Ideas for 2024');

    // Click "serious" folder button in the navigation sidebar
    const seriousBtn = screen.getByRole('button', { name: 'serious' });
    fireEvent.click(seriousBtn);

    // Only notes of serious category should be shown, others filtered
    expect(await screen.findByText('Deep Thoughts on Minimalism')).toBeInTheDocument();
    expect(screen.queryByText('Project Ideas for 2024')).not.toBeInTheDocument();

    // Clear filters button should be visible now
    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    expect(clearBtn).toBeInTheDocument();

    // Click All Notes button
    const allNotesBtn = screen.getByRole('button', { name: /All Notes/i });
    fireEvent.click(allNotesBtn);
    expect(await screen.findByText('Project Ideas for 2024')).toBeInTheDocument();

    // Filter again to test clear filters button click
    fireEvent.click(seriousBtn);
    fireEvent.click(await screen.findByRole('button', { name: /clear filters/i }));
    expect(await screen.findByText('Project Ideas for 2024')).toBeInTheDocument();
  });

  it('toggles a note as favorite', async () => {
    render(<Home />);

    await screen.findByText('Cafe Sketches');

    // Find the favorite button on a non-favorite note (Cafe Sketches has Favorite title)
    const favoriteButton = screen.getAllByTitle('Favorite')[0];
    fireEvent.click(favoriteButton);

    // Click Favorites filter folder button
    const favoritesFolderBtn = screen.getByRole('button', { name: /favorites/i });
    fireEvent.click(favoritesFolderBtn);

    // Should show the favorited note
    expect(await screen.findByText('Cafe Sketches')).toBeInTheDocument();
  });

  it('deletes a note', async () => {
    render(<Home />);

    // Verify the note exists initially
    await screen.findByText('Project Ideas for 2024');

    // Click on the note card to open the Detail Modal
    const noteCard = screen.getByText('Project Ideas for 2024');
    fireEvent.click(noteCard);

    // Find and click the delete button in the detail modal
    const deleteButton = screen.getByTitle('Delete Note');
    fireEvent.click(deleteButton);

    // Click confirmation Yes, Delete!
    const confirmBtn = screen.getByText('Yes, Delete!');
    fireEvent.click(confirmBtn);

    // Verify the note is deleted and no longer visible on the dashboard
    await waitFor(() => {
      expect(screen.queryByText('Project Ideas for 2024')).not.toBeInTheDocument();
    });
  });

  it('opens new note modal and creates a note successfully', async () => {
    render(<Home />);

    await screen.findByText('Project Ideas for 2024');

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
    fireEvent.click(seriousFormBtns[1]);

    // Click submit/create button
    const submitBtn = screen.getByRole('button', { name: /pin note/i });
    fireEvent.click(submitBtn);

    // Modal should close and the new note should be visible
    expect(await screen.findByText('New Test Note')).toBeInTheDocument();
    expect(await screen.findByText('This is the note content body')).toBeInTheDocument();
  });

  it('displays form error if title or content is empty', async () => {
    render(<Home />);

    await screen.findByText('Project Ideas for 2024');

    // Open modal
    const openModalBtn = screen.getByRole('button', { name: /\+ New Note/i });
    fireEvent.click(openModalBtn);

    // Click submit/create button directly (covers empty title validation)
    const submitBtn = screen.getByRole('button', { name: /pin note/i });
    fireEvent.click(submitBtn);

    // Error alert should display
    expect(await screen.findByText(/Title is required!/i)).toBeInTheDocument();

    // Fill title but leave content empty
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    fireEvent.click(submitBtn);
    expect(await screen.findByText(/Content cannot be empty!/i)).toBeInTheDocument();
  });

  it('handles note modal cancellation and image URL input', async () => {
    render(<Home />);

    await screen.findByText('Project Ideas for 2024');

    // Test cancellation via "Cancel" button
    const openModalBtn1 = screen.getByRole('button', { name: /\+ New Note/i });
    fireEvent.click(openModalBtn1);
    const imageInput = screen.getByLabelText(/image url/i);
    fireEvent.change(imageInput, { target: { value: 'https://example.com/test.png' } });
    expect(imageInput).toHaveValue('https://example.com/test.png');
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });

  it('navigates to settings on avatar click, logo click, and handles logout click', async () => {
    render(<Home />);

    await screen.findByText('Project Ideas for 2024');

    // Click Avatar to navigate to settings
    const avatarBtn = screen.getByLabelText('Avatar');
    fireEvent.click(avatarBtn);
    expect(mockPush).toHaveBeenCalledWith('/settings');

    // Click authenticated Logo to navigate to / and reset search/filters
    const logoBtn = screen.getAllByText('BrainRot')[0];
    fireEvent.click(logoBtn);
    expect(mockPush).toHaveBeenCalledWith('/');

    // Click Logout button
    const logoutBtn = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
  });
});
