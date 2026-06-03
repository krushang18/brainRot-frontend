'use client';

import React from 'react';
import { Card, Input, Button } from 'sketchbook-ui';
import { Note, NOTE_CATEGORIES, SharedNoteFormProps } from '@/types/note';
import { PolaroidCarousel } from './PolaroidCarousel';
import { PolaroidGrid, PolaroidInputSection } from './PolaroidGrid';

interface DetailModalProps extends SharedNoteFormProps {
  isOpen: boolean;
  selectedNote: Note | null;
  onClose: () => void;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
  noteError: string;
  setNoteError: (val: string) => void;
  currentImageIndex: number;
  setCurrentImageIndex: (val: number) => void;
  setPreviewImageUrl: (val: string | null) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onSaveRevision: (updatedNote: Note) => void;
  getFormattedDate: (note: Note) => string;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  selectedNote,
  onClose,
  isFlipped,
  setIsFlipped,
  noteError,
  setNoteError,
  newTitle,
  setNewTitle,
  newCategory,
  setNewCategory,
  newTagsString,
  setNewTagsString,
  newImageUrls,
  setNewImageUrls,
  newImageCaptions,
  setNewImageCaptions,
  newImageFiles,
  setNewImageFiles,
  newContent,
  setNewContent,
  currentImageIndex,
  setCurrentImageIndex,
  setPreviewImageUrl,
  onToggleFavorite,
  onDeleteNote,
  onSaveRevision,
  getFormattedDate,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  if (!isOpen || !selectedNote) return null;

  const isSelectedNoteFav =
    typeof selectedNote.is_favorite === 'boolean'
      ? selectedNote.is_favorite
      : !!selectedNote.isFavorite;

  const handleEditSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setNoteError('');

    if (!newTitle.trim()) {
      setNoteError('Title is required!');
      return;
    }
    if (!newContent.trim()) {
      setNoteError('Content cannot be empty!');
      return;
    }

    const tags = newTagsString.trim()
      ? newTagsString
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : undefined;

    const updatedNote: Note = {
      ...selectedNote,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      tags,
      imageUrls: newImageUrls.filter(Boolean),
      images: newImageUrls.filter(Boolean).map((url, idx) => ({
        url,
        caption: newImageCaptions[idx] || null,
      })),
      imageUrl: undefined,
      updated_at: new Date().toISOString(),
    };

    onSaveRevision(updatedNote);
    setIsFlipped(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="animate-fade-in fixed inset-0 h-full w-full cursor-pointer border-none bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close detailed view"
      />

      {/* 3D Flip Card Container */}
      <div
        className="flip-card-container relative z-10 w-full max-w-[850px]"
        style={{ minHeight: '670px' }}
      >
        <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* FRONT: Detailed View */}
          <div className="flip-card-front">
            <Card
              variant="notebook"
              className="compact-modal relative w-full select-text"
              style={{ minHeight: '670px', height: '670px' }}
            >
              <div className="flex h-full w-full flex-col justify-between">
                {/* Absolute Top-Right Controls Container */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5 select-none">
                  {/* Favorite Button */}
                  <button
                    onClick={() => onToggleFavorite(selectedNote.id)}
                    className="text-gunmetal flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:scale-115 active:scale-90"
                    title={isSelectedNoteFav ? 'Unfavorite' : 'Favorite'}
                  >
                    <svg
                      className={`h-5 w-5 ${isSelectedNoteFav ? 'fill-yellow-400 text-yellow-500' : 'text-gunmetal/70'}`}
                      fill={isSelectedNoteFav ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.564-.371-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="text-gunmetal flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:scale-115 active:scale-90"
                    title="Edit Note"
                  >
                    <svg
                      className="text-gunmetal/80 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path
                        d="M13.5 4.5l6 6M4 20h4L20 8.5 15.5 4 4 16v4z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M6 18l1.5-1.5M16 8l1.5-1.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      setIsConfirmingDelete(true);
                    }}
                    className="text-gunmetal flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:scale-115 active:scale-90"
                    title="Delete Note"
                  >
                    <svg
                      className="text-gunmetal/80 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path d="M3.5 6.5h16.8" strokeLinecap="round" />
                      <path
                        d="M9.2 6.5v-2.2c0-.4.3-.8.8-.8h3.8c.4 0 .8.4.8.8v2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.3 6.8l-1.1 12.4c-.1 1-.9 1.8-1.9 1.8H8.5c-1 0-1.8-.8-1.9-1.8L5.5 6.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M10.2 10.5v6.5 M13.8 10.5v6.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  {/* Hand-sketched divider line */}
                  <div className="bg-gunmetal/15 mx-0.5 h-5 w-[1.5px]" />

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    aria-label="Close detailed view modal"
                    className="text-gunmetal flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:scale-115 active:scale-90"
                  >
                    <svg
                      className="text-gunmetal/85 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Header: Category Badge and Date */}
                <div className="border-gunmetal/15 mb-4 flex w-full items-center justify-between border-b border-dashed pb-3 select-none">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-granite rounded-lg px-3 py-1 font-mono text-xs font-bold tracking-wide text-white uppercase">
                      {selectedNote.category}
                    </span>
                    <span className="text-granite/70 font-mono text-xs font-bold tracking-wider uppercase">
                      Created: {getFormattedDate(selectedNote)}
                    </span>
                  </div>
                </div>

