'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button, Avatar, Badge } from 'sketchbook-ui';
import { Note, NoteCategory } from '@/types/note';
import { NoteCard } from '@/components/notes/NoteCard';
import { FilterBar } from '@/components/notes/FilterBar';
import { AddNoteModal } from '@/components/notes/AddNoteModal';
import { DetailModal } from '@/components/notes/DetailModal';
import { LightboxModal } from '@/components/notes/LightboxModal';
import { notesService } from '@/services/notesService';
interface AxiosErrorLike {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

const getFormattedDate = (note: Note) => {
  const dateVal = note.created_at || note.createdAt;
  if (!dateVal) return '';
  if (dateVal.includes('T') || !Number.isNaN(Date.parse(dateVal))) {
    try {
      const parsed = new Date(dateVal);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch (e) {
      console.warn('Failed to parse date, falling back:', e);
    }
  }
  return dateVal;
};

export default function Home() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Local state for notes app
  const [notes, setNotes] = useState<Note[]>([]);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<NoteCategory>('yaps');
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  const [newImageCaptions, setNewImageCaptions] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<(File | null)[]>([]);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempImageCaption, setTempImageCaption] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTagsString, setNewTagsString] = useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>(['all']);
  const [selectedTab, setSelectedTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteError, setNoteError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States for detailed flippable modal
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Debounced search query to prevent hammering the backend
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch notes function
  const fetchNotes = async () => {
    try {
      let resNotes: Note[] = [];
      const cat = filterCategories.includes('all') ? undefined : filterCategories[0];
      const isFav = selectedTab === 'favorites' ? true : undefined;

      if (debouncedSearchQuery.trim().length >= 2) {
        const searchRes = await notesService.searchNotes({
          q: debouncedSearchQuery.trim(),
          category: cat,
          is_favorite: isFav,
          limit: 100,
        });
        resNotes = searchRes.notes;
      } else {
        const listRes = await notesService.listNotes({
          category: cat,
          is_favorite: isFav,
          limit: 100,
        });
        resNotes = listRes.notes;
      }
      setNotes(resNotes);
    } catch (e) {
      console.error('Failed to fetch notes:', e);
    } finally {
      // Fetch notes completed
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, debouncedSearchQuery, filterCategories, selectedTab]);

  let isSelectedNoteFav = false;
  if (selectedNote) {
    if (typeof selectedNote.is_favorite === 'boolean') {
      isSelectedNoteFav = selectedNote.is_favorite;
    } else {
      isSelectedNoteFav = !!selectedNote.isFavorite;
    }
  }

  const handleCardClick = (note: Note) => {
    setSelectedNote(note);
    setNewTitle(note.title);
    setNewCategory(note.category);
    setCurrentImageIndex(0);

    // Load existing image(s) to multiple images state
    if (note.images && note.images.length > 0) {
      setNewImageUrls(note.images.map((img) => img.url));
      setNewImageCaptions(note.images.map((img) => img.caption || ''));
    } else if (note.imageUrls && note.imageUrls.length > 0) {
      setNewImageUrls(note.imageUrls);
      setNewImageCaptions(note.imageUrls.map(() => ''));
    } else if (note.imageUrl) {
      setNewImageUrls([note.imageUrl]);
      setNewImageCaptions(['']);
    } else {
      setNewImageUrls([]);
      setNewImageCaptions([]);
    }
    setNewImageFiles([]);
    setTempImageUrl('');
    setTempImageCaption('');

    setNewContent(note.content);
    setNewTagsString(note.tags ? note.tags.join(', ') : '');
    setIsFlipped(false);
    setIsDetailModalOpen(true);
  };

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (isDetailModalOpen || isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDetailModalOpen, isModalOpen]);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (previewImageUrl) {
          setPreviewImageUrl(null);
        } else if (isDetailModalOpen) {
          setIsDetailModalOpen(false);
          setIsFlipped(false);
          setSelectedNote(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
          setNoteError('');
        }
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDetailModalOpen, isModalOpen, previewImageUrl]);

  // Dynamic DOM effect to allow sketchbook-ui inputs to stretch to full width
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        const svgs = document.querySelectorAll('.sketch-input svg');
        svgs.forEach((svg) => {
          svg.setAttribute('preserveAspectRatio', 'none');
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  const handleAddNote = async (e: React.SyntheticEvent) => {
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

    // Filter files and captions so we only send indices that actually have Files
    const actualFiles: File[] = [];
    const actualCaptions: string[] = [];
    newImageFiles.forEach((file, idx) => {
      if (file) {
        actualFiles.push(file);
        actualCaptions.push(newImageCaptions[idx] || '');
      }
    });

    try {
      const createdNote = await notesService.createNote({
        title: newTitle.trim(),
        category: newCategory,
        content: newContent.trim(),
        tags,
        is_favorite: false,
        images: actualFiles,
        captions: actualCaptions,
      });

      setNotes((prev) => [createdNote, ...prev]);

      // Reset state
      setNewTitle('');
      setNewImageUrls([]);
      setNewImageFiles([]);
      setNewImageCaptions([]);
      setTempImageUrl('');
      setTempImageCaption('');
      setNewContent('');
      setNewTagsString('');
      setNewCategory('yaps');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding note:', err);
      setNoteError((err as AxiosErrorLike).response?.data?.detail || 'Failed to create note.');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await notesService.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const toggleFavorite = async (id: string) => {
    const noteToToggle = notes.find((n) => n.id === id);
    if (!noteToToggle) return;
    const isFav =
      typeof noteToToggle.is_favorite === 'boolean'
        ? noteToToggle.is_favorite
        : !!noteToToggle.isFavorite;
    try {
      const updated = await notesService.updateNote(id, { is_favorite: !isFav });
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      if (selectedNote?.id === id) {
        setSelectedNote(updated);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleSaveRevision = async (originalNote: Note) => {
    if (!originalNote) return;
    setNoteError('');
    try {
      const id = originalNote.id;

      // 1. Identify deleted images (they were in originalNote.images but are no longer in newImageUrls)
      const originalImages = originalNote.images || [];
      const deletedImages = originalImages.filter((img) => !newImageUrls.includes(img.url));

      for (const img of deletedImages) {
        await notesService.removeImage(id, img.url);
      }

      // 2. Identify new files and their corresponding captions
      const actualFiles: File[] = [];
      const actualCaptions: string[] = [];
      newImageFiles.forEach((file, idx) => {
        if (file) {
          actualFiles.push(file);
          actualCaptions.push(newImageCaptions[idx] || '');
        }
      });

      // 3. Perform the PATCH update
      const tags = newTagsString.trim()
        ? newTagsString
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        : undefined;

      const updated = await notesService.updateNote(id, {
        title: newTitle.trim(),
        category: newCategory,
        content: newContent.trim(),
        tags,
        images: actualFiles,
        captions: actualCaptions,
      });

      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setSelectedNote(updated);
      setIsFlipped(false);
    } catch (err) {
      console.error('Error saving revision:', err);
      setNoteError((err as AxiosErrorLike).response?.data?.detail || 'Failed to save revision.');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter Logic: Favorite tab + Category filter + Search query
  const filteredNotes = notes.filter((note) => {
    const isFav = typeof note.is_favorite === 'boolean' ? note.is_favorite : !!note.isFavorite;
    if (selectedTab === 'favorites' && !isFav) {
      return false;
    }
    // 2. Category Folder Filter (Multiselect)
    if (!filterCategories.includes('all') && !filterCategories.includes(note.category)) {
      return false;
    }
    // 3. Search Filter (Title or Content)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(query);
      const matchContent = note.content.toLowerCase().includes(query);
      return matchTitle || matchContent;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="border-granite mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
          <p className="text-gunmetal mt-4 font-['Caveat',_cursive] text-xl font-bold">
            Loading sketchbook...
          </p>
        </div>
      </div>
    );
  }

  // UNAUTHENTICATED VIEW: Centered Elegant card on Alabaster Grey layout
  if (!isAuthenticated || !user) {
    return (
      <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4 md:p-8">
        <main className="w-full max-w-2xl">
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => router.push('/')}
              className="cursor-pointer border-none bg-transparent p-0 transition-transform hover:scale-105 focus:outline-none"
            >
              <Badge
                size="lg"
                colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
                typography={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  fontFamily: 'Caveat, cursive',
                }}
              >
                BrainRot
              </Badge>
            </button>
          </div>

          <Card
            variant="notebook"
            className="flex w-full flex-col items-center bg-white p-8 text-center shadow-xl"
          >
            <h1 className="text-granite mb-3 font-['Caveat',_cursive] text-6xl font-bold tracking-wide">
              BrainRot Notes
            </h1>
            <p className="text-gunmetal mb-8 max-w-md text-lg font-medium">
              A premium, distraction-free sketchbook for scribbling your yaps, genius notes, and
              chaotic thoughts.
            </p>

            <div className="mb-8 flex w-full max-w-md flex-wrap justify-center gap-4">
              <div className="border-granite/30 bg-alabaster-grey/40 max-w-[180px] rounded border-2 p-4 text-left shadow-sm">
                <span className="mb-1 block font-mono text-xs font-bold text-orange-600 uppercase">
                  🚨 High Rot
                </span>
                <p className="text-gunmetal font-['Caveat',_cursive] text-lg font-bold">
                  &quot;Need to buy milk and configure my server&quot;
                </p>
              </div>
              <div className="border-granite/30 bg-alabaster-grey/40 max-w-[180px] rounded border-2 p-4 text-left shadow-sm">
                <span className="mb-1 block font-mono text-xs font-bold text-green-700 uppercase">
                  💡 Genius
                </span>
                <p className="text-gunmetal font-['Caveat',_cursive] text-lg font-bold">
                  &quot;Start writing yaps in HSL colors&quot;
                </p>
              </div>
            </div>

            <div className="flex w-full max-w-sm flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={() => router.push('/auth')}
                colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
                className="w-full text-base font-bold"
              >
                Log In
              </Button>
              <Button
                onClick={() => router.push('/auth?tab=signup')}
                colors={{ bg: '#fff', text: 'var(--granite)', stroke: 'var(--granite)' }}
                className="w-full text-base font-bold hover:bg-slate-50"
              >
                Sign Up
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // AUTHENTICATED VIEW: Clean grid notebook interface perfectly styled
  return (
    <div className="bg-alabaster-grey min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <header className="border-gunmetal/30 mx-auto mb-10 flex max-w-5xl items-center justify-between border-b border-dashed pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTab('all');
              setFilterCategories(['all']);
              router.push('/');
            }}
            className="cursor-pointer border-none bg-transparent p-0 transition-transform hover:scale-105 focus:outline-none"
          >
            <Badge
              size="lg"
              colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
              typography={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                fontFamily: 'Caveat, cursive',
              }}
            >
              BrainRot
            </Badge>
          </button>
          <span className="text-gunmetal hidden font-['Caveat',_cursive] text-2xl font-bold md:inline">
            {'// Personal Workspace'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Avatar
            initials={getInitials(user.fullName)}
            size="sm"
            colors={{
              bg: 'var(--granite)',
              fallbackBg: 'var(--granite)',
              stroke: '#000',
              text: '#fff',
            }}
            typography={{
              fontFamily: 'Caveat, cursive',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
            showBorder
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => router.push('/settings')}
          />
          <Button
            onClick={handleLogout}
            colors={{
              bg: '#fff',
              stroke: 'var(--granite)',
              text: 'var(--granite)',
            }}
            className="hover:bg-red-50"
          >
            Log Out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl">
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          filterCategories={filterCategories}
          setFilterCategories={setFilterCategories}
          onNewNoteClick={() => {
            setNewTitle('');
            setNewCategory('yaps');
            setNewImageUrls([]);
            setTempImageUrl('');
            setNewContent('');
            setNewTagsString('');
            setNoteError('');
            setIsModalOpen(true);
          }}
        />

        {/* Note Cards Workspace Grid */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.length === 0 ? (
            <div className="border-gunmetal/25 col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/40 py-20 text-center">
              <span className="mb-4 text-5xl select-none">💭</span>
              <h3 className="text-granite font-['Caveat',_cursive] text-2xl font-bold">
                No matching notes found...
              </h3>
              <p className="text-gunmetal/60 mt-1 text-xs font-medium tracking-wider uppercase">
                Scribble a new note to pin it here!
              </p>
            </div>
          ) : (
            filteredNotes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={index}
                onClick={() => handleCardClick(note)}
                onToggleFavorite={toggleFavorite}
                getFormattedDate={getFormattedDate}
              />
            ))
          )}
        </div>
      </main>

      <AddNoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNoteError('');
        }}
        noteError={noteError}
        onSubmit={handleAddNote}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        newTagsString={newTagsString}
        setNewTagsString={setNewTagsString}
        newImageUrls={newImageUrls}
        setNewImageUrls={setNewImageUrls}
        newImageCaptions={newImageCaptions}
        setNewImageCaptions={setNewImageCaptions}
        newImageFiles={newImageFiles}
        setNewImageFiles={setNewImageFiles}
        tempImageUrl={tempImageUrl}
        setTempImageUrl={setTempImageUrl}
        tempImageCaption={tempImageCaption}
        setTempImageCaption={setTempImageCaption}
        newContent={newContent}
        setNewContent={setNewContent}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        selectedNote={selectedNote}
        onClose={() => {
          setIsDetailModalOpen(false);
          setIsFlipped(false);
          setSelectedNote(null);
        }}
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        noteError={noteError}
        setNoteError={setNoteError}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        newTagsString={newTagsString}
        setNewTagsString={setNewTagsString}
        newImageUrls={newImageUrls}
        setNewImageUrls={setNewImageUrls}
        newImageCaptions={newImageCaptions}
        setNewImageCaptions={setNewImageCaptions}
        newImageFiles={newImageFiles}
        setNewImageFiles={setNewImageFiles}
        tempImageUrl={tempImageUrl}
        setTempImageUrl={setTempImageUrl}
        tempImageCaption={tempImageCaption}
        setTempImageCaption={setTempImageCaption}
        newContent={newContent}
        setNewContent={setNewContent}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
        setPreviewImageUrl={setPreviewImageUrl}
        onToggleFavorite={(id) => {
          toggleFavorite(id);
          setSelectedNote((prev) => (prev ? { ...prev, is_favorite: !isSelectedNoteFav } : null));
        }}
        onDeleteNote={handleDeleteNote}
        onSaveRevision={() => {
          if (selectedNote) {
            handleSaveRevision(selectedNote);
          }
        }}
        getFormattedDate={getFormattedDate}
      />

      <LightboxModal
        previewImageUrl={previewImageUrl}
        selectedNote={selectedNote}
        onClose={() => setPreviewImageUrl(null)}
      />
    </div>
  );
}
