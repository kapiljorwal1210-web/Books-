import React from 'react';
import { Book } from '../types/book';
import { storageService } from '../services/storageService';
import { BookOpen, Download, CheckCircle2, Heart, Loader2, Clock, Sparkles } from 'lucide-react';

interface BookCardProps {
  book: Book;
  isDownloading: boolean;
  onRead: (book: Book) => void;
  onDownload: (book: Book) => void;
  onFavorite: (book: Book) => void;
  onClick: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isDownloading,
  onRead,
  onDownload,
  onFavorite,
  onClick
}) => {
  const progressPercent = storageService.calculateProgressPercentage(book.lastReadPage, book.totalPages);
  const readingTimeText = storageService.formatReadingTime(book.totalReadingTimeSeconds || 0);
  const estRemaining = storageService.calculateEstimatedTimeRemaining(book);
  const isCompleted = progressPercent >= 100;

  return (
    <div
      onClick={() => onClick(book)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 p-3.5 flex flex-col sm:flex-row gap-3.5 cursor-pointer"
      data-testid={`book_card_${book.id}`}
    >
      {/* Book Cover */}
      <div className="relative w-full sm:w-28 h-40 sm:h-42 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-indigo-950 flex-shrink-0 shadow-inner">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-300">
            <BookOpen className="w-8 h-8 text-amber-400 mb-1" />
            <span className="text-[11px] font-medium leading-tight line-clamp-2">
              {book.title}
            </span>
          </div>
        )}

        {/* In-App Offline Badge */}
        {book.isDownloaded && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
            <CheckCircle2 className="w-3 h-3" />
            <span>In-App</span>
          </div>
        )}

        {/* 100% Completed Ribbon if finished */}
        {isCompleted && (
          <div className="absolute bottom-2 left-2 right-2 bg-emerald-700/90 backdrop-blur-xs text-white text-[9px] font-bold py-0.5 text-center rounded shadow-xs flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-200" />
            <span>Finished</span>
          </div>
        )}

        {/* Favorite Icon overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(book);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
            book.isFavorite
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-black/30 hover:bg-black/50 text-white'
          }`}
          title={book.isFavorite ? 'Remove favorite' : 'Add to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${book.isFavorite ? 'fill-rose-600' : ''}`} />
        </button>
      </div>

      {/* Book Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Category Chip + Progress Badge */}
          <div className="flex items-center justify-between mb-1.5 gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
              {book.category}
            </span>

            {/* Calculated Progress Percentage Badge */}
            {progressPercent > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {isCompleted ? '✓ 100% Completed' : `${progressPercent}% Read`}
              </span>
            )}
          </div>

          {/* Book Title */}
          <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {book.title}
          </h2>

          {/* Author Name */}
          <p className="text-xs font-medium text-slate-600 mb-1">
            By <span className="text-slate-800 font-semibold">{book.author}</span>
          </p>

          {/* Short Excerpt */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
            {book.description || book.contentPreview}
          </p>
        </div>

        {/* Bottom Section: Progress Metrics + Action Buttons */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
          {/* Detailed Reading Metrics Row */}
          {(progressPercent > 0 || (book.totalReadingTimeSeconds && book.totalReadingTimeSeconds > 0)) && (
            <div className="w-full bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                {/* Total Reading Time */}
                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                  <Clock className="w-3 h-3 text-indigo-600" />
                  <span>{readingTimeText}</span>
                </span>

                {/* Pages and Estimated Time Remaining */}
                <span className="text-[10px] text-slate-500">
                  Pg {book.lastReadPage}/{book.totalPages} • <span className={isCompleted ? 'text-emerald-600 font-medium' : 'text-slate-600'}>{estRemaining}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead(book);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xs"
              data-testid={`read_button_${book.id}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {isCompleted
                  ? 'Read Again'
                  : progressPercent > 0
                  ? `Resume (${progressPercent}%)`
                  : 'Read Free'}
              </span>
            </button>

            {book.isDownloaded ? (
              <span
                className="inline-flex items-center gap-1 py-2 px-3 rounded-xl text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 cursor-default"
                title="Downloaded in app memory"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(book);
                }}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-[0.98] transition-all disabled:opacity-60"
                title="Download directly inside app for offline reading"
                data-testid={`download_button_${book.id}`}
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Free</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