                {/* SCROLLABLE BODY CONTAINER */}
                <div
                  className="mb-4 flex-1 scrollbar-thin overflow-y-auto pr-1.5 select-text"
                  style={{ maxHeight: '495px' }}
                >
                  <h2 className="text-granite mb-4 font-['Caveat',_cursive] text-5xl font-bold tracking-wide">
                    {selectedNote.title}
                  </h2>

                  {/* Polaroid style deck */}
                  <PolaroidCarousel
                    selectedNote={selectedNote}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    setPreviewImageUrl={setPreviewImageUrl}
                  />

                  {/* Content */}
                  <div className="paper-sheet-lined mx-auto min-h-[180px] w-[650px] max-w-full p-4 select-text">
                    <p
                      className={`text-gunmetal/90 font-['Patrick_Hand',_cursive] text-xl leading-relaxed whitespace-pre-wrap ${selectedNote.category === 'reminder' ? 'text-teal-850 italic' : ''}`}
                    >
                      {selectedNote.content.includes('~~')
                        ? selectedNote.content.split('\n').map((line, i) => {
                            const lineKey = `${selectedNote.id}-detail-line-${i}`;
                            if (line.startsWith('~~') && line.endsWith('~~')) {
                              return (
                                <span key={lineKey} className="text-gunmetal/40 block line-through">
                                  {line.replaceAll('~~', '')}
                                </span>
                              );
                            }
                            return (
                              <span key={lineKey} className="block">
                                {line}
                              </span>
                            );
                          })
                        : selectedNote.content}
                    </p>
                  </div>
                </div>

