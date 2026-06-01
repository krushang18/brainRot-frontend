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
