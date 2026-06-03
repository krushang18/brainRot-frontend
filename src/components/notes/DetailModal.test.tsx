import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DetailModal } from './DetailModal';
import { Note } from '@/types/note';

describe('DetailModal Component', () => {
  const mockNote: Note = {
    id: 'test-note-1',
    title: 'Cafe Sketches',
    category: 'yaps',
    content: 'Barista looked like a wizard today.',
    createdAt: 'Oct 22, 2023',
    tags: ['coffee', 'art'],
    isFavorite: false,
    images: [{ url: 'https://example.com/cafe.png', caption: 'Wizard Barista' }],
  };

  it('returns null when isOpen or selectedNote is missing', () => {
    const { container } = render(
      <DetailModal
        isOpen={false}
        selectedNote={mockNote}
        onClose={vi.fn()}
        isFlipped={false}
        setIsFlipped={vi.fn()}
        noteError=""
        setNoteError={vi.fn()}
        newTitle=""
        setNewTitle={vi.fn()}
        newCategory="yaps"
        setNewCategory={vi.fn()}
        newTagsString=""
        setNewTagsString={vi.fn()}
        newImageUrls={[]}
        setNewImageUrls={vi.fn()}
        newImageCaptions={[]}
        setNewImageCaptions={vi.fn()}
        newContent=""
        setNewContent={vi.fn()}
        currentImageIndex={0}
        setCurrentImageIndex={vi.fn()}
        setPreviewImageUrl={vi.fn()}
        onToggleFavorite={vi.fn()}
        onDeleteNote={vi.fn()}
        onSaveRevision={vi.fn()}
        getFormattedDate={() => 'Oct 22, 2023'}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders read-only detail card (front view) correctly', () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const onClose = vi.fn();
    const setIsFlipped = vi.fn();

    render(
      <DetailModal
        isOpen={true}
        selectedNote={mockNote}
        onClose={onClose}
        isFlipped={false}
        setIsFlipped={setIsFlipped}
        noteError=""
        setNoteError={vi.fn()}
        newTitle=""
        setNewTitle={vi.fn()}
        newCategory="yaps"
        setNewCategory={vi.fn()}
        newTagsString=""
        setNewTagsString={vi.fn()}
        newImageUrls={[]}
        setNewImageUrls={vi.fn()}
        newImageCaptions={[]}
        setNewImageCaptions={vi.fn()}
        newContent=""
        setNewContent={vi.fn()}
        currentImageIndex={0}
        setCurrentImageIndex={vi.fn()}
        setPreviewImageUrl={vi.fn()}
        onToggleFavorite={onToggle}
        onDeleteNote={onDelete}
        onSaveRevision={vi.fn()}
        getFormattedDate={() => 'Oct 22, 2023'}
      />
    );

    expect(screen.getByText('Cafe Sketches')).toBeInTheDocument();
    expect(screen.getByText('Barista looked like a wizard today.')).toBeInTheDocument();
    expect(screen.getByText('#coffee')).toBeInTheDocument();

    // Click favorite
    const favBtn = screen.getByTitle('Favorite');
    fireEvent.click(favBtn);
    expect(onToggle).toHaveBeenCalledWith('test-note-1');

    // Click edit (flips modal)
    const editBtn = screen.getByTitle('Edit Note');
    fireEvent.click(editBtn);
    expect(setIsFlipped).toHaveBeenCalledWith(true);

    // Click delete
    const deleteBtn = screen.getByTitle('Delete Note');
    fireEvent.click(deleteBtn);
    expect(onDelete).not.toHaveBeenCalled();

    // Click Yes, Delete! in confirmation modal
    const confirmBtn = screen.getByText('Yes, Delete!');
    fireEvent.click(confirmBtn);

    expect(onDelete).toHaveBeenCalledWith('test-note-1');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders edit draft view (back view) correctly and supports revision saving', () => {
    const onSave = vi.fn();
    const setIsFlipped = vi.fn();
    const setTitle = vi.fn();
    const setContent = vi.fn();

    render(
      <DetailModal
        isOpen={true}
        selectedNote={mockNote}
        onClose={vi.fn()}
        isFlipped={true}
        setIsFlipped={setIsFlipped}
        noteError=""
        setNoteError={vi.fn()}
        newTitle="Cafe Sketches"
        setNewTitle={setTitle}
        newCategory="yaps"
        setNewCategory={vi.fn()}
        newTagsString="coffee, art, wizard"
        setNewTagsString={vi.fn()}
        newImageUrls={['https://example.com/cafe.png']}
        setNewImageUrls={vi.fn()}
        newImageCaptions={['Wizard Barista']}
        setNewImageCaptions={vi.fn()}
        newContent="Barista looked like a wizard today."
        setNewContent={setContent}
        currentImageIndex={0}
        setCurrentImageIndex={vi.fn()}
        setPreviewImageUrl={vi.fn()}
        onToggleFavorite={vi.fn()}
        onDeleteNote={vi.fn()}
        onSaveRevision={onSave}
        getFormattedDate={() => 'Oct 22, 2023'}
      />
    );

    expect(screen.getByText('Edit Note Draft')).toBeInTheDocument();

    // Edit fields
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'New Cafe sketches' } });
    expect(setTitle).toHaveBeenCalledWith('New Cafe sketches');

    // Submit edit form
    const saveBtn = screen.getByRole('button', { name: /save revision/i });
    fireEvent.submit(saveBtn);
    expect(onSave).toHaveBeenCalled();
    expect(setIsFlipped).toHaveBeenCalledWith(false);
  });

  it('renders strikethrough content successfully when content contains double-tilde notation', () => {
    const crossedNote: Note = {
      ...mockNote,
      content: '~~crossed line~~\nnormal line',
    };

    render(
      <DetailModal
        isOpen={true}
        selectedNote={crossedNote}
        onClose={vi.fn()}
        isFlipped={false}
        setIsFlipped={vi.fn()}
        noteError=""
        setNoteError={vi.fn()}
        newTitle=""
        setNewTitle={vi.fn()}
        newCategory="yaps"
        setNewCategory={vi.fn()}
        newTagsString=""
        setNewTagsString={vi.fn()}
        newImageUrls={[]}
        setNewImageUrls={vi.fn()}
        newImageCaptions={[]}
        setNewImageCaptions={vi.fn()}
        newContent=""
        setNewContent={vi.fn()}
        currentImageIndex={0}
        setCurrentImageIndex={vi.fn()}
        setPreviewImageUrl={vi.fn()}
        onToggleFavorite={vi.fn()}
        onDeleteNote={vi.fn()}
        onSaveRevision={vi.fn()}
        getFormattedDate={() => 'Oct 22, 2023'}
      />
    );

    const crossed = screen.getByText('crossed line');
    expect(crossed).toBeInTheDocument();
    expect(crossed).toHaveClass('line-through');
    expect(screen.getByText('normal line')).toBeInTheDocument();
  });

  it('supports category selection and dynamic polaroid snap triggers', () => {
    const setCats = vi.fn();
    const setUrls = vi.fn();
    const setCaptions = vi.fn();

    render(
      <DetailModal
        isOpen={true}
        selectedNote={mockNote}
        onClose={vi.fn()}
        isFlipped={true}
        setIsFlipped={vi.fn()}
        noteError=""
        setNoteError={vi.fn()}
        newTitle="Cafe sketches"
        setNewTitle={vi.fn()}
        newCategory="yaps"
        setNewCategory={setCats}
        newTagsString=""
        setNewTagsString={vi.fn()}
        newImageUrls={[]}
        setNewImageUrls={setUrls}
        newImageCaptions={[]}
        setNewImageCaptions={setCaptions}
        newContent=""
        setNewContent={vi.fn()}
        currentImageIndex={0}
        setCurrentImageIndex={vi.fn()}
        setPreviewImageUrl={vi.fn()}
        onToggleFavorite={vi.fn()}
        onDeleteNote={vi.fn()}
        onSaveRevision={vi.fn()}
        getFormattedDate={() => 'Oct 22, 2023'}
      />
    );

    // Switch Category Button click
    const geniusBtn = screen.getByRole('button', { name: /genius/i });
    fireEvent.click(geniusBtn);
    expect(setCats).toHaveBeenCalledWith('genius');

    // Add Image via file upload
    const uploadBtn = screen.getByRole('button', { name: /upload photo/i });
    expect(uploadBtn).toBeInTheDocument();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(setUrls).toHaveBeenCalled();
    expect(setCaptions).toHaveBeenCalled();
  });
});
