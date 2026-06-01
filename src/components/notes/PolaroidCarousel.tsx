'use client';

import React from 'react';
import { Note } from '@/types/note';

interface PolaroidCarouselProps {
  selectedNote: Note;
  currentImageIndex: number;
  setCurrentImageIndex: (idx: number) => void;
  setPreviewImageUrl: (url: string | null) => void;
}

export const PolaroidCarousel: React.FC<PolaroidCarouselProps> = ({
  selectedNote,
  currentImageIndex,
  setCurrentImageIndex,
  setPreviewImageUrl,
}) => {
  let imgs: string[] = [];
  if (selectedNote.images && selectedNote.images.length > 0) {
    imgs = selectedNote.images.map((img) => img.url);
  } else if (selectedNote.imageUrls && selectedNote.imageUrls.length > 0) {
    imgs = selectedNote.imageUrls;
  } else if (selectedNote.imageUrl) {
    imgs = [selectedNote.imageUrl];
  }

  if (imgs.length === 0) return null;

  // Dynamic hand-scattered rotations
  const rotations = [
    'rotate-[-2deg]',
    'rotate-[1.5deg]',
    'rotate-[-1deg]',
    'rotate-[2deg]',
    'rotate-[-2.5deg]',
  ];

  const prevIndex = (currentImageIndex - 1 + imgs.length) % imgs.length;
  const nextIndex = (currentImageIndex + 1) % imgs.length;

  return (
    <div className="relative mb-6 flex min-h-[220px] w-full items-center justify-center select-none">
      {/* Previous Image Peeking Card */}
      {imgs.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentImageIndex(prevIndex);
          }}
          className="group absolute bottom-2 left-4 z-10 cursor-pointer border-none bg-transparent p-0 text-left transition-all duration-300 outline-none hover:-translate-x-1 hover:scale-110"
          title="Previous Image"
        >
          <div
            className="border-gunmetal/70 w-[55px] rotate-[8deg] border border-dashed bg-white p-1 shadow-md transition-all duration-300 group-hover:rotate-0 group-hover:border-solid"
            style={{
              borderRadius: '4px 9px 5px 12px / 10px 4px 12px 5px',
            }}
          >
            <div
              className="bg-alabaster-grey/10 border-gunmetal/20 relative aspect-square w-full overflow-hidden border"
              style={{
                borderRadius: '3px 7px 4px 9px / 9px 3px 9px 4px',
              }}
            >
              <img
                src={imgs[prevIndex]}
                alt="Previous Polaroid"
                className="h-full w-full object-cover brightness-95 filter group-hover:brightness-100"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://placehold.co/400x400?text=Invalid+Image';
                }}
              />
            </div>
            <div className="pt-1 text-center select-none">
              <p className="text-gunmetal/40 font-['Caveat',_cursive] text-[8px] font-bold">
                &lt; Prev
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Active Image Card */}
      <div className="relative">
        {(() => {
          const activeUrl = imgs[currentImageIndex];
          const activeRotation = rotations[currentImageIndex % rotations.length];
          return (
            <button
              type="button"
              onClick={() => setPreviewImageUrl(activeUrl)}
              className={`bg-white p-3 shadow-md ${activeRotation} border-gunmetal/80 block w-[200px] cursor-pointer border-2 text-left transition-all duration-300 outline-none hover:scale-105 hover:rotate-0`}
              style={{
                borderRadius: '8px 18px 10px 24px / 20px 8px 24px 10px',
              }}
            >
              <div
                className="bg-alabaster-grey/10 border-gunmetal/30 relative aspect-square w-full overflow-hidden border"
                style={{
                  borderRadius: '6px 14px 8px 18px / 18px 6px 18px 8px',
                }}
              >
                <img
                  src={activeUrl}
                  alt={`Polaroid ${currentImageIndex + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://placehold.co/400x400?text=Invalid+Image';
                  }}
                />
              </div>
              <div className="pt-2.5 text-center">
                <p className="text-gunmetal/60 font-['Caveat',_cursive] text-[13px] font-bold">
                  {(() => {
                    const matchingImage = selectedNote.images?.find((img) => img.url === activeUrl);
                    return matchingImage?.caption ? matchingImage.caption : 'image';
                  })()}
                </p>
              </div>
            </button>
          );
        })()}
      </div>

      {/* Next Image Peeking Card */}
      {imgs.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentImageIndex(nextIndex);
          }}
          className="group absolute right-4 bottom-2 z-10 cursor-pointer border-none bg-transparent p-0 text-left transition-all duration-300 outline-none hover:translate-x-1 hover:scale-110"
          title="Next Image"
        >
          <div
            className="border-gunmetal/70 w-[55px] rotate-[-8deg] border border-dashed bg-white p-1 shadow-md transition-all duration-300 group-hover:rotate-0 group-hover:border-solid"
            style={{
              borderRadius: '9px 4px 12px 5px / 4px 10px 5px 12px',
            }}
          >
            <div
              className="bg-alabaster-grey/10 border-gunmetal/20 relative aspect-square w-full overflow-hidden border"
              style={{
                borderRadius: '7px 3px 9px 4px / 3px 9px 4px 9px',
              }}
            >
              <img
                src={imgs[nextIndex]}
                alt="Next Polaroid"
                className="h-full w-full object-cover brightness-95 filter group-hover:brightness-100"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://placehold.co/400x400?text=Invalid+Image';
                }}
              />
            </div>
            <div className="pt-1 text-center select-none">
              <p className="text-gunmetal/40 font-['Caveat',_cursive] text-[8px] font-bold">
                Next &gt;
              </p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};
