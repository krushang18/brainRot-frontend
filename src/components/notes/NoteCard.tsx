'use client';

import React from 'react';
import { Card } from 'sketchbook-ui';
import { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  index: number;
  onClick: () => void;
  onToggleFavorite: (id: string) => void;
  getFormattedDate: (note: Note) => string;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  index,
  onClick,
  onToggleFavorite,
  getFormattedDate,
}) => {
  const isFavorite = typeof note.is_favorite === 'boolean' ? note.is_favorite : !!note.isFavorite;

  // Apply stable pseudo-random min-height sizes to card containers
  const minHeights = [
    'min-h-[200px]',
    'min-h-[310px]',
    'min-h-[250px]',
    'min-h-[360px]',
    'min-h-[285px]',
  ];
  const sizeClass = minHeights[index % minHeights.length];

  // Apply stable pseudo-random organic tilts to card containers
  const rotations = [
    'rotate-[-1.5deg]',
    'rotate-[1.2deg]',
    'rotate-[-0.8deg]',
    'rotate-[1.5deg]',
    'rotate-[-1.2deg]',
  ];
  const rotClass = rotations[index % rotations.length];

  return (
    <Card
      variant="notebook"
      className={`flex cursor-pointer flex-col justify-between bg-white p-6 shadow-md transition-all duration-250 hover:-translate-y-1.5 hover:scale-[1.015] hover:rotate-0 hover:shadow-xl ${sizeClass} ${rotClass} ${
        note.title.toLowerCase().includes('minimalism') ? 'md:col-span-2' : ''
      }`}
      onClick={onClick}
    >
      <div>
        {/* Note Date and Favorite Star */}
        <div className="border-gunmetal/15 mb-3 flex items-center justify-between border-b border-dashed pb-2">
          <span className="text-granite/60 font-mono text-[10px] font-bold tracking-wider uppercase select-none">
            {getFormattedDate(note)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note.id);
            }}
            className="text-gunmetal/30 transition-colors hover:text-yellow-500"
            title={isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            <svg
              className={`h-5 w-5 ${isFavorite ? 'fill-current text-yellow-500' : ''}`}
              fill={isFavorite ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.564-.371-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>

        {/* Note Title */}
        <h3 className="text-granite mb-2.5 text-xl leading-snug font-bold tracking-tight">
          {note.title}
        </h3>

        {/* Note Content */}
        <p
          className={`text-gunmetal/90 font-['Patrick_Hand',_cursive] text-lg leading-relaxed whitespace-pre-wrap ${
            note.category === 'reminder' ? 'text-teal-850 italic' : ''
          }`}
        >
          {(() => {
            const maxChars = 150;
            const isLong = note.content.length > maxChars;
            const textToRender = isLong ? note.content.slice(0, maxChars) + '...' : note.content;
            return textToRender.includes('~~')
              ? textToRender.split('\n').map((line, i) => {
                  const lineKey = `${note.id}-line-${i}-${line}`;
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
              : textToRender;
          })()}
        </p>
      </div>

      {/* Note Footer: Tags and Actions */}
      <div className="border-gunmetal/15 mt-4 flex items-center border-t border-dashed pt-2.5">
        {/* Folder/Category Badge */}
        <div className="flex items-center gap-2">
          <span className="bg-ash-grey/15 border-gunmetal/15 text-gunmetal/90 flex h-6 items-center gap-1 rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase select-none">
            {note.category}
          </span>
          {(() => {
            let imgs: string[] = [];
            if (note.images && note.images.length > 0) {
              imgs = note.images.map((img) => img.url);
            } else if (note.imageUrls && note.imageUrls.length > 0) {
              imgs = note.imageUrls;
            } else if (note.imageUrl) {
              imgs = [note.imageUrl];
            }
            if (imgs.length > 0) {
              return (
                <span
                  data-testid="image-count-badge"
                  className="bg-ash-grey/15 border-gunmetal/15 text-gunmetal/90 flex h-6 items-center gap-1 rounded border px-2 py-0.5 font-mono text-[9px] font-bold select-none"
                >
                  <svg
                    className="text-gunmetal/75 h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    {/* Hand-drawn crooked camera frame */}
                    <path
                      d="M3.5 8.5c0-.8.6-1.5 1.5-1.5h3.2c.4 0 .8-.2 1-.5l1.3-2.2c.3-.5.8-.8 1.4-.8h4.2c.6 0 1.1.3 1.4.8l1.3 2.2c.2.3.6.5 1 .5h3.2c.9 0 1.5.7 1.5 1.5v9c0 .9-.6 1.5-1.5 1.5H5c-.9 0-1.5-.6-1.5-1.5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Crooked lens circle */}
                    <path
                      d="M16 13a4 4 0 11-8 0 4 4 0 018 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Small flash light dot */}
                    <circle cx="17.5" cy="9.5" r="0.75" fill="currentColor" />
                  </svg>
                  {imgs.length}
                </span>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </Card>
  );
};
