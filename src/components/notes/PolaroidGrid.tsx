'use client';

import React from 'react';
import { Input } from 'sketchbook-ui';

interface PolaroidGridProps {
  imageUrls: string[];
  imageCaptions: string[];
  onDeleteImage: (idx: number) => void;
  onUpdateCaption?: (idx: number, newCaption: string) => void;
}

export const PolaroidGrid: React.FC<PolaroidGridProps> = ({
  imageUrls,
  imageCaptions,
  onDeleteImage,
  onUpdateCaption,
}) => {
  const [editingIdx, setEditingIdx] = React.useState<number | null>(null);
  const [editCaptionValue, setEditCaptionValue] = React.useState<string>('');

  if (imageUrls.length === 0) return null;

  return (
    <div className="flex max-w-full scrollbar-thin gap-3 overflow-x-auto px-1.5 pt-1 pb-4 select-none">
      {imageUrls.map((url, idx) => {
        const rotations = ['rotate-[-2deg]', 'rotate-[1deg]', 'rotate-[-1.5deg]', 'rotate-[2deg]'];
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
                  onClick={() => onDeleteImage(idx)}
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
            <div className="w-full max-w-full overflow-hidden px-1 pt-1 text-center">
              {onUpdateCaption && editingIdx === idx ? (
                <input
                  type="text"
                  value={editCaptionValue}
                  onChange={(e) => setEditCaptionValue(e.target.value)}
                  onBlur={() => {
                    onUpdateCaption(idx, editCaptionValue.trim());
                    setEditingIdx(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdateCaption(idx, editCaptionValue.trim());
                      setEditingIdx(null);
                    }
                  }}
                  autoFocus
                  className="text-gunmetal w-full border-b border-black bg-transparent text-center font-['Caveat',_cursive] text-[10px] font-bold focus:outline-none"
                />
              ) : (
                <p
                  onClick={() => {
                    if (onUpdateCaption) {
                      setEditingIdx(idx);
                      setEditCaptionValue(imageCaptions[idx] || '');
                    }
                  }}
                  className={`text-gunmetal/60 overflow-hidden font-['Caveat',_cursive] text-[10px] leading-none font-bold text-ellipsis whitespace-nowrap ${
                    onUpdateCaption ? 'hover:text-gunmetal cursor-pointer hover:underline' : ''
                  }`}
                  title={
                    onUpdateCaption
                      ? 'Click to edit caption'
                      : imageCaptions[idx] || `Photo ${idx + 1}`
                  }
                >
                  {imageCaptions[idx] || `Photo ${idx + 1}`}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface PolaroidInputSectionProps {
  imageUrls: string[];
  tempImageUrl: string;
  setTempImageUrl: (val: string) => void;
  tempImageCaption: string;
  setTempImageCaption: (val: string) => void;
  onAddImage: () => void;
  onAddFile?: (file: File, caption: string) => void;
}

export const PolaroidInputSection: React.FC<PolaroidInputSectionProps> = ({
  imageUrls,
  tempImageUrl,
  setTempImageUrl,
  tempImageCaption,
  setTempImageCaption,
  onAddImage,
  onAddFile,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (imageUrls.length >= 5) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddImage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAddFile) {
      onAddFile(file, tempImageCaption.trim() || file.name.split('.')[0]);
      setTempImageCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="mt-2 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="polaroid-image-url"
            className="text-gunmetal/70 ml-1 font-mono text-[10px] font-bold uppercase select-none"
          >
            Image URL
          </label>
          <Input
            id="polaroid-image-url"
            type="text"
            value={tempImageUrl}
            onChange={(e) => setTempImageUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste a photo URL..."
            className="w-full"
            size="md"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="polaroid-image-caption"
            className="text-gunmetal/70 ml-1 font-mono text-[10px] font-bold uppercase select-none"
          >
            Caption (Optional)
          </label>
          <Input
            id="polaroid-image-caption"
            type="text"
            value={tempImageCaption}
            onChange={(e) => setTempImageCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add caption..."
            className="w-full"
            size="md"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {onAddFile && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-granite text-granite flex cursor-pointer items-center justify-center rounded-lg border bg-white px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase shadow transition-all select-none hover:bg-slate-50 active:scale-95"
          >
            Upload Photo
          </button>
        )}
        <button
          type="button"
          onClick={onAddImage}
          className="bg-granite flex cursor-pointer items-center justify-center rounded-lg border border-black/25 px-5 py-2 font-mono text-xs font-bold tracking-wider text-white uppercase shadow transition-all select-none hover:bg-slate-800 active:scale-95"
        >
          Add Polaroid
        </button>
      </div>
    </div>
  );
};
