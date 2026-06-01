import api from '@/lib/api';
import { Note, NoteCategory } from '@/types/note';

export interface NoteListResponse {
  notes: Note[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface NoteSearchResponse {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export const notesService = {
  /**
   * List notes with cursor-based pagination and optional filters
   */
  async listNotes(
    params: {
      limit?: number;
      cursor?: string | null;
      category?: string;
      tag?: string;
      is_favorite?: boolean;
    } = {}
  ): Promise<NoteListResponse> {
    // If category is 'all', filter is disabled on the backend, so omit it
    const cleanParams = { ...params } as Record<string, unknown>;
    if (cleanParams.category === 'all') {
      delete cleanParams.category;
    }
    if (cleanParams.cursor === null || cleanParams.cursor === undefined) {
      delete cleanParams.cursor;
    }
    const response = await api.get<NoteListResponse>('/notes/', { params: cleanParams });
    return response.data;
  },

  /**
   * Create a note with optional multipart/form-data images
   */
  async createNote(data: {
    title: string;
    category: NoteCategory;
    content?: string;
    tags?: string[];
    is_favorite?: boolean;
    images?: File[];
    captions?: string[];
  }): Promise<Note> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('category', data.category);
    if (data.content !== undefined) {
      formData.append('content', data.content);
    }
    if (data.tags) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    if (data.is_favorite !== undefined) {
      formData.append('is_favorite', String(data.is_favorite));
    }
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append('images', file);
      });
    }
    if (data.captions && data.captions.length > 0) {
      formData.append('captions', JSON.stringify(data.captions));
    }

    const response = await api.post<Note>('/notes/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Search notes full-text
   */
  async searchNotes(params: {
    q: string;
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    is_favorite?: boolean;
  }): Promise<NoteSearchResponse> {
    const cleanParams = { ...params } as Record<string, unknown>;
    if (cleanParams.category === 'all') {
      delete cleanParams.category;
    }
    const response = await api.get<NoteSearchResponse>('/notes/search', { params: cleanParams });
    return response.data;
  },

  /**
   * Get a single note by ID
   */
  async getNote(id: string): Promise<Note> {
    const response = await api.get<Note>(`/notes/${id}`);
    return response.data;
  },

  /**
   * Update a note (fields and optional new images to append)
   */
  async updateNote(
    id: string,
    data: {
      title?: string;
      category?: NoteCategory;
      content?: string;
      tags?: string[];
      is_favorite?: boolean;
      images?: File[];
      captions?: string[];
    }
  ): Promise<Note> {
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.content !== undefined) formData.append('content', data.content);
    if (data.tags !== undefined) formData.append('tags', JSON.stringify(data.tags));
    if (data.is_favorite !== undefined) formData.append('is_favorite', String(data.is_favorite));

    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append('images', file);
      });
    }
    if (data.captions !== undefined) {
      formData.append('captions', JSON.stringify(data.captions));
    }

    const response = await api.patch<Note>(`/notes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  },

  /**
   * Add images to an existing note
   */
  async addImages(id: string, images: File[], captions?: string[]): Promise<Note> {
    const formData = new FormData();
    images.forEach((file) => {
      formData.append('images', file);
    });
    if (captions) {
      formData.append('captions', JSON.stringify(captions));
    }

    const response = await api.post<Note>(`/notes/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update caption of an existing image
   */
  async updateImageCaption(id: string, imageUrl: string, caption: string | null): Promise<Note> {
    const response = await api.patch<Note>(`/notes/${id}/images`, {
      image_url: imageUrl,
      caption,
    });
    return response.data;
  },

  /**
   * Remove a single image from a note
   */
  async removeImage(id: string, imageUrl: string): Promise<Note> {
    const response = await api.delete<Note>(`/notes/${id}/images`, {
      data: { image_url: imageUrl },
    });
    return response.data;
  },
};
