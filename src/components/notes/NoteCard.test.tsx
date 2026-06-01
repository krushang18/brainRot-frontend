import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NoteCard } from './NoteCard';
import { Note } from '@/types/note';

describe('NoteCard Component', () => {
  const defaultNote: Note = {
    id: 'test-note-1',
    title: 'Minimalism and simplicity',
    category: 'serious',
    content: 'This is some text about minimalism.',
    createdAt: 'Jan 1, 2026',
    isFavorite: false,
  };

  it('renders standard card correctly', () => {
    const onClick = vi.fn();
    const onFav = vi.fn();
    render(
      <NoteCard
        note={defaultNote}
        index={0}
        onClick={onClick}
        onToggleFavorite={onFav}
        getFormattedDate={() => 'Jan 1, 2026'}
      />
    );

    expect(screen.getByText('Minimalism and simplicity')).toBeInTheDocument();
    expect(screen.getByText('This is some text about minimalism.')).toBeInTheDocument();
    expect(screen.getByText('Jan 1, 2026')).toBeInTheDocument();
  });

  it('handles click and favorite click events', () => {
    const onClick = vi.fn();
    const onFav = vi.fn();
    render(
      <NoteCard
        note={defaultNote}
        index={0}
        onClick={onClick}
        onToggleFavorite={onFav}
        getFormattedDate={() => 'Jan 1, 2026'}
      />
    );

    fireEvent.click(screen.getByText('Minimalism and simplicity'));
    expect(onClick).toHaveBeenCalled();

    const favBtn = screen.getByTitle('Favorite');
    fireEvent.click(favBtn);
    expect(onFav).toHaveBeenCalledWith('test-note-1');
  });

  it('handles strikethrough tags in content', () => {
    const strikethroughNote: Note = {
      ...defaultNote,
      content: '~~Done item~~\nActive item',
    };

    render(
      <NoteCard
        note={strikethroughNote}
        index={0}
        onClick={vi.fn()}
        onToggleFavorite={vi.fn()}
        getFormattedDate={() => 'Jan 1, 2026'}
      />
    );

    expect(screen.getByText('Done item')).toHaveClass('line-through');
    expect(screen.getByText('Active item')).toBeInTheDocument();
  });

  it('applies italic styling for reminder category', () => {
    const reminderNote: Note = {
      ...defaultNote,
      category: 'reminder',
    };

    render(
      <NoteCard
        note={reminderNote}
        index={0}
        onClick={vi.fn()}
        onToggleFavorite={vi.fn()}
        getFormattedDate={() => 'Jan 1, 2026'}
      />
    );

    const contentParagraph = screen.getByText('This is some text about minimalism.');
    expect(contentParagraph).toHaveClass('italic');
  });

  it('displays image count badge when imageUrl array is present', () => {
    const imageNote: Note = {
      ...defaultNote,
      imageUrls: ['https://example.com/1.png', 'https://example.com/2.png'],
    };

    render(
      <NoteCard
        note={imageNote}
        index={0}
        onClick={vi.fn()}
        onToggleFavorite={vi.fn()}
        getFormattedDate={() => 'Jan 1, 2026'}
      />
    );

    const badge = screen.getByTestId('image-count-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('2');
  });

  it('displays image count badge when single imageUrl is present', () => {
    const imageNote: Note = {
      ...defaultNote,
      imageUrl: 'https://example.com/single.png',
    };

    render(
      <NoteCard
        note={imageNote}
        index={0}
        onClick={vi.fn()}
        onToggleFavorite={vi.fn()}
        getFormattedDate={() => 'Jan 1, 2026'}
      />
    );

    const badge = screen.getByTestId('image-count-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('1');
  });

  it('displays image count badge when images array objects are present', () => {
    const imageNote: Note = {
      ...defaultNote,
      images: [
        { url: 'https://example.com/img1.png', caption: 'Caption 1' },
        { url: 'https://example.com/img2.png', caption: 'Caption 2' },
      ],
    };

    render(
      <NoteCard
        note={imageNote}
        index={0}
        onClick={vi.fn()}
        onToggleFavorite={vi.fn()}
        getFormattedDate={() => 'Jan 1, 2026'}
      />
    );

    const badge = screen.getByTestId('image-count-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('2');
  });

  it('truncates very long note content', () => {
    const longNote: Note = {
      ...defaultNote,
      content: 'a'.repeat(200),
    };

    render(
      <NoteCard
        note={longNote}
        index={0}
        onClick={vi.fn()}
        onToggleFavorite={vi.fn()}
        getFormattedDate={() => 'Jan 1, 2026'}
      />
    );

    expect(screen.getByText('a'.repeat(150) + '...')).toBeInTheDocument();
  });
});
