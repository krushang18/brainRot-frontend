import React from 'react';

export const NOTE_CATEGORIES = [
  'genius',
  'high-rot',
  'yaps',
  'serious',
  'reminder',
  'general',
] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

export interface NoteImage {
  url: string;
  caption?: string | null;
}

export interface Note {
  id: string;
  title: string;
  category: NoteCategory;
  content: string;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  imageUrl?: string;
  imageUrls?: string[];
  images?: NoteImage[];
  isFavorite?: boolean;
  is_favorite?: boolean;
}

export interface SharedNoteFormProps {
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
  newImageFiles?: (File | null)[];
  setNewImageFiles?: React.Dispatch<React.SetStateAction<(File | null)[]>>;
  tempImageUrl: string;
  setTempImageUrl: (val: string) => void;
  tempImageCaption: string;
  setTempImageCaption: (val: string) => void;
  newContent: string;
  setNewContent: (val: string) => void;
}
