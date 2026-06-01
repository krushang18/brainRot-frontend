'use client';

import React from 'react';
import { Card, Input, Button } from 'sketchbook-ui';
import { NOTE_CATEGORIES, NoteCategory } from '@/types/note';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteError: string;
  onSubmit: (e: React.SyntheticEvent) => void;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newCategory: NoteCategory;
  setNewCategory: (val: NoteCategory) => void;
  newTagsString: string;
  setNewTagsString: (val: string) => void;
  newImageUrls: string[];
  setNewImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  newImageCaptions: string[];
  setNewImageCaptions: React.Dispatch<React.SetStateAction<string[]>>;
  tempImageUrl: string;
  setTempImageUrl: (val: string) => void;
  tempImageCaption: string;
  setTempImageCaption: (val: string) => void;
  newContent: string;
  setNewContent: (val: string) => void;
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
              {newImageUrls.length > 0 && (
                <div className="flex max-w-full scrollbar-thin gap-3 overflow-x-auto px-1.5 pt-1 pb-4 select-none">
                  {newImageUrls.map((url, idx) => {
                    const rotations = [
                      'rotate-[-2deg]',
                      'rotate-[1deg]',
                      'rotate-[-1.5deg]',
                      'rotate-[2deg]',
                    ];
                    const rotation = rotations[idx % rotations.length];
                    return (
                      <div
                        key={url + '-' + idx}
                        className={`group border-dust-grey/40 relative flex-shrink-0 bg-white p-2 shadow-sm ${rotation} w-[95px] border transition-all duration-300 hover:scale-105 hover:rotate-0`}
                      >
                        <div className="bg-alabaster-grey/10 relative aspect-square w-full overflow-hidden rounded">
                          <img
                            src={url}
                            alt={`Polaroid ${idx + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://placehold.co/100x100?text=Invalid';
                            }}
                          />
                          {/* Sketchy Center Delete Overlay (No red color, hand-drawn/scribbled trash SVG) */}
                          <div className="absolute inset-0 flex items-center justify-center rounded bg-[#FAF8F5]/85 opacity-0 backdrop-blur-[1.5px] transition-all duration-200 select-none group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => {
                                setNewImageUrls(newImageUrls.filter((_, i) => i !== idx));
                                setNewImageCaptions(newImageCaptions.filter((_, i) => i !== idx));
                              }}
                              className="text-gunmetal flex cursor-pointer items-center justify-center rounded-full bg-[#FAF8F5] p-2 shadow-md transition-all duration-200 hover:scale-110 hover:bg-white active:scale-90"
                              title="Delete Image"
                            >
                              <svg
                                className="text-gunmetal/90 h-5.5 w-5.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.2}
                              >
                                {/* Crooked Lid */}
                                <path d="M3.5 6.5h16.8" strokeLinecap="round" />
                                {/* Crooked Lid Handle */}
                                <path
                                  d="M9.2 6.5v-2.2c0-.4.3-.8.8-.8h3.8c.4 0 .8.4.8.8v2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                {/* Crooked Body */}
                                <path
                                  d="M18.3 6.8l-1.1 12.4c-.1 1-.9 1.8-1.9 1.8H8.5c-1 0-1.8-.8-1.9-1.8L5.5 6.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                {/* Crooked Stripes */}
                                <path d="M10.2 10.5v6.5 M13.8 10.5v6.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="w-full max-w-full overflow-hidden px-1 pt-1.5 text-center text-ellipsis">
                          <p
                            className="text-gunmetal/60 overflow-hidden font-['Caveat',_cursive] text-[10px] leading-none font-bold text-ellipsis whitespace-nowrap"
                            title={newImageCaptions[idx] || `Photo ${idx + 1}`}
                          >
                            {newImageCaptions[idx] || `Photo ${idx + 1}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Input field to add a new URL (shown only if < 5 images exist) */}
              {newImageUrls.length < 5 && (
                <div className="mt-2 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label
                        htmlFor="note-image-url"
                        className="text-gunmetal/70 ml-1 font-mono text-[10px] font-bold uppercase select-none"
                      >
                        Image URL
                      </label>
                      <Input
                        id="note-image-url"
                        type="text"
                        value={tempImageUrl}
                        onChange={(e) => setTempImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (tempImageUrl.trim()) {
                              setNewImageUrls([...newImageUrls, tempImageUrl.trim()]);
                              setNewImageCaptions([...newImageCaptions, tempImageCaption.trim()]);
                              setTempImageUrl('');
                              setTempImageCaption('');
                            }
                          }
                        }}
                        placeholder="Paste a photo URL..."
                        className="w-full"
                        size="md"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="note-image-caption"
                        className="text-gunmetal/70 ml-1 font-mono text-[10px] font-bold uppercase select-none"
                      >
                        Caption (Optional)
                      </label>
                      <Input
                        id="note-image-caption"
                        type="text"
                        value={tempImageCaption}
                        onChange={(e) => setTempImageCaption(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (tempImageUrl.trim()) {
                              setNewImageUrls([...newImageUrls, tempImageUrl.trim()]);
                              setNewImageCaptions([...newImageCaptions, tempImageCaption.trim()]);
                              setTempImageUrl('');
                              setTempImageCaption('');
                            }
                          }
                        }}
                        placeholder="Add caption..."
                        className="w-full"
                        size="md"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (tempImageUrl.trim()) {
                          setNewImageUrls([...newImageUrls, tempImageUrl.trim()]);
                          setNewImageCaptions([...newImageCaptions, tempImageCaption.trim()]);
                          setTempImageUrl('');
                          setTempImageCaption('');
                        }
                      }}
                      className="bg-granite flex cursor-pointer items-center justify-center rounded-lg border border-black/25 px-5 py-2 font-mono text-xs font-bold tracking-wider text-white uppercase shadow transition-all select-none hover:bg-slate-800 active:scale-95"
                    >
                      Add Polaroid
                    </button>
                  </div>
                </div>
              )}
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
