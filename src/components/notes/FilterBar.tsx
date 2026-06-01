'use client';

import React from 'react';
import { Input, Button } from 'sketchbook-ui';
import { NOTE_CATEGORIES } from '@/types/note';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedTab: 'all' | 'favorites';
  setSelectedTab: (val: 'all' | 'favorites') => void;
  filterCategories: string[];
  setFilterCategories: (cats: string[]) => void;
  onNewNoteClick: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTab,
  setSelectedTab,
  filterCategories,
  setFilterCategories,
  onNewNoteClick,
}) => {
  const toggleFilterCategory = (cat: string) => {
    if (cat === 'all') {
      setFilterCategories(['all']);
    } else {
      let next = filterCategories.filter((c) => c !== 'all');
      if (next.includes(cat)) {
        next = next.filter((c) => c !== cat);
        if (next.length === 0) {
          next = ['all'];
        }
      } else {
        next.push(cat);
      }
      setFilterCategories(next);
    }
  };

  return (
    <>
      {/* Workspace Title & Controls */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-granite font-['Caveat',_cursive] text-5xl font-bold tracking-wide select-none">
            My Collective Brainrot
          </h1>
          <p className="text-gunmetal mt-2 text-lg font-medium select-none">
            Messy thoughts for organized people.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="w-50">
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
            />
          </div>
          {/* New Note Button */}
          <Button
            onClick={onNewNoteClick}
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
        <div className="bg-ash-grey/15 border-dust-grey/30 flex rounded-xl border p-1 select-none">
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
          <div className="flex items-center gap-2 select-none">
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
    </>
  );
};
