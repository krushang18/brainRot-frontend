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
          imageUrl: '/cafe_sketches.png',
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
  const [newContent, setNewContent] = useState('');
  const [newTagsString, setNewTagsString] = useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>(['all']);
  const [selectedTab, setSelectedTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteError, setNoteError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      imageUrl: newImageUrl.trim() || undefined,
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
            <span
              onClick={() => router.push('/')}
              className="cursor-pointer transition-transform hover:scale-105"
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
            </span>
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
          <span
            onClick={() => {
              setSearchQuery('');
              setSelectedTab('all');
              setFilterCategories(['all']);
              router.push('/');
            }}
            className="cursor-pointer transition-transform hover:scale-105"
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
          </span>
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
              onClick={() => setIsModalOpen(true)}
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
                  className={`flex flex-col justify-between bg-white p-6 shadow-md transition-all duration-250 hover:-translate-y-1.5 hover:scale-[1.015] hover:rotate-0 hover:shadow-xl ${sizeClass} ${rotClass} ${
                    note.title.toLowerCase().includes('minimalism') ? 'md:col-span-2' : ''
                  }`}
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

                    {/* Note Image (Optional) */}
                    {note.imageUrl && (
                      <div className="border-dust-grey/30 bg-alabaster-grey/25 mb-3 w-full overflow-hidden rounded-lg border p-1 select-none">
                        <Image
                          src={note.imageUrl}
                          alt={note.title}
                          width={500}
                          height={300}
                          unoptimized
                          className="h-auto max-h-48 w-full rounded object-cover"
                        />
                      </div>
                    )}

                    {/* Note Content */}
                    <p
                      className={`text-gunmetal/90 font-['Patrick_Hand',_cursive] text-lg leading-relaxed whitespace-pre-wrap ${
                        note.category === 'reminder' ? 'text-teal-850 italic' : ''
                      }`}
                    >
                      {note.content.includes('~~')
                        ? note.content.split('\n').map((line, i) => {
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
                        : note.content}
                    </p>
                  </div>

                  {/* Note Footer: Tags and Actions */}
                  <div className="border-gunmetal/15 mt-4 flex items-center justify-between border-t border-dashed pt-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-ash-grey/20 text-granite rounded px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase"
                        >
                          #{tag}
                        </span>
                      ))}
                      {!note.tags && (
                        <span className="text-gunmetal/40 font-mono text-[9px] font-bold tracking-wider uppercase">
                          {note.category}
                        </span>
                      )}
                    </div>

                    {/* Delete Note Action */}
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="cursor-pointer font-mono text-[10px] font-bold tracking-wider text-red-600 uppercase transition-colors hover:text-red-800"
                    >
                      Delete
                    </button>
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
            style={{ maxWidth: '850px', width: '100%', minHeight: '580px' }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setNoteError('');
              }}
              aria-label="Close note modal"
              className="text-gunmetal absolute top-3.5 right-3.5 cursor-pointer transition-transform hover:scale-110"
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

            <h2 className="text-granite mb-4 font-['Caveat',_cursive] text-4xl font-bold">
              Scribble a Note
            </h2>

            {noteError && (
              <div className="animate-shake mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-center text-lg font-bold text-red-600 shadow-sm">
                ⚠️ {noteError}
              </div>
            )}

            <form onSubmit={handleAddNote} className="space-y-5">
              <div>
                <label
                  htmlFor="note-title"
                  className="text-gunmetal mb-1 ml-1 block text-lg font-semibold"
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
                  size="lg"
                />
              </div>

              <div>
                <span className="text-gunmetal mb-1 ml-1 block text-lg font-semibold">
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
                        className={`cursor-pointer rounded-lg border px-3.5 py-2 font-mono text-xs font-bold tracking-wide uppercase transition-all ${
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

              <div>
                <label
                  htmlFor="note-tags"
                  className="text-gunmetal mb-1 ml-1 block text-lg font-semibold"
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
                  size="lg"
                />
              </div>

              <div>
                <label
                  htmlFor="note-image"
                  className="text-gunmetal mb-1 ml-1 block text-lg font-semibold"
                >
                  Image URL (Optional)
                </label>
                <Input
                  id="note-image"
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="e.g. /cafe_sketches.png or https://example.com/image.png"
                  className="w-full"
                  size="lg"
                />
              </div>

              <div>
                <label
                  htmlFor="note-content"
                  className="text-gunmetal mb-1 ml-1 block text-lg font-semibold"
                >
                  Scribble Content
                </label>
                <textarea
                  id="note-content"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Type your thoughts here..."
                  rows={6}
                  className="border-dust-grey focus:border-granite w-full rounded-lg border bg-white p-3.5 font-['Patrick_Hand',_cursive] text-lg shadow-sm select-text focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 select-none">
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
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
