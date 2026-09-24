import React from 'react';
import { Book } from '../types/book';
import { X, HardDrive, Trash2, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadedBooks: Book[];
  onRemoveDownload: (book: Book) => void;
  onRead: (book: Book) => void;
}

export const StorageModal: React.FC<StorageModalProps> = ({
  isOpen,
  onClose,
  downloadedBooks,
  onRemoveDownload,
  onRead
}) => {
  if (!isOpen) return null;

  const totalBytes = downloadedBooks.reduce((acc, b) => acc + (b.fileSizeBytes || 0), 0);
  const totalKb = Math.max(1, Math.round(totalBytes / 1024));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                In-App Storage Manager
              </h2>
              <p className="text-[11px] text-slate-500">
                Private app cache only (no device clutter)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Informational banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Offline & Isolated Storage</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              All books in KitabGhar are downloaded directly into the app's internal sandbox.
              They are 100% free public domain books and never spill into your phone's personal files, Downloads folder, or photo gallery.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-500 block">Downloaded Works</span>
              <strong className="text-lg font-bold text-slate-800">
                {downloadedBooks.length} {downloadedBooks.length === 1 ? 'Book' : 'Books'}
              </strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-500 block">App Space Used</span>
              <strong className="text-lg font-bold text-indigo-600">
                {totalKb > 1024 ? `${(totalKb / 1024).toFixed(1)} MB` : `${totalKb} KB`}
              </strong>
            </div>
          </div>

          {/* List of downloaded books with 1-click delete */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2">
              Downloaded Books ({downloadedBooks.length})
            </h3>
            {downloadedBooks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No books downloaded yet. Browse the library and tap "Free" to save.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {downloadedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {book.author} • {Math.max(1, Math.round(book.fileSizeBytes / 1024))} KB
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onClose();
                          onRead(book);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Read"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveDownload(book)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove from app storage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
