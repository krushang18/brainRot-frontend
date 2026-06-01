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
});

describe('PolaroidInputSection Component', () => {
  it('returns null when imageUrls length >= 5', () => {
    const { container } = render(
      <PolaroidInputSection
        imageUrls={['1', '2', '3', '4', '5']}
        tempImageUrl=""
        setTempImageUrl={vi.fn()}
        tempImageCaption=""
        setTempImageCaption={vi.fn()}
        onAddImage={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders input elements and calls set state handlers', () => {
    const setUrl = vi.fn();
    const setCaption = vi.fn();
    const onAdd = vi.fn();

    render(
      <PolaroidInputSection
        imageUrls={[]}
        tempImageUrl="https://abc.xyz"
        setTempImageUrl={setUrl}
        tempImageCaption="Caption Text"
        setTempImageCaption={setCaption}
        onAddImage={onAdd}
      />
    );

    const urlInput = screen.getByLabelText(/image url/i);
    const captionInput = screen.getByLabelText(/caption/i);
    const addBtn = screen.getByRole('button', { name: /add polaroid/i });

    expect(urlInput).toHaveValue('https://abc.xyz');
    expect(captionInput).toHaveValue('Caption Text');

    fireEvent.change(urlInput, { target: { value: 'https://other.com' } });
    expect(setUrl).toHaveBeenCalledWith('https://other.com');

    fireEvent.change(captionInput, { target: { value: 'Other Caption' } });
    expect(setCaption).toHaveBeenCalledWith('Other Caption');

    // Trigger Enter keydown
    fireEvent.keyDown(urlInput, { key: 'Enter', code: 'Enter' });
    expect(onAdd).toHaveBeenCalled();

    // Trigger click on Add button
    fireEvent.click(addBtn);
    expect(onAdd).toHaveBeenCalledTimes(2);
  });
});
