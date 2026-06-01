'use client';

import React from 'react';
import { Card, Input, Button } from 'sketchbook-ui';
import { NOTE_CATEGORIES, SharedNoteFormProps } from '@/types/note';
import { PolaroidGrid, PolaroidInputSection } from './PolaroidGrid';

interface AddNoteModalProps extends SharedNoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  noteError: string;
  onSubmit: (e: React.SyntheticEvent) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  noteError,
  onSubmit,
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
  tempImageUrl,
  setTempImageUrl,
  tempImageCaption,
  setTempImageCaption,
  newContent,
  setNewContent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop button */}
      <button
        type="button"
        className="fixed inset-0 h-full w-full cursor-pointer border-none bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Content Card */}
      <Card
        variant="notebook"
        className="compact-modal relative z-10 w-full"
        style={{ maxWidth: '850px', width: '100%', minHeight: '670px', height: '670px' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close note modal"
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
          Scribble a Note
        </h2>

        {noteError && (
          <div className="animate-shake text-md mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-2.5 text-center font-bold text-red-600 shadow-sm select-none">
            ⚠️ {noteError}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex w-full flex-1 flex-col justify-between">
          {/* SCROLLABLE FIELDS CONTAINER */}
          <div className="max-h-[520px] w-full flex-1 scrollbar-thin space-y-4 overflow-y-auto pr-1.5">
            <div>
              <label
                htmlFor="note-title"
                className="text-gunmetal text-md mb-0.5 ml-1 block font-semibold"
              >
                Title
              </label>
              <Input
                id="note-title"
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
                htmlFor="note-tags"
                className="text-gunmetal text-md mb-0.5 ml-1 block font-semibold"
              >
                Tags (Comma separated)
              </label>
              <Input
                id="note-tags"
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
                }}
              />

              {/* Input field to add a new URL (shown only if < 5 images exist) */}
              <PolaroidInputSection
                imageUrls={newImageUrls}
                tempImageUrl={tempImageUrl}
                setTempImageUrl={setTempImageUrl}
                tempImageCaption={tempImageCaption}
                setTempImageCaption={setTempImageCaption}
                onAddImage={() => {
                  if (tempImageUrl.trim()) {
                    setNewImageUrls([...newImageUrls, tempImageUrl.trim()]);
                    setNewImageCaptions([...newImageCaptions, tempImageCaption.trim()]);
                    setTempImageUrl('');
                    setTempImageCaption('');
                  }
                }}
              />
            </div>

            <div>
              <label
                htmlFor="note-content"
                className="text-gunmetal text-md mb-0.5 ml-1 block font-semibold"
              >
                Scribble Content
              </label>
              <textarea
                id="note-content"
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
                onClick={onClose}
                colors={{ bg: '#fff', text: 'var(--granite)', stroke: 'var(--granite)' }}
                className="hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button type="submit" colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}>
                Pin Note
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
