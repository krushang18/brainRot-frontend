import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AddNoteModal } from './AddNoteModal';

describe('AddNoteModal Component', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <AddNoteModal
        isOpen={false}
        onClose={vi.fn()}
        noteError=""
        onSubmit={vi.fn()}
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
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal controls and displays error message', () => {
    const onClose = vi.fn();
    render(
      <AddNoteModal
        isOpen={true}
        onClose={onClose}
        noteError="Missing Title!"
        onSubmit={vi.fn()}
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
      />
    );

    expect(screen.getByText('⚠️ Missing Title!')).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByLabelText('Close note modal');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('handles field changes and category clicks', () => {
    const setTitle = vi.fn();
    const setCategory = vi.fn();
    const setTags = vi.fn();
    const setContent = vi.fn();
    const onSubmit = vi.fn();

    render(
      <AddNoteModal
        isOpen={true}
        onClose={vi.fn()}
        noteError=""
        onSubmit={onSubmit}
        newTitle="My Title"
        setNewTitle={setTitle}
        newCategory="yaps"
        setNewCategory={setCategory}
        newTagsString="a, b"
        setNewTagsString={setTags}
        newImageUrls={[]}
        setNewImageUrls={vi.fn()}
        newImageCaptions={[]}
        setNewImageCaptions={vi.fn()}
        newContent="My Content"
        setNewContent={setContent}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(setTitle).toHaveBeenCalledWith('New Title');

    const tagsInput = screen.getByLabelText(/tags/i);
    fireEvent.change(tagsInput, { target: { value: 'c' } });
    expect(setTags).toHaveBeenCalledWith('c');

    const contentInput = screen.getByLabelText(/scribble content/i);
    fireEvent.change(contentInput, { target: { value: 'New Content' } });
    expect(setContent).toHaveBeenCalledWith('New Content');

    // Click category
    fireEvent.click(screen.getByRole('button', { name: 'genius' }));
    expect(setCategory).toHaveBeenCalledWith('genius');

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: /pin note/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('handles uploading and deleting polaroid snaps correctly', () => {
    const setImageUrls = vi.fn();
    const setImageCaptions = vi.fn();

    const { rerender } = render(
      <AddNoteModal
        isOpen={true}
        onClose={vi.fn()}
        noteError=""
        onSubmit={vi.fn()}
        newTitle=""
        setNewTitle={vi.fn()}
        newCategory="yaps"
        setNewCategory={vi.fn()}
        newTagsString=""
        setNewTagsString={vi.fn()}
        newImageUrls={[]}
        setNewImageUrls={setImageUrls}
        newImageCaptions={[]}
        setNewImageCaptions={setImageCaptions}
        newContent=""
        setNewContent={vi.fn()}
      />
    );

    // Get upload button
    const uploadBtn = screen.getByRole('button', { name: /upload photo/i });
    expect(uploadBtn).toBeInTheDocument();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(setImageUrls).toHaveBeenCalled();
    expect(setImageCaptions).toHaveBeenCalled();

    // Rerender with active polaroids to check deletion
    rerender(
      <AddNoteModal
        isOpen={true}
        onClose={vi.fn()}
        noteError=""
        onSubmit={vi.fn()}
        newTitle=""
        setNewTitle={vi.fn()}
        newCategory="yaps"
        setNewCategory={vi.fn()}
        newTagsString=""
        setNewTagsString={vi.fn()}
        newImageUrls={['blob:url']}
        setNewImageUrls={setImageUrls}
        newImageCaptions={['test-image']}
        setNewImageCaptions={setImageCaptions}
        newContent=""
        setNewContent={vi.fn()}
      />
    );

    expect(screen.getByText('test-image')).toBeInTheDocument();

    // Delete polaroid button click
    const deleteBtn = screen.getByTitle('Delete Image');
    fireEvent.click(deleteBtn);
    expect(setImageUrls).toHaveBeenCalled();
    expect(setImageCaptions).toHaveBeenCalled();
  });
});
