import React, { useState } from 'react';
import { Book } from '../types/book';
import { storageService } from '../services/storageService';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Award,
  Calendar,
  Hourglass,
  ArrowRight,
  Flame,
  Sparkles,
  BarChart3,
  BookmarkCheck
} from 'lucide-react';

interface ReadingHistoryDashboardProps {
  books: Book[];
  onContinueReading: (book: Book) => void;
  onOpenBookDetails: (book: Book) => void;
}

export const ReadingHistoryDashboard: React.FC<ReadingHistoryDashboardProps> = ({
  books,
  onContinueReading,
  onOpenBookDetails
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'in_progress' | 'completed'>('all');

  const downloadedBooks = books.filter(b => b.isDownloaded);
  const stats = storageService.getReadingStats(books);

  // Group books by progress
  const bookMetrics = downloadedBooks.map(book => {
    const progress = storageService.calculateProgressPercentage(book.lastReadPage, book.totalPages);
    const timeFormatted = storageService.formatReadingTime(book.totalReadingTimeSeconds || 0);
    const estRemaining = storageService.calculateEstimatedTimeRemaining(book);
    const isCompleted = progress >= 100;
    const isStarted = progress > 0 || (book.totalReadingTimeSeconds || 0) > 0;

    return {
      book,
      progress,
      timeFormatted,
      estRemaining,
      isCompleted,
      isStarted
    };
  });

  const filteredMetrics = bookMetrics.filter(item => {
    if (filterMode === 'completed') return item.isCompleted;
    if (filterMode === 'in_progress') return item.isStarted && !item.isCompleted;
    return true;
  });

  // Sort by last read timestamp
  const sortedMetrics = [...filteredMetrics].sort((a, b) => {
    return (b.book.lastReadTimestamp || 0) - (a.book.lastReadTimestamp || 0);
  });

  return (
    <section className="mb-6 space-y-4" data-testid="reading_history_dashboard">
      {/* Dashboard Top Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-md border border-slate-800">
        {/* Decorative ambient background glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header row */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Reading History & Activity
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Real-time progress calculation and reading time tracking across downloaded books
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Active Reader</span>
            </span>
          </div>
        </div>

        {/* 4-Stat Metric Cards Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          {/* Total Reading Time */}
          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-medium mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Total Time Read</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {storageService.formatReadingTime(stats.totalSeconds)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Across all downloaded books
            </div>
          </div>

          {/* Average Completion */}
          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Avg Completion</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {stats.averageProgressPercent}%
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.averageProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Completed Books */}
          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-medium mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Completed</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {stats.completedCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {stats.completedCount === 1 ? '1 book finished' : `${stats.completedCount} books finished`}
            </div>
          </div>

          {/* In Progress */}
          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-sky-300 text-xs font-medium mb-1">
              <Hourglass className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {stats.inProgressCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Currently reading
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs for Reading Progress */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1 pb-0.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Downloaded ({downloadedBooks.length})
          </button>

          <button
            onClick={() => setFilterMode('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === 'in_progress'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            In Progress ({stats.inProgressCount})
          </button>

          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Completed ({stats.completedCount})
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
          Showing {sortedMetrics.length} {sortedMetrics.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {/* Detailed Reading History Cards */}
      {sortedMetrics.length === 0 ? (
        <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
          No books matching this filter in your downloaded library.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMetrics.map(({ book, progress, timeFormatted, estRemaining, isCompleted }) => (
            <div
              key={book.id}
              onClick={() => onOpenBookDetails(book)}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-sm transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
              data-testid={`history_item_${book.id}`}
            >
              {/* Left: Thumbnail & Book Meta */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 shadow-xs">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {book.category}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>100% Finished</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {progress}% Read
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    By {book.author}
                  </p>
                </div>
              </div>

              {/* Center: Reading Metrics (Time Spent & Progress Bar) */}
              <div className="w-full sm:w-64 flex-shrink-0 flex flex-col justify-center">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>{timeFormatted}</span>
                  </span>
                  <span className="text-slate-500 font-mono">
                    Page {book.lastReadPage} of {book.totalPages}
                  </span>
                </div>

                {/* Dual Color Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{book.readingSessionsCount || 1} sessions</span>
                  <span className={isCompleted ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>
                    {estRemaining}
                  </span>
                </div>
              </div>

              {/* Right: Quick Continue Button */}
              <div className="w-full sm:w-auto flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinueReading(book);
                  }}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                  }`}
                  data-testid={`continue_reading_${book.id}`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isCompleted ? 'Read Again' : 'Resume'}</span>
                  <ArrowRight className="w-3 h-3 opacity-70" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
