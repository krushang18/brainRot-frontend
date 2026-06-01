import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from './FilterBar';

describe('FilterBar Component', () => {
  it('renders correctly with default props', () => {
    const setQuery = vi.fn();
    const setTab = vi.fn();
    const setCats = vi.fn();
    const onNewNote = vi.fn();

    render(
      <FilterBar
        searchQuery=""
        setSearchQuery={setQuery}
        selectedTab="all"
        setSelectedTab={setTab}
        filterCategories={['all']}
        setFilterCategories={setCats}
        onNewNoteClick={onNewNote}
      />
    );

    expect(screen.getByPlaceholderText(/Search notes/i)).toBeInTheDocument();
    expect(screen.getByText('All Notes')).toBeInTheDocument();
    expect(screen.getByText(/Favorites/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ New Note/i })).toBeInTheDocument();
  });

  it('triggers search query callbacks on change', () => {
    const setQuery = vi.fn();
    const setTab = vi.fn();
    const setCats = vi.fn();
    const onNewNote = vi.fn();

    render(
      <FilterBar
        searchQuery=""
        setSearchQuery={setQuery}
        selectedTab="all"
        setSelectedTab={setTab}
        filterCategories={['all']}
        setFilterCategories={setCats}
        onNewNoteClick={onNewNote}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search notes/i);
    fireEvent.change(searchInput, { target: { value: 'coffee' } });
    expect(setQuery).toHaveBeenCalledWith('coffee');
  });

  it('triggers tab change when Favorites is clicked', () => {
    const setQuery = vi.fn();
    const setTab = vi.fn();
    const setCats = vi.fn();
    const onNewNote = vi.fn();

    render(
      <FilterBar
        searchQuery=""
        setSearchQuery={setQuery}
        selectedTab="all"
        setSelectedTab={setTab}
        filterCategories={['all']}
        setFilterCategories={setCats}
        onNewNoteClick={onNewNote}
      />
    );

    fireEvent.click(screen.getByText(/Favorites/i));
    expect(setTab).toHaveBeenCalledWith('favorites');
  });

  it('triggers folder category click behaviors correctly', () => {
    const setCats = vi.fn();

    // Case 1: Click a specific category when 'all' is active
    const { rerender } = render(
      <FilterBar
        searchQuery=""
        setSearchQuery={vi.fn()}
        selectedTab="all"
        setSelectedTab={vi.fn()}
        filterCategories={['all']}
        setFilterCategories={setCats}
        onNewNoteClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('genius'));
    expect(setCats).toHaveBeenCalled();
    const lastCall = setCats.mock.calls[0][0];
    const resolvedCats = typeof lastCall === 'function' ? lastCall(['all']) : lastCall;
    expect(resolvedCats).toEqual(['genius']);

    // Case 2: Click a specific category when that category is already active
    rerender(
      <FilterBar
        searchQuery=""
        setSearchQuery={vi.fn()}
        selectedTab="all"
        setSelectedTab={vi.fn()}
        filterCategories={['genius']}
        setFilterCategories={setCats}
        onNewNoteClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('genius'));
    const lastCall2 = setCats.mock.calls[1][0];
    const resolvedCats2 = typeof lastCall2 === 'function' ? lastCall2(['genius']) : lastCall2;
    expect(resolvedCats2).toEqual(['all']);

    // Case 3: Click a category when another category is active
    rerender(
      <FilterBar
        searchQuery=""
        setSearchQuery={vi.fn()}
        selectedTab="all"
        setSelectedTab={vi.fn()}
        filterCategories={['genius']}
        setFilterCategories={setCats}
        onNewNoteClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('yaps'));
    const lastCall3 = setCats.mock.calls[2][0];
    const resolvedCats3 = typeof lastCall3 === 'function' ? lastCall3(['genius']) : lastCall3;
    expect(resolvedCats3).toContain('yaps');
    expect(resolvedCats3).toContain('genius');

    // Case 4: Click 'All Notes' sidebar button or folder
    rerender(
      <FilterBar
        searchQuery=""
        setSearchQuery={vi.fn()}
        selectedTab="all"
        setSelectedTab={vi.fn()}
        filterCategories={['genius']}
        setFilterCategories={setCats}
        onNewNoteClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('All Notes'));
    const lastCall4 = setCats.mock.calls[3][0];
    const resolvedCats4 = typeof lastCall4 === 'function' ? lastCall4(['genius']) : lastCall4;
    expect(resolvedCats4).toEqual(['all']);
  });

  it('renders Clear Filters button only when categories or query are active', () => {
    const setCats = vi.fn();
    const setQuery = vi.fn();
    const setTab = vi.fn();

    const { rerender } = render(
      <FilterBar
        searchQuery=""
        setSearchQuery={setQuery}
        selectedTab="all"
        setSelectedTab={setTab}
        filterCategories={['all']}
        setFilterCategories={setCats}
        onNewNoteClick={vi.fn()}
      />
    );

    expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument();

    // Rerender with custom categories active
    rerender(
      <FilterBar
        searchQuery=""
        setSearchQuery={setQuery}
        selectedTab="all"
        setSelectedTab={setTab}
        filterCategories={['genius']}
        setFilterCategories={setCats}
        onNewNoteClick={vi.fn()}
      />
    );

    const clearBtn = screen.getByText(/clear filters/i);
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(setQuery).toHaveBeenCalledWith('');
    expect(setTab).toHaveBeenCalledWith('all');
    expect(setCats).toHaveBeenCalledWith(['all']);
  });
});
