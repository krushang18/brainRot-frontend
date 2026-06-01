import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LightboxModal } from './LightboxModal';
import { Note } from '@/types/note';

describe('LightboxModal Component', () => {
  const mockNote: Note = {
    id: 'test-1',
    title: 'Test Title',
    category: 'genius',
    content: 'Test content',
    createdAt: 'Jan 1, 2026',
    isFavorite: false,
    images: [
      { url: 'https://example.com/a.png', caption: 'Amazing Snapshot' },
      { url: 'https://example.com/b.png', caption: '' },
    ],
  };

  it('returns null if previewImageUrl is not provided', () => {
    const { container } = render(
      <LightboxModal previewImageUrl={null} selectedNote={mockNote} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal content correctly when previewImageUrl is set', () => {
    const onClose = vi.fn();
    render(
      <LightboxModal
        previewImageUrl="https://example.com/a.png"
        selectedNote={mockNote}
        onClose={onClose}
      />
    );

    expect(screen.getByAltText('Preview snapshot')).toBeInTheDocument();
    expect(screen.getByText('✨ Amazing Snapshot ✨')).toBeInTheDocument();

    // Click close buttons
    const closeBtn = screen.getByLabelText('Close preview');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const backdrop = screen.getByLabelText('Close image preview');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('falls back to "image" when caption is falsy or missing', () => {
    render(
      <LightboxModal
        previewImageUrl="https://example.com/b.png"
        selectedNote={mockNote}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('✨ image ✨')).toBeInTheDocument();
  });

  it('gracefully handles image loading errors', () => {
    render(
      <LightboxModal
        previewImageUrl="https://example.com/bad.png"
        selectedNote={mockNote}
        onClose={vi.fn()}
      />
    );

    const img = screen.getByAltText('Preview snapshot') as HTMLImageElement;
    fireEvent.error(img);
    expect(img.src).toContain('placehold.co');
  });
});
