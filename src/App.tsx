import React, { useState, useEffect, useMemo } from 'react';
import { Book, Bookmark, FilterCategory, ReaderConfig } from './types/book';
import { storageService } from './services/storageService';
import { gutendexService } from './services/gutendexService';
import { TopSearchBar } from './components/TopSearchBar';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { ReaderView } from './components/ReaderView';
import { StorageModal } from './components/StorageModal';
import { ReadingHistoryDashboard } from './components/ReadingHistoryDashboard';
import {
  BookOpen,
  Download,
  CheckCircle2,
  HardDrive,
  Heart,
  Sparkles,
  Compass,
  AlertCircle,
  BarChart3,
  Loader2,
  Clock
} from 'lucide-react';

export const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('downloaded');
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [readerConfig, setReaderConfig] = useState<ReaderConfig>(storageService.loadReaderConfig());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState<boolean>(false);
  const [downloadingBookIds, setDownloadingBookIds] = useState<Set<string>>(new Set());

  // Online catalog search state
  const [onlineResults, setOnlineResults] = useState<Book[]>([]);
  const [isOnlineSearching, setIsOnlineSearching] = useState<boolean>(false);
  const [onlineSearchError, setOnlineSearchError] = useState<string | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load books on start
  useEffect(() => {
    const loaded = storageService.loadBooks();
    setBooks(loaded);
  }, []);

  // Sync reader config
  const handleConfigChange = (newConfig: ReaderConfig) => {
    setReaderConfig(newConfig);
    storageService.saveReaderConfig(newConfig);
  };

  // When reading a book, load its bookmarks
  useEffect(() => {
    if (activeReadingBook) {
      setBookmarks(storageService.loadBookmarks(activeReadingBook.id));
    }
  }, [activeReadingBook]);

  // Handle online search if online filter is active
  useEffect(() => {
    if (activeFilter === 'online' && searchQuery.trim().length >= 2) {
      const timer = setTimeout(async () => {
        setIsOnlineSearching(true);
        setOnlineSearchError(null);
        try {
          const results = await gutendexService.searchOnline(searchQuery);
          // Mark already downloaded items
          const localIds = new Set(books.filter(b => b.isDownloaded).map(b => b.id));
          const synced = results.map(r => ({
            ...r,
            isDownloaded: localIds.has(r.id)
          }));
          setOnlineResults(synced);
        } catch (err: any) {
          console.error(err);
          setOnlineSearchError(err?.message || 'Unable to connect to Gutenberg free catalog');
        } finally {
          setIsOnlineSearching(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [activeFilter, searchQuery, books]);

  // Compute downloaded count and total reading time
  const downloadedCount = useMemo(() => {
    return books.filter(b => b.isDownloaded).length;
  }, [books]);

  const totalReadingTimeText = useMemo(() => {
    const totalSecs = books
      .filter(b => b.isDownloaded)
      .reduce((sum, b) => sum + (b.totalReadingTimeSeconds || 0), 0);
    return storageService.formatReadingTime(totalSecs);
  }, [books]);

  // Filter books locally by search bar query and category
  const filteredBooks = useMemo(() => {
    if (activeFilter === 'online') {
      return onlineResults;
    }

    let list = [...books];

    // Filter by category
    if (activeFilter === 'downloaded') {
      list = list.filter(b => b.isDownloaded);
    } else if (activeFilter === 'poetry') {
      list = list.filter(b => b.category.toLowerCase().includes('poetry') || b.category.toLowerCase().includes('shayari'));
    } else if (activeFilter === 'classics') {
      list = list.filter(b => b.category.toLowerCase().includes('classic') || b.category.toLowerCase().includes('fiction') || b.category.toLowerCase().includes('mystery'));
    } else if (activeFilter === 'philosophy') {
      list = list.filter(b => b.category.toLowerCase().includes('philosophy') || b.category.toLowerCase().includes('strategy'));
    }

    // Filter by Top Search query (searches Title, Author, and Excerpt)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [books, activeFilter, searchQuery, onlineResults]);

  // Download a book into app internal storage
  const handleDownload = async (book: Book) => {
    if (downloadingBookIds.has(book.id)) return;

    setDownloadingBookIds(prev => new Set(prev).add(book.id));

    try {
      let content = book.fullContent;
      if (!content && book.downloadUrl) {
        try {
          content = await gutendexService.fetchBookText(book.downloadUrl);
        } catch {
          // fallback if CORS or network error occurs
          content = undefined;
        }
      }

      const updated = storageService.downloadBookToApp(book, content);

      // Update state
      setBooks(prev => {
        const idx = prev.findIndex(b => b.id === book.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        } else {
          return [updated, ...prev];
        }
      });

      // Update online list if present
      setOnlineResults(prev => prev.map(b => (b.id === book.id ? updated : b)));

      if (selectedBookForDetails?.id === book.id) {
        setSelectedBookForDetails(updated);
      }

      showToast(`✓ "${book.title}" saved to In-App Storage (Offline & Free)`);
    } catch (err) {
      console.error(err);
      showToast(`Could not download book. Please try again.`);
    } finally {
      setDownloadingBookIds(prev => {
        const next = new Set(prev);
        next.delete(book.id);
        return next;
      });
    }
  };

  // Remove download from app storage
  const handleRemoveDownload = (book: Book) => {
    storageService.removeBookDownload(book.id);
    setBooks(prev =>
      prev.map(b => (b.id === book.id ? { ...b, isDownloaded: false, downloadDate: undefined } : b))
    );
    if (selectedBookForDetails?.id === book.id) {
      setSelectedBookForDetails(prev => (prev ? { ...prev, isDownloaded: false } : null));
    }
    showToast(`Removed "${book.title}" from in-app storage`);
  };

  // Toggle favorite
  const handleToggleFavorite = (book: Book) => {
    const isFav = storageService.toggleFavorite(book.id);
    setBooks(prev =>
      prev.map(b => (b.id === book.id ? { ...b, isFavorite: isFav } : b))
    );
    if (selectedBookForDetails?.id === book.id) {
      setSelectedBookForDetails(prev => (prev ? { ...prev, isFavorite: isFav } : null));
    }
  };

  // Reading progress and time update
  const handleUpdateProgress = (page: number, total: number, additionalSeconds: number = 0) => {
    if (activeReadingBook) {
      storageService.updateProgress(activeReadingBook.id, page, total, additionalSeconds);
      setBooks(prev =>
        prev.map(b =>
          b.id === activeReadingBook.id
            ? {
                ...b,
                lastReadPage: page,
                totalPages: total,
                totalReadingTimeSeconds: (b.totalReadingTimeSeconds || 0) + additionalSeconds,
                lastReadTimestamp: Date.now()
              }
            : b
        )
      );
      setActiveReadingBook(prev =>
        prev
          ? {
              ...prev,
              lastReadPage: page,
              totalPages: total,
              totalReadingTimeSeconds: (prev.totalReadingTimeSeconds || 0) + additionalSeconds,
              lastReadTimestamp: Date.now()
            }
          : null
      );
    }
  };

  // Bookmarks
  const handleAddBookmark = (page: number, quote: string, note?: string) => {
    if (activeReadingBook) {
      const bm = storageService.addBookmark(activeReadingBook.id, page, quote, note);
      setBookmarks(prev => [bm, ...prev]);
      showToast(`Bookmark saved for Page ${page}`);
    }
  };

  const handleDeleteBookmark = (bmId: string) => {
    if (activeReadingBook) {
      storageService.deleteBookmark(activeReadingBook.id, bmId);
      setBookmarks(prev => prev.filter(b => b.id !== bmId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Search Bar at Top of App */}
      <TopSearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        downloadedCount={downloadedCount}
        totalLocalCount={books.length}
        filteredResultCount={filteredBooks.length}
        totalReadingTimeText={totalReadingTimeText}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 pb-24">
        {/* Banner: In-App Private Offline Storage info */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                In-App Offline Library
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Zero Phone Clutter
                </span>
              </h2>
              <p className="text-xs text-slate-600">
                Downloaded books stay securely inside KitabGhar app storage. Free & open public domain literature.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsStorageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 transition-colors whitespace-nowrap"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Manage App Space ({downloadedCount})</span>
          </button>
        </div>

        {/* Detailed Reading History Dashboard (Shown in Downloaded / My Library section) */}
        {activeFilter === 'downloaded' && (
          <ReadingHistoryDashboard
            books={books}
            onContinueReading={(b) => setActiveReadingBook(b)}
            onOpenBookDetails={(b) => setSelectedBookForDetails(b)}
          />
        )}

        {/* Online Search Progress / Status */}
        {activeFilter === 'online' && (
          <div className="mb-4">
            {isOnlineSearching && (
              <div className="flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 text-sm text-slate-600 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Searching Gutenberg 70,000+ free public domain books...</span>
              </div>
            )}
            {onlineSearchError && (
              <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{onlineSearchError}. Try searching another term like "Shakespeare" or "Tagore".</span>
              </div>
            )}
            {!isOnlineSearching && onlineResults.length === 0 && searchQuery.trim().length >= 2 && (
              <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                No online matches found for "{searchQuery}".
              </div>
            )}
          </div>
        )}

        {/* Section Title when in Downloaded view */}
        {activeFilter === 'downloaded' && filteredBooks.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Downloaded Book Catalog ({filteredBooks.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Total Reading Time: <strong className="text-slate-800">{totalReadingTimeText}</strong>
            </span>
          </div>
        )}

        {/* Empty state for Downloaded or Local filter */}
        {filteredBooks.length === 0 && activeFilter !== 'online' && (
          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {searchQuery ? `No books found for "${searchQuery}"` : 'No books in this section'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {activeFilter === 'downloaded'
                ? 'You have not downloaded any books yet. Explore the library below or search for your favorite author to download.'
                : 'Try adjusting your search bar query or switch to "Search Free Web Catalog".'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Browse All Books
              </button>
              <button
                onClick={() => {
                  setActiveFilter('online');
                  setSearchQuery('Poetry');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition-colors"
              >
                Search Online Catalog
              </button>
            </div>
          </div>
        )}

        {/* Book Grid */}
        {filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isDownloading={downloadingBookIds.has(book.id)}
                onRead={(b) => setActiveReadingBook(b)}
                onDownload={handleDownload}
                onFavorite={handleToggleFavorite}
                onClick={(b) => setSelectedBookForDetails(b)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Persistent Bottom Bar on Mobile */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-6 flex justify-around items-center z-20">
        <button
          onClick={() => {
            setActiveFilter('downloaded');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            activeFilter === 'downloaded' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
          data-testid="nav_downloaded"
        >
          <div className="relative">
            <BookOpen className="w-5 h-5 mb-0.5" />
            {downloadedCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {downloadedCount}
              </span>
            )}
          </div>
          <span>My Library</span>
        </button>

        <button
          onClick={() => {
            setActiveFilter('all');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            activeFilter === 'all' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
          data-testid="nav_library"
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => {
            setActiveFilter('poetry');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            activeFilter === 'poetry' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
          data-testid="nav_poetry"
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-amber-500" />
          <span>Poetry</span>
        </button>

        <button
          onClick={() => setIsStorageModalOpen(true)}
          className="flex flex-col items-center text-[10px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          data-testid="nav_storage"
        >
          <HardDrive className="w-5 h-5 mb-0.5 text-emerald-600" />
          <span>Storage</span>
        </button>
      </nav>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBookForDetails}
        isDownloading={selectedBookForDetails ? downloadingBookIds.has(selectedBookForDetails.id) : false}
        onClose={() => setSelectedBookForDetails(null)}
        onRead={(b) => {
          setSelectedBookForDetails(null);
          setActiveReadingBook(b);
        }}
        onDownload={handleDownload}
        onRemoveDownload={handleRemoveDownload}
        onFavorite={handleToggleFavorite}
      />

      {/* Reader Screen */}
      {activeReadingBook && (
        <ReaderView
          book={activeReadingBook}
          config={readerConfig}
          onConfigChange={handleConfigChange}
          onClose={() => setActiveReadingBook(null)}
          onUpdateProgress={handleUpdateProgress}
          bookmarks={bookmarks}
          onAddBookmark={handleAddBookmark}
          onDeleteBookmark={handleDeleteBookmark}
        />
      )}

      {/* Storage Manager Modal */}
      <StorageModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        downloadedBooks={books.filter(b => b.isDownloaded)}
        onRemoveDownload={handleRemoveDownload}
        onRead={(b) => {
          setIsStorageModalOpen(false);
          setActiveReadingBook(b);
        }}
      />

      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;