                {/* Footer Container */}
                <div className="border-gunmetal/10 mt-auto border-t pt-3 select-none">
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-ash-grey/30 text-granite rounded px-2.5 py-1 font-mono text-xs font-bold tracking-wider uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                    {!selectedNote.tags && (
                      <span className="bg-ash-grey/30 text-granite rounded px-2.5 py-1 font-mono text-xs font-bold tracking-wider uppercase">
                        #{selectedNote.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* BACK: Edit Draft View */}
          <div className="flip-card-back">
            <Card
              variant="notebook"
              className="compact-modal relative w-full"
              style={{ minHeight: '670px', height: '670px' }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close edit detailed modal"
                className="text-gunmetal absolute top-4 right-4 z-20 cursor-pointer transition-transform hover:scale-110"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-granite mb-2 font-['Caveat',_cursive] text-4xl font-bold select-none">
                Edit Note Draft
              </h2>

              {noteError && (
                <div className="animate-shake text-md mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-2.5 text-center font-bold text-red-600 shadow-sm select-none">
                  ⚠️ {noteError}
                </div>
              )}

              <form
                onSubmit={handleEditSubmit}
                className="flex w-full flex-1 flex-col justify-between"
              >
                {/* SCROLLABLE FIELDS CONTAINER */}
                <div className="max-h-[520px] w-full flex-1 scrollbar-thin space-y-4 overflow-y-auto pr-1.5">
                  <div>
                    <label
                      htmlFor="edit-note-title"
                      className="text-gunmetal text-md mb-0.5 ml-1 block font-semibold"
                    >
                      Title
                    </label>
                    <Input
                      id="edit-note-title"
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Project Ideas for 2024"
                      className="w-full"
                      size="md"
                    />
                  </div>

                  <div>
                    <span className="text-gunmetal text-md mb-1 ml-1 block font-semibold">
                      Category & Folder
                    </span>
                    <div className="grid grid-cols-6 gap-2">
                      {NOTE_CATEGORIES.map((cat) => {
                        const active = newCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewCategory(cat)}
                            className={`cursor-pointer rounded-lg border px-2 py-1.5 font-mono text-[10px] font-bold tracking-wide uppercase transition-all ${
                              active
                                ? 'bg-granite border-granite text-white'
                                : 'text-gunmetal border-dust-grey bg-white hover:bg-slate-50'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags Field */}
                  <div>
                    <label
                      htmlFor="edit-note-tags"
                      className="text-gunmetal text-md mb-0.5 ml-1 block font-semibold"
                    >
                      Tags (Comma separated)
                    </label>
                    <Input
                      id="edit-note-tags"
                      type="text"
                      value={newTagsString}
                      onChange={(e) => setNewTagsString(e.target.value)}
                      placeholder="e.g. future, creative"
                      className="w-full"
                      size="md"
                    />
                  </div>

                  {/* Multi-Image Polaroid Deck Manager */}
                  <div className="border-gunmetal/10 space-y-2.5 rounded-xl border bg-[#FAF8F5]/30 p-3">
                    <div className="flex items-center justify-between select-none">
                      <span className="text-gunmetal text-md ml-1 block font-semibold">
                        Polaroid Snapshots ({newImageUrls.length}/5)
                      </span>
                      {newImageUrls.length >= 5 && (
                        <span className="font-mono text-xs font-bold tracking-wider text-emerald-700 uppercase">
                          ✓ Max Images Reached
                        </span>
                      )}
                    </div>

                    {/* List of mini Polaroids */}
                    <PolaroidGrid
                      imageUrls={newImageUrls}
                      imageCaptions={newImageCaptions}
                      onDeleteImage={(idx) => {
                        setNewImageUrls(newImageUrls.filter((_, i) => i !== idx));
                        setNewImageCaptions(newImageCaptions.filter((_, i) => i !== idx));
                        if (setNewImageFiles && newImageFiles) {
                          setNewImageFiles(newImageFiles.filter((_, i) => i !== idx));
                        }
                      }}
                      onUpdateCaption={(idx, newCaption) => {
                        setNewImageCaptions((prev) => {
                          const next = [...prev];
                          next[idx] = newCaption;
                          return next;
                        });
                      }}
                    />

                    {/* Input field to add a new URL (shown only if < 5 images exist) */}
                    <PolaroidInputSection
                      imageUrls={newImageUrls}
                      onAddFile={(file, caption) => {
                        setNewImageUrls([...newImageUrls, URL.createObjectURL(file)]);
                        setNewImageCaptions([...newImageCaptions, caption]);
                        if (setNewImageFiles && newImageFiles) {
                          setNewImageFiles([...newImageFiles, file]);
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-note-content"
                      className="text-gunmetal text-md mb-0.5 ml-1 block font-semibold"
                    >
                      Scribble Content
                    </label>
                    <textarea
                      id="edit-note-content"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Type your thoughts here..."
                      rows={9}
                      className="border-dust-grey focus:border-granite text-md w-full rounded-lg border bg-white p-2.5 font-['Patrick_Hand',_cursive] shadow-sm select-text focus:outline-none"
                    />
                  </div>

                  {/* FOOTER BUTTONS */}
                  <div className="border-gunmetal/10 mt-3 flex justify-end gap-3 border-t pt-3 select-none">
                    <Button
                      type="button"
                      onClick={() => setIsFlipped(false)}
                      colors={{ bg: '#fff', text: 'var(--granite)', stroke: 'var(--granite)' }}
                      className="hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
                    >
                      Save Revision
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {isConfirmingDelete && (
        <div className="animate-fadeIn fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm p-4">
            <Card
              className="relative border-2 border-black bg-[#FFFDF9] p-6 shadow-xl"
              style={{ transform: 'rotate(-1deg)' }}
            >
              {/* Hand-drawn aesthetic elements */}
              <div className="text-granite absolute -top-3 left-1/2 -translate-x-1/2 -rotate-2 border border-black/30 bg-[#FAF8F5] px-4 py-1 font-mono text-[10px] font-bold tracking-wider uppercase shadow-sm">
                ⚠️ Critical action
              </div>

              <div className="mt-4 space-y-4 text-center">
                <h3 className="font-['Caveat',_cursive] text-3xl leading-tight font-extrabold text-red-600">
                  Whoa, hold on!
                </h3>
                <p className="text-gunmetal/80 font-['Patrick_Hand',_cursive] text-lg leading-relaxed">
                  Do you really wanna delete this scribble? Once it&apos;s ripped out of your
                  notebook, there&apos;s no gluing it back!
                </p>
                <div className="flex justify-center gap-3 pt-2 font-mono text-xs font-bold uppercase select-none">
                  <button
                    type="button"
                    id="confirm-delete-cancel"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="border-granite text-granite flex cursor-pointer items-center justify-center rounded-lg border bg-white px-5 py-2.5 shadow transition-all hover:bg-slate-50 active:scale-95"
                  >
                    No, Keep It
                  </button>
                  <button
                    type="button"
                    id="confirm-delete-confirm"
                    onClick={() => {
                      onDeleteNote(selectedNote.id);
                      setIsConfirmingDelete(false);
                      onClose();
                    }}
                    className="flex cursor-pointer items-center justify-center rounded-lg border border-black/25 bg-red-600 px-5 py-2.5 text-white shadow transition-all hover:bg-red-700 active:scale-95"
                  >
                    Yes, Delete!
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
