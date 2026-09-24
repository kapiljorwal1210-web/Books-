import React from 'react';
import { Search, X, CheckCircle2, BookOpen, Sparkles, Clock } from 'lucide-react';
import { FilterCategory } from '../types/book';

interface TopSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  downloadedCount: number;
  totalLocalCount: number;
  filteredResultCount: number;
  totalReadingTimeText?: string;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  query,
  onQueryChange,
  activeFilter,
  onFilterChange,
  downloadedCount,
  filteredResultCount,
  totalReadingTimeText
}) => {
  const filterChips: { id: FilterCategory; label: string; icon?: React.ReactNode; badge?: number }[] = [
    {
      id: 'downloaded',
      label: 'Downloaded Library',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      badge: downloadedCount
    },
    { id: 'all', label: 'All Library' },
    { id: 'poetry', label: 'Poetry & Poems' },
    { id: 'classics', label: 'Classics & Novels' },
    { id: 'philosophy', label: 'Philosophy' },
    {
      id: 'online',
      label: 'Search Free Web Catalog',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />
    }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-4 pt-3.5 pb-2.5">
        {/* App Title & Quick Brand Row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center text-amber-400 shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                KitabGhar
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Free
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                In-app offline eBook & poetry library
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalReadingTimeText && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{totalReadingTimeText}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{downloadedCount} in App Storage</span>
            </span>
          </div>
        </div>

        {/* The Search Bar (Top of app, quick author & book search) */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              activeFilter === 'downloaded'
                ? "Search downloaded books, poems, or authors..."
                : "Search any book, author, poet (e.g. Tagore, Premchand, Ghalib)..."
            }
            className="w-full pl-10 pr-10 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            aria-label="Search downloaded library"
            data-testid="library_search_input"
          />

          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              title="Clear search"
              data-testid="clear_search_button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 mt-1">
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => onFilterChange(chip.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                }`}
                data-testid={`filter_chip_${chip.id}`}
              >
                {chip.icon}
                <span>{chip.label}</span>
                {chip.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {chip.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Feedback Info Line */}
        {query.trim().length > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
            <span>
              Found <strong className="text-slate-800">{filteredResultCount}</strong>{' '}
              {filteredResultCount === 1 ? 'book' : 'books'} for "{query}"
              {activeFilter === 'downloaded' ? ' in Downloaded Library' : ''}
            </span>
            <button
              onClick={() => onQueryChange('')}
              className="text-indigo-600 hover:text-indigo-800 text-[11px] underline"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
