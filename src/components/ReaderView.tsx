import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Book, Bookmark, ReaderConfig, ReaderTheme, ReaderFont, ReaderMode } from '../types/book';
import { storageService } from '../services/storageService';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Settings,
  Volume2,
  VolumeX,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  Type,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface ReaderViewProps {
  book: Book;
  config: ReaderConfig;
  onConfigChange: (config: ReaderConfig) => void;
  onClose: () => void;
  onUpdateProgress: (page: number, totalPages: number, additionalSeconds: number) => void;
  bookmarks: Bookmark[];
  onAddBookmark: (page: number, quote: string, note?: string) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  book,
  config,
  onConfigChange,
  onClose,
  onUpdateProgress,
  bookmarks,
  onAddBookmark,
  onDeleteBookmark
}) => {
  const [currentPage, setCurrentPage] = useState<number>(book.lastReadPage || 1);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const uncommittedSecondsRef = useRef<number>(0);

  // Paginate book text into readable book pages (~1200 characters per page)
  const pages = useMemo(() => {
    const raw = book.fullContent || book.contentPreview || 'No content available for this book.';
    const paragraphs = raw.split(/\n\s*\n/);
    const result: string[] = [];
    let currentChunk = '';

    for (const para of paragraphs) {
      if ((currentChunk.length + para.length) > 1300 && currentChunk.length > 0) {
        result.push(currentChunk.trim());
        currentChunk = para;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
      }
    }
    if (currentChunk.trim().length > 0) {
      result.push(currentChunk.trim());
    }

    return result.length > 0 ? result : [raw];
  }, [book.fullContent, book.contentPreview]);

  const totalPages = pages.length;

  useEffect(() => {
    if (book.lastReadPage && book.lastReadPage <= totalPages) {
      setCurrentPage(book.lastReadPage);
    }
  }, [book.id, totalPages]);

  // Active reading timer: counts seconds when tab is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setSessionSeconds(prev => prev + 1);
        uncommittedSecondsRef.current += 1;

        // Auto-commit reading time every 10 seconds
        if (uncommittedSecondsRef.current >= 10) {
          const delta = uncommittedSecondsRef.current;
          uncommittedSecondsRef.current = 0;
          onUpdateProgress(currentPage, totalPages, delta);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (uncommittedSecondsRef.current > 0) {
        onUpdateProgress(currentPage, totalPages, uncommittedSecondsRef.current);
        uncommittedSecondsRef.current = 0;
      }
    };
  }, [currentPage, totalPages]);

  // Handle page turn commit
  const handlePageCommit = (newPage: number) => {
    const delta = uncommittedSecondsRef.current;
    uncommittedSecondsRef.current = 0;
    onUpdateProgress(newPage, totalPages, delta);
  };

  // Handle keyboard arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrev();
      } else if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        else if (showBookmarks) setShowBookmarks(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, showSettings, showBookmarks]);

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      stopTts();
      if (contentContainerRef.current) contentContainerRef.current.scrollTop = 0;
    }
  };

  const goToPrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      stopTts();
      if (contentContainerRef.current) contentContainerRef.current.scrollTop = 0;
    }
  };

  // Text-to-speech
  const stopTts = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleTts = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      stopTts();
    } else {
      const textToRead = pages[currentPage - 1] || '';
      if (!textToRead) return;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      stopTts();
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Theme styles
  const themeClasses: Record<ReaderTheme, { bg: string; text: string; header: string; border: string }> = {
    sepia: {
      bg: 'bg-[#F9F5EB]',
      text: 'text-[#432E27]',
      header: 'bg-[#F4ECD8]/90 text-[#432E27]',
      border: 'border-[#EADFC6]'
    },
    paper: {
      bg: 'bg-[#FCFCFC]',
      text: 'text-[#1F2937]',
      header: 'bg-white/90 text-slate-800',
      border: 'border-slate-200'
    },
    night: {
      bg: 'bg-[#121316]',
      text: 'text-[#D1D5DB]',
      header: 'bg-[#18191E]/95 text-slate-200',
      border: 'border-slate-800'
    },
    mint: {
      bg: 'bg-[#EBF5EE]',
      text: 'text-[#1E3A2F]',
      header: 'bg-[#DFF0E4]/90 text-[#1E3A2F]',
      border: 'border-[#CFE6D6]'
    }
  };

  const currentThemeStyle = themeClasses[config.theme] || themeClasses.sepia;

  const fontClass =
    config.font === 'serif'
      ? 'font-serif'
      : config.font === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Check if current page is bookmarked
  const isCurrentPageBookmarked = bookmarks.some(b => b.pageNumber === currentPage);

  const handleBookmarkCurrentPage = () => {
    const pageText = pages[currentPage - 1] || '';
    const quote = pageText.substring(0, 140).trim() + (pageText.length > 140 ? '...' : '');
    onAddBookmark(currentPage, quote);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${currentThemeStyle.bg} ${currentThemeStyle.text} transition-colors duration-200`}>
      {/* Top Header Controls */}
      <header className={`flex items-center justify-between px-4 py-2.5 border-b ${currentThemeStyle.border} ${currentThemeStyle.header} backdrop-blur-md`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              stopTts();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Back to library"
            data-testid="reader_back_button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="leading-tight">
            <h1 className="text-xs sm:text-sm font-bold line-clamp-1 max-w-[180px] sm:max-w-md">
              {book.title}
            </h1>
            <div className="flex items-center gap-2 text-[10px] opacity-75">
              <span className="line-clamp-1">{book.author}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-mono font-medium">
                <Clock className="w-2.5 h-2.5 text-amber-400" />
                <span>{storageService.formatReadingTime((book.totalReadingTimeSeconds || 0) + sessionSeconds)}</span>
              </span>
              <span>•</span>
              <span className="font-bold text-emerald-400">
                {Math.min(100, Math.round((currentPage / totalPages) * 100))}%
              </span>
            </div>
          </div>
        </div>

        {/* Reader Action Icons */}
        <div className="flex items-center gap-1">
          {/* TTS Listen button */}
          <button
            onClick={toggleTts}
            className={`p-2 rounded-xl transition-all ${
              isSpeaking
                ? 'bg-amber-500 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title={isSpeaking ? 'Stop read-aloud' : 'Read aloud with audio'}
            data-testid="reader_tts_button"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkCurrentPage}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={isCurrentPageBookmarked ? 'Bookmarked' : 'Bookmark this page'}
            data-testid="reader_bookmark_button"
          >
            {isCurrentPageBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
            ) : (
              <BookmarkIcon className="w-4 h-4" />
            )}
          </button>

          {/* Bookmarks List Modal toggle */}
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-xs font-mono font-semibold"
            title="View bookmarks list"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Settings modal toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-colors ${
              showSettings ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Reader theme & font settings"
            data-testid="reader_settings_button"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:block p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Reader Settings Drawer/Popover */}
      {showSettings && (
        <div className={`p-4 border-b ${currentThemeStyle.border} ${currentThemeStyle.header} shadow-lg space-y-4 max-w-2xl mx-auto w-full`}>
          {/* Theme Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider block mb-2 opacity-75">
              Reading Theme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['sepia', 'paper', 'night', 'mint'] as ReaderTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => onConfigChange({ ...config, theme })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    config.theme === theme
                      ? 'border-indigo-600 ring-2 ring-indigo-400/40'
                      : 'border-slate-300 dark:border-slate-700'
                  } ${
                    theme === 'sepia'
                      ? 'bg-[#F9F5EB] text-[#432E27]'
                      : theme === 'paper'
                      ? 'bg-white text-slate-800'
                      : theme === 'night'
                      ? 'bg-slate-900 text-slate-200'
                      : 'bg-[#EBF5EE] text-[#1E3A2F]'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family Selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:w-1/2">
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-2 opacity-75">
                Font Style
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'serif', label: 'Serif (Book)' },
                  { id: 'sans', label: 'Sans (Modern)' },
                  { id: 'mono', label: 'Verse' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => onConfigChange({ ...config, font: f.id as ReaderFont })}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border ${
                      config.font === f.id
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Adjuster */}
            <div className="w-full sm:w-1/2">
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-2 opacity-75">
                Text Size: {config.fontSize}px
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onConfigChange({ ...config, fontSize: Math.max(14, config.fontSize - 2) })}
                  className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  A-
                </button>
                <input
                  type="range"
                  min="14"
                  max="28"
                  value={config.fontSize}
                  onChange={(e) => onConfigChange({ ...config, fontSize: Number(e.target.value) })}
                  className="flex-1 accent-indigo-600 cursor-pointer"
                />
                <button
                  onClick={() => onConfigChange({ ...config, fontSize: Math.min(28, config.fontSize + 2) })}
                  className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-bold"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks Overlay */}
      {showBookmarks && (
        <div className={`p-4 border-b ${currentThemeStyle.border} ${currentThemeStyle.header} shadow-md max-w-xl mx-auto w-full`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Saved Bookmarks ({bookmarks.length})
            </h3>
            <button
              onClick={() => setShowBookmarks(false)}
              className="text-xs underline opacity-75"
            >
              Close
            </button>
          </div>

          {bookmarks.length === 0 ? (
            <p className="text-xs opacity-75 py-2">
              No bookmarks saved yet. Tap the bookmark icon while reading any page!
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  onClick={() => {
                    setCurrentPage(bm.pageNumber);
                    setShowBookmarks(false);
                  }}
                  className="p-2.5 rounded-xl border border-slate-300/40 dark:border-slate-700/60 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-amber-200/50 text-amber-900 px-1.5 py-0.5 rounded mr-1.5">
                      Page {bm.pageNumber}
                    </span>
                    <p className="text-xs italic line-clamp-1 mt-1 opacity-90">
                      "{bm.quote}"
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBookmark(bm.id);
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reading Content Canvas */}
      <main
        ref={contentContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-12 py-8 flex justify-center"
      >
        <div className="w-full max-w-2xl">
          {/* Header page indication */}
          <div className="flex items-center justify-between text-[11px] opacity-60 mb-6 font-mono border-b pb-2 border-current/10">
            <span className="truncate max-w-[200px]">{book.title}</span>
            <span>
              Page {currentPage} of {totalPages} ({Math.min(100, Math.round((currentPage / totalPages) * 100))}%) • ⏱ {storageService.formatReadingTime((book.totalReadingTimeSeconds || 0) + sessionSeconds)}
            </span>
          </div>

          {/* Book Page Text */}
          <article
            className={`${fontClass} leading-relaxed select-text whitespace-pre-line tracking-wide`}
            style={{
              fontSize: `${config.fontSize}px`,
              lineHeight: config.lineHeight
            }}
          >
            {pages[currentPage - 1] || 'End of book.'}
          </article>
        </div>
      </main>

      {/* Reader Bottom Navigation Bar */}
      <footer className={`flex items-center justify-between px-4 py-3 border-t ${currentThemeStyle.border} ${currentThemeStyle.header} select-none`}>
        <button
          onClick={goToPrev}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
          data-testid="reader_prev_page_button"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Page Scrubber / Slider */}
        <div className="flex items-center gap-2 max-w-xs flex-1 mx-4">
          <input
            type="range"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              setCurrentPage(Number(e.target.value));
              stopTts();
            }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <span className="text-xs font-mono font-medium opacity-80 whitespace-nowrap">
            {currentPage} / {totalPages}
          </span>
        </div>

        <button
          onClick={goToNext}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
          data-testid="reader_next_page_button"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
