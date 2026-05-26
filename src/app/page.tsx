'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, Input, Button, Badge } from 'sketchbook-ui';

interface Note {
  id: string;
  title: string;
  category: 'genius' | 'high-rot' | 'yaps' | 'serious';
  content: string;
  createdAt: string;
}

export default function Home() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();

  // Local state for notes app initialized lazily to avoid state-in-effect warning
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brainrot_notes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load notes:', e);
        }
      }
      // Default starter notes
      const defaults: Note[] = [
        {
          id: '1',
          title: 'Welcome to BrainRot! 🧠',
          category: 'genius',
          content:
            'Write your thoughts, yaps, and serious ideas in this sketchbook. Keep it locked, sync with other devices, and let your brain rot gracefully!',
          createdAt: new Date().toLocaleDateString(),
        },
        {
          id: '2',
          title: 'Scribbling is therapeutic',
          category: 'yaps',
          content:
            'Just random midnight thoughts. Remember to update your password in the settings tab to keep your binder secure.',
          createdAt: new Date().toLocaleDateString(),
        },
      ];
      localStorage.setItem('brainrot_notes', JSON.stringify(defaults));
      return defaults;
    }
    return [];
  });
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'genius' | 'high-rot' | 'yaps' | 'serious'>(
    'yaps'
  );
  const [newContent, setNewContent] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [noteError, setNoteError] = useState('');
  const [showCoverOpen, setShowCoverOpen] = useState(false);

  // Save notes helper
  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem('brainrot_notes', JSON.stringify(updated));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    setNoteError('');

    if (!newTitle.trim()) {
      setNoteError('Title is required to pin a note!');
      return;
    }
    if (!newContent.trim()) {
      setNoteError('Scribble content cannot be empty!');
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [note, ...notes];
    saveNotes(updated);
    setNewTitle('');
    setNewContent('');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'genius':
        return { label: '💡 Genius Idea', bg: '#893168', text: '#fff' };
      case 'high-rot':
        return { label: '🚨 High Rot', bg: '#ef4444', text: '#fff' };
      case 'serious':
        return { label: '📝 Serious Stuff', bg: '#475841', text: '#fff' };
      default:
        return { label: '💭 Late Night Yap', bg: '#3f403f', text: '#fff' };
    }
  };

  const filteredNotes =
    filterCategory === 'all' ? notes : notes.filter((n) => n.category === filterCategory);

  // loading state
  if (isLoading) {
    return (
      <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="border-granite mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
          <p className="text-gunmetal mt-4 font-['Caveat',_cursive] text-2xl font-bold">
            Opening your Sketchbook...
          </p>
        </div>
      </div>
    );
  }

  // UNAUTHENTICATED VIEW: Elegant Skeuomorphic Sketchbook Cover Page
  if (!isAuthenticated) {
    return (
      <div className="bg-alabaster-grey relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 select-none">
        {/* Dynamic hand-drawn margin line */}
        <div className="border-gunmetal/20 absolute top-0 bottom-0 left-8 w-0.5 border-l border-dashed md:left-24"></div>

        <div
          className={`border-gunmetal/20 relative w-full max-w-2xl transform overflow-hidden rounded-2xl border bg-white shadow-[8px_8px_0px_0px_rgba(63,64,63,0.15)] transition-all duration-700 ease-out ${showCoverOpen ? 'scale-[1.02] rotate-[-3deg]' : 'hover:scale-[1.01]'}`}
          onMouseEnter={() => setShowCoverOpen(true)}
          onMouseLeave={() => setShowCoverOpen(false)}
        >
          {/* Notebook Binder Rings (Left Edge) */}
          <div className="border-gunmetal/15 bg-ash-grey/10 absolute top-0 bottom-0 left-0 flex w-8 flex-col justify-around border-r border-dashed py-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="from-gunmetal to-dust-grey -ml-5 h-3 w-10 rotate-[-5deg] transform rounded-full bg-gradient-to-r shadow-md"
              ></div>
            ))}
          </div>

          <div className="flex flex-col items-center py-16 pr-8 pl-12 text-center">
            {/* Playful Floating Badge */}
            <Badge
              colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
              className="mb-6 rotate-2 animate-bounce font-mono text-xs tracking-wider uppercase"
            >
              🔒 Secure Personal Notes
            </Badge>

            {/* Handwritten Main Title */}
            <h1 className="text-gunmetal mb-3 rotate-[-1deg] transform font-['Caveat',_cursive] text-6xl leading-none font-extrabold tracking-tight md:text-7xl">
              BrainRot Notes
            </h1>
            <p className="text-gunmetal/70 mb-8 max-w-md text-lg font-medium">
              A premium, distraction-free sketchbook for scribbling your yaps, genius notes, and
              chaotic thoughts.
            </p>

            {/* Hand-drawn Polaroids / Mock Note Cards */}
            <div className="mb-10 flex w-full max-w-md rotate-1 transform flex-wrap justify-center gap-4">
              <div className="max-w-[180px] rotate-[-4deg] rounded border border-yellow-200/80 bg-[#fffbeb] p-4 text-left shadow-sm">
                <span className="mb-1 block font-mono text-xs text-yellow-600">🚨 HIGH ROT</span>
                <p className="text-gunmetal font-['Caveat',_cursive] text-lg leading-tight font-bold">
                  &quot;Need to buy milk and configure my server&quot;
                </p>
              </div>
              <div className="max-w-[180px] rotate-[3deg] rounded border border-pink-200/80 bg-[#fdf2f8] p-4 text-left shadow-sm">
                <span className="mb-1 block font-mono text-xs text-pink-600">💡 GENIUS</span>
                <p className="text-gunmetal font-['Caveat',_cursive] text-lg leading-tight font-bold">
                  &quot;Start writing yaps in HSL colors&quot;
                </p>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex w-full max-w-sm flex-col justify-center gap-4 px-4 sm:flex-row">
              <Button
                onClick={() => router.push('/auth')}
                colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
                className="w-full text-base font-bold shadow-[3px_3px_0px_0px_#000] transition-all hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000]"
              >
                Open Notebook (Login)
              </Button>
              <Button
                onClick={() => router.push('/auth?tab=signup')}
                colors={{ bg: '#fff', text: 'var(--gunmetal)', stroke: 'var(--gunmetal)' }}
                className="hover:bg-ash-grey/10 w-full text-base font-bold transition-colors"
              >
                Get a Binder (Sign Up)
              </Button>
            </div>
          </div>
        </div>

        {/* Small Creative Footer */}
        <p className="text-gunmetal/40 mt-8 font-mono text-xs">
          Built with premium sketchbook aesthetics. © 2026 BrainRot Inc.
        </p>
      </div>
    );
  }

  // AUTHENTICATED VIEW: Full Lined-Paper Notes Dashboard
  return (
    <div className="bg-alabaster-grey min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <header className="border-gunmetal/30 mx-auto mb-8 flex max-w-6xl items-center justify-between border-b border-dashed pb-4">
        <div className="flex items-center gap-3">
          <Badge
            size="lg"
            colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
            typography={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'Caveat, cursive' }}
          >
            BrainRot Notes
          </Badge>
          <span className="text-gunmetal hidden font-['Caveat',_cursive] text-2xl font-bold md:inline">
            {'// Welcome back, '}
            {user?.fullName || 'Yapper'}
            {'!'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push('/settings')}
            colors={{ bg: '#fff', stroke: 'var(--gunmetal)', text: 'var(--gunmetal)' }}
            className="px-3 py-1 text-xs font-bold"
          >
            ⚙️ Settings
          </Button>
          <Button
            onClick={async () => {
              await logout();
              router.push('/auth');
            }}
            colors={{ bg: '#fff', stroke: '#ef4444', text: '#ef4444' }}
            className="px-3 py-1 text-xs font-bold hover:bg-red-50"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* LEFT SIDEBAR: Write Note (Scribble Lined Pad) */}
          <div className="lg:col-span-5">
            <Card variant="notebook" className="relative overflow-hidden bg-white p-6 shadow-lg">
              {/* Top binder rings mockup */}
              <div className="bg-ash-grey/20 border-gunmetal/10 absolute top-0 right-0 left-0 flex h-4 justify-around border-b px-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gunmetal/40 h-3 w-3 rounded-full"></div>
                ))}
              </div>

              <div className="mt-4">
                <h2 className="text-granite mb-4 font-['Caveat',_cursive] text-3xl font-extrabold">
                  Scribble a Note
                </h2>

                {noteError && (
                  <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">
                    ⚠️ {noteError}
                  </div>
                )}

                <form onSubmit={handleAddNote} className="space-y-4">
                  <div>
                    <label className="text-gunmetal mb-1 block text-sm font-bold">Title</label>
                    <Input
                      type="text"
                      placeholder="e.g. Brainstorming session"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      colors={{ stroke: 'var(--dust-grey)' }}
                      className="w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-gunmetal mb-1 block text-sm font-bold">
                      Category Tag
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['yaps', 'genius', 'high-rot', 'serious'] as const).map((cat) => {
                        const active = newCategory === cat;
                        const details = getCategoryDetails(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewCategory(cat)}
                            className="flex items-center justify-center rounded border p-2 text-xs font-bold transition-all"
                            style={{
                              backgroundColor: active ? details.bg : '#fff',
                              color: active ? details.text : 'var(--gunmetal)',
                              borderColor: active ? '#000' : 'var(--dust-grey)',
                              transform: active ? 'scale(1.02)' : 'none',
                              boxShadow: active ? '2px 2px 0px 0px #000' : 'none',
                            }}
                          >
                            {details.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-gunmetal mb-1 block text-sm font-bold">
                      Your Scribbles
                    </label>
                    <textarea
                      placeholder="Type your yaps here... Let your brain leak onto this paper."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={6}
                      className="border-dust-grey focus:ring-granite w-full rounded-lg border bg-[linear-gradient(#f9fafb_95%,#e5e7eb_5%)] bg-[length:100%_24px] bg-local p-3 font-['Caveat',_cursive] text-lg text-sm leading-6 focus:ring-2 focus:outline-none"
                      style={{ border: '1px solid var(--dust-grey)' }}
                    />
                  </div>

                  <Button
                    type="submit"
                    colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
                    className="w-full py-2 text-sm font-bold shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000]"
                  >
                    Pin onto Corkboard
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* RIGHT VIEW: Infinite Corkboard Canvas of Saved Notes */}
          <div className="space-y-6 lg:col-span-7">
            {/* Filter Panel */}
            <div className="border-gunmetal/15 flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white p-4 shadow-sm">
              <span className="text-gunmetal/70 text-xs font-bold tracking-wider uppercase">
                Filter Notebook:
              </span>
              <div className="flex flex-wrap gap-1">
                {['all', 'yaps', 'genius', 'high-rot', 'serious'].map((cat) => {
                  const active = filterCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                        active
                          ? 'bg-gunmetal border-black text-white shadow-sm'
                          : 'bg-alabaster-grey/50 text-gunmetal/70 hover:bg-alabaster-grey border-transparent'
                      }`}
                    >
                      {cat === 'all' ? '🌈 All Notes' : getCategoryDetails(cat).label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Corkboard Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredNotes.length === 0 ? (
                <div className="border-gunmetal/25 col-span-full rounded-2xl border border-dashed bg-white/50 py-16 text-center">
                  <span className="text-4xl select-none">💭</span>
                  <p className="text-gunmetal mt-3 font-['Caveat',_cursive] text-2xl font-bold">
                    No notes pinned here.
                  </p>
                  <p className="text-gunmetal/50 mt-1 text-xs">
                    Scribble a new yap on the left pad and pin it!
                  </p>
                </div>
              ) : (
                filteredNotes.map((note, index) => {
                  const details = getCategoryDetails(note.category);
                  // Apply slightly random rotations to give true skeuomorphic corkboard feel
                  const rotations = [
                    'rotate-[-1.5deg]',
                    'rotate-[1.2deg]',
                    'rotate-[-0.8deg]',
                    'rotate-[1.5deg]',
                  ];
                  const rotClass = rotations[index % rotations.length];

                  return (
                    <div
                      key={note.id}
                      className={`flex min-h-[180px] transform flex-col justify-between rounded-xl border border-yellow-200/80 bg-[#fffbeb] p-5 shadow-md ${rotClass} group relative transition-all duration-300 hover:scale-[1.01] hover:rotate-0`}
                    >
                      {/* Red Pin Mockup */}
                      <div className="absolute top-2 left-1/2 h-3 w-3 -translate-x-1/2 transform rounded-full border border-red-600 bg-red-500 shadow-inner transition-transform group-hover:scale-110"></div>

                      <div>
                        {/* Note Header */}
                        <div className="mt-1 mb-3 flex items-center justify-between gap-2 border-b border-dashed border-yellow-300 pb-2">
                          <span
                            className="rounded px-2 py-0.5 text-[10px] font-bold"
                            style={{ backgroundColor: `${details.bg}20`, color: details.bg }}
                          >
                            {details.label}
                          </span>
                          <span className="text-gunmetal/40 font-mono text-[10px]">
                            {note.createdAt}
                          </span>
                        </div>

                        {/* Title & Body */}
                        <h3 className="text-gunmetal mb-2 text-lg leading-tight font-bold">
                          {note.title}
                        </h3>
                        <p className="text-gunmetal/80 font-['Caveat',_cursive] text-lg leading-tight break-words whitespace-pre-line">
                          {note.content}
                        </p>
                      </div>

                      {/* Delete Action */}
                      <div className="mt-4 flex justify-end border-t border-dashed border-yellow-200 pt-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="flex items-center gap-1 text-xs font-bold text-red-500 transition-colors hover:text-red-700"
                        >
                          🗑️ Unpin Note
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
