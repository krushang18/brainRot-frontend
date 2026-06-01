import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PolaroidCarousel } from './PolaroidCarousel';
import { Note } from '@/types/note';

describe('PolaroidCarousel Component', () => {
  const emptyNote: Note = {
    id: 'test-1',
    title: 'Test',
    category: 'yaps',
    content: 'content',
    createdAt: 'Jan 1, 2026',
    isFavorite: false,
  };

  const multiImageNote: Note = {
    ...emptyNote,
    images: [
      { url: 'https://example.com/1.png', caption: 'First Photo' },
      { url: 'https://example.com/2.png', caption: 'Second Photo' },
    ],
  };

  it('renders null if no images are present', () => {
    const { container } = render(
      <PolaroidCarousel
        selectedNote={emptyNote}
        currentImageIndex={0}
        setCurrentImageIndex={vi.fn()}
        setPreviewImageUrl={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders multiple images with peeking cards', () => {
    const setIdx = vi.fn();
    const setPreview = vi.fn();

    render(
      <PolaroidCarousel
        selectedNote={multiImageNote}
        currentImageIndex={0}
        setCurrentImageIndex={setIdx}
        setPreviewImageUrl={setPreview}
      />
    );

    // Active image
    expect(screen.getByAltText('Polaroid 1')).toBeInTheDocument();
    expect(screen.getByText('First Photo')).toBeInTheDocument();

    // Previous peeking card button
    const prevBtn = screen.getByTitle('Previous Image');
    expect(prevBtn).toBeInTheDocument();
    fireEvent.click(prevBtn);
    expect(setIdx).toHaveBeenCalledWith(1);

    // Next peeking card button
    const nextBtn = screen.getByTitle('Next Image');
    expect(nextBtn).toBeInTheDocument();
    fireEvent.click(nextBtn);
    expect(setIdx).toHaveBeenCalledWith(1);

    // Click active image triggers preview callback
    const activeImgBtn = screen.getByRole('button', { name: /polaroid 1/i });
    fireEvent.click(activeImgBtn);
    expect(setPreview).toHaveBeenCalledWith('https://example.com/1.png');
  });

  it('supports single imageUrl fallback string', () => {
    const singleImageNote: Note = {
      ...emptyNote,
      imageUrl: 'https://example.com/single.png',
    };

    render(
      <PolaroidCarousel
        selectedNote={singleImageNote}
        currentImageIndex={0}
        setCurrentImageIndex={vi.fn()}
        setPreviewImageUrl={vi.fn()}
      />
    );

    expect(screen.getByAltText('Polaroid 1')).toBeInTheDocument();
    expect(screen.queryByTitle('Previous Image')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Next Image')).not.toBeInTheDocument();
  });

  it('supports imageUrls string array fallback', () => {
    const arrayImageNote: Note = {
      ...emptyNote,
      imageUrls: ['https://example.com/a.png', 'https://example.com/b.png'],
    };

    render(
      <PolaroidCarousel
        selectedNote={arrayImageNote}
        currentImageIndex={0}
        setCurrentImageIndex={vi.fn()}
        setPreviewImageUrl={vi.fn()}
      />
    );

    expect(screen.getByAltText('Polaroid 1')).toBeInTheDocument();
    expect(screen.getByTitle('Previous Image')).toBeInTheDocument();
  });

  it('handles image load errors gracefully', () => {
    render(
      <PolaroidCarousel
        selectedNote={multiImageNote}
        currentImageIndex={0}
        setCurrentImageIndex={vi.fn()}
        setPreviewImageUrl={vi.fn()}
      />
    );

    const images = screen.getAllByRole('img');
    images.forEach((img) => {
      fireEvent.error(img);
      expect((img as HTMLImageElement).src).toContain('placehold.co');
    });
  });
});
