'use client';

import React from 'react';
import { Note } from '@/types/note';

interface LightboxModalProps {
  previewImageUrl: string | null;
  selectedNote: Note | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  previewImageUrl,
  selectedNote,
  onClose,
}) => {
  if (!previewImageUrl) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Accessible native backdrop button */}
      <button
        type="button"
        className="bg-gunmetal/85 animate-fade-in absolute inset-0 h-full w-full cursor-zoom-out border-none p-0 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close image preview"
      />

      {/* Polaroid frame around the previewed image */}
      <div
        className="animate-scale-up border-gunmetal relative z-10 max-h-[95vh] max-w-[95vw] border-4 bg-white p-4 pb-12 shadow-2xl md:max-w-[550px]"
        style={{
          borderRadius: '12px 24px 14px 30px / 30px 12px 30px 14px',
          transform: 'rotate(-1deg)',
        }}
      >
        {/* Close button inside polaroid frame */}
        <button
          onClick={onClose}
          className="text-gunmetal/70 hover:text-gunmetal border-gunmetal/20 absolute top-2 right-2 z-10 cursor-pointer rounded-full border bg-[#FAF8F5] p-1.5 shadow-sm transition-transform hover:scale-110"
          aria-label="Close preview"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scribbled handmade border wrapper for image */}
        <div
          className="bg-alabaster-grey/10 border-gunmetal/70 relative w-full overflow-hidden border-2"
          style={{
            borderRadius: '8px 18px 10px 24px / 24px 8px 24px 10px',
          }}
        >
          <img
            src={previewImageUrl}
            alt="Preview snapshot"
            className="max-h-[60vh] w-full max-w-full object-contain select-none"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://placehold.co/800x800?text=Invalid+Image';
            }}
          />
        </div>

        {/* Hand-drawn caption at the bottom of the polaroid */}
        <div className="pt-5 text-center select-none">
          <p className="text-gunmetal font-['Caveat',_cursive] text-2xl font-bold tracking-wide">
            {(() => {
              const matchingImage = selectedNote?.images?.find(
                (img) => img.url === previewImageUrl
              );
              return matchingImage?.caption ? `✨ ${matchingImage.caption} ✨` : '✨ image ✨';
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};
