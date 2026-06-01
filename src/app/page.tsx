'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Card, Input, Button, Avatar, Badge } from 'sketchbook-ui';

export const NOTE_CATEGORIES = [
  'genius',
  'high-rot',
  'yaps',
  'serious',
  'reminder',
  'general',
] as const;
export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

interface Note {
  id: string;
  title: string;
  category: NoteCategory;
  content: string;
  createdAt: string;
  tags?: string[];
  imageUrl?: string;
  imageUrls?: string[];
  isFavorite?: boolean;
}

export default function Home() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Local state for notes app initialized lazily to avoid state-in-effect warning
  const [notes, setNotes] = useState<Note[]>(() => {
    if (globalThis.window !== undefined) {
      const saved = localStorage.getItem('brainrot_notes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load notes:', e);
        }
      }

      // Default starter notes matching the brand colors and tags
      const defaults: Note[] = [
        {
          id: '1',
          title: 'Project Ideas for 2024',
          category: 'genius',
          content:
            "1. AI that writes bad poetry.\n2. Digital garden for plants that don't exist.\n3. A clock that only counts weekend minutes.",
          createdAt: 'Oct 24, 2023',
          tags: ['future', 'creative'],
          isFavorite: true,
        },
        {
          id: '2',
          title: 'Cafe Sketches',
          category: 'yaps',
          content: 'The barista looked like a wizard today. Note: try more cross-hatching.',
          createdAt: 'Oct 22, 2023',
          imageUrls: ['/cafe_sketches.png'],
          isFavorite: false,
        },
        {
          id: '3',
          title: 'Grocery List?',
          category: 'high-rot',
          content: '~~apples~~\nInk for the printer (CRITICAL)\nThose weird crackers I liked.',
          createdAt: 'Oct 20, 2023',
          isFavorite: false,
        },
        {
          id: '4',
          title: 'Deep Thoughts on Minimalism',
          category: 'serious',
          content:
            "Minimalism isn't about having nothing. It's about making space for the things that actually matter. Like this notebook. It feels like real paper, but I can't spill coffee on it (physically). Digital permanence vs Analog feel.",
          createdAt: 'Oct 15, 2023',
          isFavorite: false,
        },
        {
          id: '5',
          title: 'Call Mom',
          category: 'reminder',
          content:
            "She wanted to hear about the new job. Don't forget to mention the coffee machine is free.",
          createdAt: 'Reminder',
          isFavorite: true,
        },
      ];
      localStorage.setItem('brainrot_notes', JSON.stringify(defaults));
      return defaults;
    }
    return [];
  });

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<NoteCategory>('yaps');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTagsString, setNewTagsString] = useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>(['all']);
  const [selectedTab, setSelectedTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteError, setNoteError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States for detailed flippable modal (Flow 2)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleCardClick = (note: Note) => {
    setSelectedNote(note);
    setNewTitle(note.title);
    setNewCategory(note.category);
    setCurrentImageIndex(0);

    // Load existing image(s) to multiple images state
    if (note.imageUrls && note.imageUrls.length > 0) {
      setNewImageUrls(note.imageUrls);
    } else if (note.imageUrl) {
      setNewImageUrls([note.imageUrl]);
    } else {
      setNewImageUrls([]);
    }
    setNewImageUrl('');
    setTempImageUrl('');

    setNewContent(note.content);
    setNewTagsString(note.tags ? note.tags.join(', ') : '');
    setIsFlipped(false);
    setIsDetailModalOpen(true);
  };

  // Prevent body scroll when modals are open
  React.useEffect(() => {
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
  React.useEffect(() => {
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

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDetailModalOpen, isModalOpen, previewImageUrl]);

  // Dynamic DOM effect to allow sketchbook-ui inputs to stretch to full width
  React.useEffect(() => {
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

  // Save notes helper
  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem('brainrot_notes', JSON.stringify(updated));
  };

  const toggleFilterCategory = (cat: string) => {
    setSelectedTab('all');
    if (cat === 'all') {
      setFilterCategories(['all']);
    } else {
      setFilterCategories((prev) => {
        const next = prev.filter((c) => c !== 'all');
        if (next.includes(cat)) {
          const filtered = next.filter((c) => c !== cat);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...next, cat];
        }
      });
    }
  };

  const handleAddNote = (e: React.SyntheticEvent) => {
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

    const note: Note = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      tags,
      imageUrls: newImageUrls.filter(Boolean),
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isFavorite: false,
    };

    const updated = [note, ...notes];
    saveNotes(updated);

    // Reset state
    setNewTitle('');
    setNewImageUrl('');
    setNewImageUrls([]);
    setTempImageUrl('');
    setNewContent('');
    setNewTagsString('');
    setNewCategory('yaps');
    setIsModalOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  const toggleFavorite = (id: string) => {
    const updated = notes.map((n) => {
      if (n.id === id) {
        return { ...n, isFavorite: !n.isFavorite };
      }
      return n;
    });
    saveNotes(updated);
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
    // 1. Tab Filter (All vs Favorites)
    if (selectedTab === 'favorites' && !note.isFavorite) {
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

  // UNAUTHENTICATED VIEW: Centered Elegant card on Alabaster Grey layout, matching Auth pages exactly
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

  // AUTHENTICATED VIEW: Clean grid notebook interface perfectly styled with other page elements
  return (
    <div className="bg-alabaster-grey min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Header - Matches SettingsForm exactly */}
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
        {/* Workspace Title & Controls */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-granite font-['Caveat',_cursive] text-5xl font-bold tracking-wide">
              My Collective Brainrot
            </h1>
            <p className="text-gunmetal mt-2 text-lg font-medium">
              Messy thoughts for organized people.{' '}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input using sketchbook-ui */}
            <div className="w-50">
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="sm"
              />
            </div>
            {/* New Note Button using sketchbook-ui */}
            <Button
              onClick={() => {
                setNewTitle('');
                setNewCategory('yaps');
                setNewImageUrl('');
                setNewImageUrls([]);
                setTempImageUrl('');
                setNewContent('');
                setNewTagsString('');
                setNoteError('');
                setIsModalOpen(true);
              }}
              colors={{
                bg: 'var(--granite)',
                stroke: '#000',
                text: '#fff',
              }}
            >
              + New Note
            </Button>
          </div>
        </div>

        {/* Filters and Navigation Switcher */}
        <div className="border-gunmetal/15 mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          {/* Active Status Tabs */}
          <div className="bg-ash-grey/15 border-dust-grey/30 flex rounded-xl border p-1">
            <button
              onClick={() => {
                setSelectedTab('all');
                setFilterCategories(['all']);
              }}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                selectedTab === 'all' && filterCategories.includes('all')
                  ? 'text-granite bg-white shadow-sm'
                  : 'text-gunmetal/60 hover:text-gunmetal'
              }`}
            >
              All Notes
            </button>
            <button
              onClick={() => {
                setSelectedTab('favorites');
                setFilterCategories(['all']);
              }}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                selectedTab === 'favorites'
                  ? 'text-granite bg-white shadow-sm'
                  : 'text-gunmetal/60 hover:text-gunmetal'
              }`}
            >
              ⭐ Favorites
            </button>
          </div>

          {/* Folder Categories & Reset */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gunmetal/60 text-sm font-semibold tracking-wider uppercase">
                Folder:
              </span>
              <div className="flex flex-wrap gap-1">
                {['all', ...NOTE_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleFilterCategory(cat)}
                    className={`rounded-lg border-2 px-3 py-1 font-mono text-xs font-bold uppercase transition-all ${
                      filterCategories.includes(cat)
                        ? 'bg-granite border-granite text-white'
                        : 'text-gunmetal border-dust-grey/50 hover:border-gunmetal bg-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear All Filters Button */}
            {(!filterCategories.includes('all') ||
              searchQuery.trim() !== '' ||
              selectedTab !== 'all') && (
              <button
                onClick={() => {
                  setFilterCategories(['all']);
                  setSearchQuery('');
                  setSelectedTab('all');
                }}
                className="animate-fade-in flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-300 bg-red-50/80 px-2.5 py-1.5 font-mono text-xs font-bold text-red-600 uppercase shadow-sm transition-all hover:border-red-400 hover:bg-red-100 active:scale-95"
                title="Clear all active filters"
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>

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
            filteredNotes.map((note, index) => {
              const isFavorite = note.isFavorite;

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
                  key={note.id}
                  variant="notebook"
                  className={`flex cursor-pointer flex-col justify-between bg-white p-6 shadow-md transition-all duration-250 hover:-translate-y-1.5 hover:scale-[1.015] hover:rotate-0 hover:shadow-xl ${sizeClass} ${rotClass} ${
                    note.title.toLowerCase().includes('minimalism') ? 'md:col-span-2' : ''
                  }`}
                  onClick={() => handleCardClick(note)}
                >
                  <div>
                    {/* Note Date and Favorite Star */}
                    <div className="border-gunmetal/15 mb-3 flex items-center justify-between border-b border-dashed pb-2">
                      <span className="text-granite/60 font-mono text-[10px] font-bold tracking-wider uppercase">
                        {note.createdAt}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(note.id);
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
                        const textToRender = isLong
                          ? note.content.slice(0, maxChars) + '...'
                          : note.content;
                        return textToRender.includes('~~')
                          ? textToRender.split('\n').map((line, i) => {
                              const lineKey = `${note.id}-line-${i}-${line}`;
                              if (line.startsWith('~~') && line.endsWith('~~')) {
                                return (
                                  <span
                                    key={lineKey}
                                    className="text-gunmetal/40 block line-through"
                                  >
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
                        const imgs =
                          note.imageUrls && note.imageUrls.length > 0
                            ? note.imageUrls
                            : note.imageUrl
                              ? [note.imageUrl]
                              : [];
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
            })
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop button */}
          <button
            type="button"
            className="fixed inset-0 h-full w-full cursor-pointer border-none bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsModalOpen(false);
              setNoteError('');
            }}
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
              onClick={() => {
                setIsModalOpen(false);
                setNoteError('');
              }}
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

            <form onSubmit={handleAddNote} className="flex w-full flex-1 flex-col justify-between">
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
                            <div className="pt-1.5 text-center">
                              <p className="text-gunmetal/60 font-['Caveat',_cursive] text-[10px] leading-none font-bold">
                                Photo {idx + 1}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Input field to add a new URL (shown only if < 5 images exist) */}
                  {newImageUrls.length < 5 && (
                    <div className="mt-2 flex items-center gap-2">
                      <label htmlFor="note-image-url" className="sr-only">
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
                              setTempImageUrl('');
                            }
                          }
                        }}
                        placeholder="Paste a photo URL and click Add"
                        className="flex-1"
                        size="md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempImageUrl.trim()) {
                            setNewImageUrls([...newImageUrls, tempImageUrl.trim()]);
                            setTempImageUrl('');
                          }
                        }}
                        className="bg-granite flex cursor-pointer items-center justify-center self-stretch rounded-lg border border-black/25 px-3 py-2 font-mono text-xs font-bold tracking-wider text-white uppercase shadow transition-all hover:bg-slate-800 active:scale-95"
                      >
                        Add
                      </button>
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
                    onClick={() => {
                      setIsModalOpen(false);
                      setNoteError('');
                    }}
                    colors={{ bg: '#fff', text: 'var(--granite)', stroke: 'var(--granite)' }}
                    className="hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
                  >
                    Pin Note
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 3D Flippable Note Details and Edit Modal */}
      {isDetailModalOpen && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          {/* Backdrop */}
          <button
            type="button"
            className="animate-fade-in fixed inset-0 h-full w-full cursor-pointer border-none bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsDetailModalOpen(false);
              setIsFlipped(false);
              setSelectedNote(null);
            }}
            aria-label="Close detailed view"
          />

          {/* 3D Flip Card Container */}
          <div
            className="flip-card-container relative z-10 w-full max-w-[850px]"
            style={{ minHeight: '670px' }}
          >
            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* FRONT: Detailed View */}
              <div className="flip-card-front">
                <Card
                  variant="notebook"
                  className="compact-modal relative w-full select-text"
                  style={{ minHeight: '670px', height: '670px' }}
                >
                  <div className="flex h-full w-full flex-col justify-between">
                    {/* Absolute Top-Right Controls Container (Actions + Close Button aligned) */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5 select-none">
                      {/* Favorite Button */}
                      <button
                        onClick={() => {
                          toggleFavorite(selectedNote.id);
                          setSelectedNote((prev) =>
                            prev ? { ...prev, isFavorite: !prev.isFavorite } : null
                          );
                        }}
                        className="text-gunmetal flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:scale-115 active:scale-90"
                        title={selectedNote.isFavorite ? 'Unfavorite' : 'Favorite'}
                      >
                        <svg
                          className={`h-5 w-5 ${selectedNote.isFavorite ? 'fill-yellow-400 text-yellow-500' : 'text-gunmetal/70'}`}
                          fill={selectedNote.isFavorite ? 'currentColor' : 'none'}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.564-.371-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.519-4.674z"
                          />
                        </svg>
                      </button>

                      {/* Edit Button (Scribbled pencil icon, flips to back!) */}
                      <button
                        onClick={() => setIsFlipped(true)}
                        className="text-gunmetal flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:scale-115 active:scale-90"
                        title="Edit Note"
                      >
                        <svg
                          className="text-gunmetal/80 h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.2}
                        >
                          {/* Crooked Hand-Drawn Pencil Outline */}
                          <path
                            d="M13.5 4.5l6 6M4 20h4L20 8.5 15.5 4 4 16v4z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Scribbled details on pencil barrel */}
                          <path d="M6 18l1.5-1.5M16 8l1.5-1.5" strokeLinecap="round" />
                        </svg>
                      </button>

                      {/* Delete Button (Scribbled crooked trash can icon) */}
                      <button
                        onClick={() => {
                          handleDeleteNote(selectedNote.id);
                          setIsDetailModalOpen(false);
                          setIsFlipped(false);
                          setSelectedNote(null);
                        }}
                        className="text-gunmetal flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:scale-115 active:scale-90"
                        title="Delete Note"
                      >
                        <svg
                          className="text-gunmetal/80 h-5 w-5"
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

                      {/* Hand-sketched divider line */}
                      <div className="bg-gunmetal/15 mx-0.5 h-5 w-[1.5px]" />

                      {/* Close Button */}
                      <button
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          setIsFlipped(false);
                          setSelectedNote(null);
                        }}
                        aria-label="Close detailed view modal"
                        className="text-gunmetal flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:scale-115 active:scale-90"
                      >
                        <svg
                          className="text-gunmetal/85 h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Header: Category Badge and Date (STATIC) */}
                    <div className="border-gunmetal/15 mb-4 flex w-full items-center justify-between border-b border-dashed pb-3 select-none">
                      {/* Left: Category Badge & Created At Date beside it */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-granite rounded-lg px-3 py-1 font-mono text-xs font-bold tracking-wide text-white uppercase">
                          {selectedNote.category}
                        </span>
                        <span className="text-granite/70 font-mono text-xs font-bold tracking-wider uppercase">
                          Created: {selectedNote.createdAt}
                        </span>
                      </div>
                    </div>

                    {/* SCROLLABLE BODY CONTAINER */}
                    <div
                      className="mb-4 flex-1 scrollbar-thin overflow-y-auto pr-1.5 select-text"
                      style={{ maxHeight: '495px' }}
                    >
                      {/* Note Title */}
                      <h2 className="text-granite mb-4 font-['Caveat',_cursive] text-5xl font-bold tracking-wide">
                        {selectedNote.title}
                      </h2>

                      {/* Note Images (Polaroid style deck!) */}
                      {(() => {
                        const imgs =
                          selectedNote.imageUrls && selectedNote.imageUrls.length > 0
                            ? selectedNote.imageUrls
                            : selectedNote.imageUrl
                              ? [selectedNote.imageUrl]
                              : [];

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
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(prevIndex);
                                }}
                                className="group absolute bottom-2 left-4 z-10 cursor-pointer transition-all duration-300 hover:-translate-x-1 hover:scale-110"
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
                              </div>
                            )}

                            {/* Active Image Card */}
                            <div className="relative">
                              {(() => {
                                const activeUrl = imgs[currentImageIndex];
                                const activeRotation =
                                  rotations[currentImageIndex % rotations.length];
                                return (
                                  <div
                                    onClick={() => setPreviewImageUrl(activeUrl)}
                                    className={`bg-white p-3 shadow-md ${activeRotation} border-gunmetal/80 w-[200px] cursor-pointer border-2 transition-all duration-300 hover:scale-105 hover:rotate-0`}
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
                                        Snapshot {currentImageIndex + 1} of {imgs.length}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Next Image Peeking Card */}
                            {imgs.length > 1 && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(nextIndex);
                                }}
                                className="group absolute right-4 bottom-2 z-10 cursor-pointer transition-all duration-300 hover:translate-x-1 hover:scale-110"
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
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Content */}
                      <div className="paper-sheet-lined mx-auto min-h-[180px] w-[650px] max-w-full p-4 select-text">
                        <p
                          className={`text-gunmetal/90 font-['Patrick_Hand',_cursive] text-xl leading-relaxed whitespace-pre-wrap ${selectedNote.category === 'reminder' ? 'text-teal-850 italic' : ''}`}
                        >
                          {selectedNote.content.includes('~~')
                            ? selectedNote.content.split('\n').map((line, i) => {
                                const lineKey = `${selectedNote.id}-detail-line-${i}`;
                                if (line.startsWith('~~') && line.endsWith('~~')) {
                                  return (
                                    <span
                                      key={lineKey}
                                      className="text-gunmetal/40 block line-through"
                                    >
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
                            : selectedNote.content}
                        </p>
                      </div>
                    </div>

                    {/* Footer Container (STATIC) */}
                    <div className="border-gunmetal/10 mt-auto border-t pt-3 select-none">
                      {/* Tags Row */}
                      <div className="flex flex-wrap gap-2">
                        {selectedNote.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="bg-ash-grey/30 text-granite rounded px-2.5 py-1 font-mono text-xs font-bold tracking-wider uppercase"
                          >
                            #{tag}
                          </span>
                        ))}
                        {!selectedNote.tags && (
                          <span className="bg-ash-grey/30 text-granite rounded px-2.5 py-1 font-mono text-xs font-bold tracking-wider uppercase">
                            #{selectedNote.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flip-card-back">
                <Card
                  variant="notebook"
                  className="compact-modal relative w-full"
                  style={{ minHeight: '670px', height: '670px' }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setIsFlipped(false);
                      setSelectedNote(null);
                    }}
                    aria-label="Close edit detailed modal"
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
                    Edit Note Draft
                  </h2>

                  {noteError && (
                    <div className="animate-shake text-md mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-2.5 text-center font-bold text-red-600 shadow-sm select-none">
                      ⚠️ {noteError}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
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

                      const updatedNote: Note = {
                        ...selectedNote,
                        title: newTitle.trim(),
                        category: newCategory,
                        content: newContent.trim(),
                        tags,
                        imageUrls: newImageUrls.filter(Boolean),
                        imageUrl: undefined,
                      } as Note;

                      // Update state
                      const updated = notes.map((n) =>
                        n.id === selectedNote.id ? updatedNote : n
                      );
                      saveNotes(updated);
                      setSelectedNote(updatedNote);

                      // Flip card back in 3D!
                      setIsFlipped(false);
                    }}
                    className="flex w-full flex-1 flex-col justify-between"
                  >
                    {/* SCROLLABLE FIELDS CONTAINER */}
                    <div className="max-h-[520px] w-full flex-1 scrollbar-thin space-y-4 overflow-y-auto pr-1.5">
                      <div>
                        <label
                          htmlFor="edit-note-title"
                          className="text-gunmetal text-md mb-0.5 ml-1 block font-semibold"
                        >
                          Title
                        </label>
                        <Input
                          id="edit-note-title"
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
                          htmlFor="edit-note-tags"
                          className="text-gunmetal text-md mb-0.5 ml-1 block font-semibold"
                        >
                          Tags (Comma separated)
                        </label>
                        <Input
                          id="edit-note-tags"
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
                                          <path
                                            d="M10.2 10.5v6.5 M13.8 10.5v6.5"
                                            strokeLinecap="round"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="pt-1.5 text-center">
                                    <p className="text-gunmetal/60 font-['Caveat',_cursive] text-[10px] leading-none font-bold">
                                      Photo {idx + 1}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Input field to add a new URL (shown only if < 5 images exist) */}
                        {newImageUrls.length < 5 && (
                          <div className="mt-2 flex items-center gap-2">
                            <label htmlFor="edit-note-image-url" className="sr-only">
                              Image URL
                            </label>
                            <Input
                              id="edit-note-image-url"
                              type="text"
                              value={tempImageUrl}
                              onChange={(e) => setTempImageUrl(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (tempImageUrl.trim()) {
                                    setNewImageUrls([...newImageUrls, tempImageUrl.trim()]);
                                    setTempImageUrl('');
                                  }
                                }
                              }}
                              placeholder="Paste a photo URL and click Add"
                              className="flex-1"
                              size="md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (tempImageUrl.trim()) {
                                  setNewImageUrls([...newImageUrls, tempImageUrl.trim()]);
                                  setTempImageUrl('');
                                }
                              }}
                              className="bg-granite flex cursor-pointer items-center justify-center self-stretch rounded-lg border border-black/25 px-3 py-2 font-mono text-xs font-bold tracking-wider text-white uppercase shadow transition-all hover:bg-slate-800 active:scale-95"
                            >
                              Add
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="edit-note-content"
                          className="text-gunmetal text-md mb-0.5 ml-1 block font-semibold"
                        >
                          Scribble Content
                        </label>
                        <textarea
                          id="edit-note-content"
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
                          onClick={() => setIsFlipped(false)}
                          colors={{ bg: '#fff', text: 'var(--granite)', stroke: 'var(--granite)' }}
                          className="hover:bg-slate-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
                        >
                          Save Revision
                        </Button>
                      </div>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Polaroid Image Lightbox/Preview Modal */}
      {previewImageUrl && (
        <div
          className="bg-gunmetal/85 animate-fade-in fixed inset-0 z-[99999] flex cursor-zoom-out items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setPreviewImageUrl(null)}
        >
          {/* Polaroid frame around the previewed image */}
          <div
            className="animate-scale-up border-gunmetal relative max-h-[95vh] max-w-[95vw] border-4 bg-white p-4 pb-12 shadow-2xl md:max-w-[550px]"
            style={{
              borderRadius: '12px 24px 14px 30px / 30px 12px 30px 14px',
              transform: 'rotate(-1deg)',
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the card itself
          >
            {/* Close button inside polaroid frame */}
            <button
              onClick={() => setPreviewImageUrl(null)}
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
                ✨ Snapshot Preview ✨
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
