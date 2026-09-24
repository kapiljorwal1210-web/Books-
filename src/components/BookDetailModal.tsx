import React from 'react';
import { Book } from '../types/book';
import { storageService } from '../services/storageService';
import {
  X,
  BookOpen,
  Download,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  isDownloading: boolean;
  onClose: () => void;
  onRead: (book: Book) => void;
  onDownload: (book: Book) => void;
  onRemoveDownload: (book: Book) => void;
  onFavorite: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isDownloading,
  onClose,
  onRead,
  onDownload,
  onRemoveDownload,
  onFavorite
}) => {
  if (!book) return null;

  const progressPercent = storageService.calculateProgressPercentage(book.lastReadPage, book.totalPages);
  const readingTimeText = storageService.formatReadingTime(book.totalReadingTimeSeconds || 0);
  const estRemaining = storageService.calculateEstimatedTimeRemaining(book);
  const isCompleted = progressPercent >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {book.category}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Language: {book.language.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onFavorite(book)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="Favorite"
            >
              <Heart className={`w-5 h-5 ${book.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Top Hero with Cover & Main Info */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
            <div className="w-32 h-44 rounded-xl overflow-hidden bg-slate-800 shadow-md flex-shrink-0">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-slate-400">
                  <BookOpen className="w-8 h-8 text-amber-400 mb-1" />
                  <span className="text-xs">{book.title}</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 leading-snug mb-1">
                {book.title}
              </h2>
              <p className="text-sm font-medium text-slate-600 mb-3">
                By <strong className="text-slate-800">{book.author}</strong>
              </p>

              {/* In-App Private Storage Guarantee */}
              <div className={`p-3 rounded-xl border text-xs ${
                book.isDownloaded
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldCheck className={`w-4 h-4 ${book.isDownloaded ? 'text-emerald-600' : 'text-slate-600'}`} />
                  <span>
                    {book.isDownloaded
                      ? 'Downloaded Directly Inside App'
                      : 'Free In-App Download Ready'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {book.isDownloaded
                    ? 'Saved in internal private app cache. Does not clutter your phone gallery or public storage.'
                    : 'Download to read 100% offline anytime within KitabGhar without using internet.'}
                </p>
              </div>
            </div>
          </div>

          {/* Reading Metrics & Progress Dashboard Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Reading Progress & Time</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}>
                {isCompleted ? '✓ Completed' : `${progressPercent}% Finished`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Time Read</span>
                <strong className="text-xs font-bold text-slate-800">
                  {readingTimeText}
                </strong>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Progress</span>
                <strong className="text-xs font-bold text-slate-800">
                  Pg {book.lastReadPage} / {book.totalPages}
                </strong>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Remaining</span>
                <strong className="text-xs font-bold text-indigo-600">
                  {estRemaining}
                </strong>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
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

          {/* Synopsis & Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              About This Work
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-serif">
              {book.description || book.contentPreview}
            </p>
          </div>

          {/* Excerpt Preview */}
          {book.contentPreview && (
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/50">
              <h4 className="text-xs font-semibold text-amber-900 mb-1">
                Opening Lines
              </h4>
              <p className="text-xs italic text-amber-950 font-serif leading-relaxed">
                "{book.contentPreview}"
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onRead(book);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {isCompleted
                ? 'Read Again'
                : progressPercent > 0
                ? `Resume (${progressPercent}%)`
                : 'Read in Reader'}
            </span>
          </button>

          {book.isDownloaded ? (
            <button
              onClick={() => onRemoveDownload(book)}
              className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-medium text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
              title="Delete from in-app storage"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Download</span>
            </button>
          ) : (
            <button
              onClick={() => onDownload(book)}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-semibold text-xs text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all disabled:opacity-50"
            >
              {isDownloading ? (
                <span>Downloading...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download (Free)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
