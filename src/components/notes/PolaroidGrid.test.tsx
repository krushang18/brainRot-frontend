import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PolaroidGrid, PolaroidInputSection } from './PolaroidGrid';

describe('PolaroidGrid Component', () => {
  it('returns null when imageUrls is empty', () => {
    const onDelete = vi.fn();
    const { container } = render(
      <PolaroidGrid imageUrls={[]} imageCaptions={[]} onDeleteImage={onDelete} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders polaroids with captions and triggers deletion', () => {
    const onDelete = vi.fn();
    const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
    const captions = ['Caption One', ''];

    render(<PolaroidGrid imageUrls={urls} imageCaptions={captions} onDeleteImage={onDelete} />);

    expect(screen.getByText('Caption One')).toBeInTheDocument();
    expect(screen.getByText('Photo 2')).toBeInTheDocument();

    const deleteButtons = screen.getAllByTitle('Delete Image');
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(0);
  });

  it('handles image error by setting fallback image src', () => {
    const onDelete = vi.fn();
    render(
      <PolaroidGrid
        imageUrls={['https://invalid-url.com/img.jpg']}
        imageCaptions={['Test']}
        onDeleteImage={onDelete}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', 'https://placehold.co/100x100?text=Invalid');
  });

  it('allows clicking caption to trigger edit mode, type, blur to save', () => {
    const onDelete = vi.fn();
    const onUpdateCaption = vi.fn();
    render(
      <PolaroidGrid
        imageUrls={['https://example.com/1.jpg']}
        imageCaptions={['Old Caption']}
        onDeleteImage={onDelete}
        onUpdateCaption={onUpdateCaption}
      />
    );

    // Should render a button because onUpdateCaption is provided
    const captionBtn = screen.getByRole('button', { name: 'Old Caption' });
    expect(captionBtn).toBeInTheDocument();

    // Click to enter editing mode
    fireEvent.click(captionBtn);

    // Should now render an input
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Old Caption');

    // Change input value
    fireEvent.change(input, { target: { value: 'New Caption' } });

    // Blur input
    fireEvent.blur(input);

    expect(onUpdateCaption).toHaveBeenCalledWith(0, 'New Caption');
  });

  it('allows saving caption edit mode via Enter key', () => {
    const onDelete = vi.fn();
    const onUpdateCaption = vi.fn();
    render(
      <PolaroidGrid
        imageUrls={['https://example.com/1.jpg']}
        imageCaptions={['']}
        onDeleteImage={onDelete}
        onUpdateCaption={onUpdateCaption}
      />
    );

    const captionBtn = screen.getByRole('button', { name: 'Photo 1' });
    fireEvent.click(captionBtn);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Another Caption' } });

    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onUpdateCaption).toHaveBeenCalledWith(0, 'Another Caption');
  });
});

describe('PolaroidInputSection Component', () => {
  it('returns null when imageUrls length >= 5', () => {
    const { container } = render(
      <PolaroidInputSection imageUrls={['1', '2', '3', '4', '5']} onAddFile={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders upload button and handles file selection', () => {
    const onAddFile = vi.fn();
    render(<PolaroidInputSection imageUrls={[]} onAddFile={onAddFile} />);

    const uploadBtn = screen.getByRole('button', { name: /upload photo/i });
    expect(uploadBtn).toBeInTheDocument();
    fireEvent.click(uploadBtn);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onAddFile).toHaveBeenCalledWith(file, 'test-image');
  });
});
