import { Book, Bookmark, ReaderConfig } from '../types/book';
import { INITIAL_BOOKS } from '../data/defaultCatalog';

const STORAGE_KEY_BOOKS = 'kitabghar_books_v1';
const STORAGE_KEY_BOOKMARKS = 'kitabghar_bookmarks_v1';
const STORAGE_KEY_CONFIG = 'kitabghar_reader_config_v1';

export const storageService = {
  loadBooks(): Book[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_BOOKS);
      if (data) {
        const parsed: Book[] = JSON.parse(data);
        // Ensure backward compatibility with new fields
        return parsed.map(b => ({
          ...b,
          totalReadingTimeSeconds: b.totalReadingTimeSeconds ?? 0,
          readingSessionsCount: b.readingSessionsCount ?? (b.totalReadingTimeSeconds > 0 ? 1 : 0)
        }));
      }
    } catch (e) {
      console.error('Error loading books from storage:', e);
    }
    // Seed initial books
    this.saveBooks(INITIAL_BOOKS);
    return INITIAL_BOOKS;
  },

  saveBooks(books: Book[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    } catch (e) {
      console.error('Error saving books to storage:', e);
    }
  },

  saveBook(book: Book): void {
    const books = this.loadBooks();
    const index = books.findIndex(b => b.id === book.id);
    if (index >= 0) {
      books[index] = book;
    } else {
      books.unshift(book);
    }
    this.saveBooks(books);
  },

  downloadBookToApp(book: Book, fetchedContent?: string): Book {
    const content = fetchedContent || book.fullContent || generateFallbackContent(book);
    const updated: Book = {
      ...book,
      isDownloaded: true,
      downloadDate: Date.now(),
      fileSizeBytes: new Blob([content]).size,
      fullContent: content,
      totalPages: Math.max(1, Math.ceil(content.length / 1400)),
      totalReadingTimeSeconds: book.totalReadingTimeSeconds ?? 0,
      readingSessionsCount: book.readingSessionsCount ?? 0
    };
    this.saveBook(updated);
    return updated;
  },

  removeBookDownload(bookId: string): void {
    const books = this.loadBooks();
    const target = books.find(b => b.id === bookId);
    if (target) {
      target.isDownloaded = false;
      target.downloadDate = undefined;
      this.saveBooks(books);
    }
  },

  updateProgress(bookId: string, page: number, totalPages: number, additionalSeconds: number = 0): void {
    const books = this.loadBooks();
    const target = books.find(b => b.id === bookId);
    if (target) {
      target.lastReadPage = page;
      target.totalPages = totalPages;
      target.lastReadTimestamp = Date.now();
      if (additionalSeconds > 0) {
        target.totalReadingTimeSeconds = (target.totalReadingTimeSeconds || 0) + additionalSeconds;
      }
      this.saveBooks(books);
    }
  },

  addReadingTime(bookId: string, seconds: number, isNewSession: boolean = false): void {
    if (seconds <= 0) return;
    const books = this.loadBooks();
    const target = books.find(b => b.id === bookId);
    if (target) {
      target.totalReadingTimeSeconds = (target.totalReadingTimeSeconds || 0) + seconds;
      target.lastReadTimestamp = Date.now();
      if (isNewSession) {
        target.readingSessionsCount = (target.readingSessionsCount || 0) + 1;
      }
      this.saveBooks(books);
    }
  },

  formatReadingTime(seconds: number): string {
    if (!seconds || seconds <= 0) return '0 min';
    if (seconds < 60) return `${seconds}s read`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'}`;
    const hours = Math.floor(minutes / 60);
    const remMins = minutes % 60;
    if (remMins === 0) return `${hours} hr${hours === 1 ? '' : 's'}`;
    return `${hours}h ${remMins}m`;
  },

  calculateProgressPercentage(lastReadPage: number, totalPages: number): number {
    if (!totalPages || totalPages <= 0) return 0;
    if (!lastReadPage || lastReadPage <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((lastReadPage / totalPages) * 100)));
  },

  calculateEstimatedTimeRemaining(book: Book): string {
    const percent = this.calculateProgressPercentage(book.lastReadPage, book.totalPages);
    if (percent >= 100) return 'Completed';

    const pagesLeft = Math.max(0, book.totalPages - (book.lastReadPage || 1));
    if (pagesLeft === 0) return 'Completed';

    // Calculate pace from past reading if available, else default ~1.6 minutes per page
    let minutesPerPage = 1.6;
    if (book.totalReadingTimeSeconds > 60 && book.lastReadPage > 1) {
      const pace = (book.totalReadingTimeSeconds / 60) / (book.lastReadPage - 1);
      if (pace >= 0.5 && pace <= 5) {
        minutesPerPage = pace;
      }
    }

    const estimatedMins = Math.round(pagesLeft * minutesPerPage);
    if (estimatedMins < 1) return '< 1 min left';
    if (estimatedMins < 60) return `~${estimatedMins} mins left`;
    const hrs = Math.floor(estimatedMins / 60);
    const mins = estimatedMins % 60;
    return mins > 0 ? `~${hrs}h ${mins}m left` : `~${hrs}h left`;
  },

  getReadingStats(books: Book[]): {
    totalSeconds: number;
    totalBooksDownloaded: number;
    inProgressCount: number;
    completedCount: number;
    averageProgressPercent: number;
    mostReadBook: Book | null;
  } {
    const downloaded = books.filter(b => b.isDownloaded);
    const totalSeconds = downloaded.reduce((sum, b) => sum + (b.totalReadingTimeSeconds || 0), 0);
    
    let completedCount = 0;
    let inProgressCount = 0;
    let totalProgressSum = 0;

    downloaded.forEach(b => {
      const pct = this.calculateProgressPercentage(b.lastReadPage, b.totalPages);
      totalProgressSum += pct;
      if (pct >= 100) {
        completedCount++;
      } else if (pct > 0 || (b.totalReadingTimeSeconds && b.totalReadingTimeSeconds > 0)) {
        inProgressCount++;
      }
    });

    const averageProgressPercent = downloaded.length > 0 
      ? Math.round(totalProgressSum / downloaded.length) 
      : 0;

    const mostReadBook = [...downloaded].sort((a, b) => (b.totalReadingTimeSeconds || 0) - (a.totalReadingTimeSeconds || 0))[0] || null;

    return {
      totalSeconds,
      totalBooksDownloaded: downloaded.length,
      inProgressCount,
      completedCount,
      averageProgressPercent,
      mostReadBook
    };
  },

  toggleFavorite(bookId: string): boolean {
    const books = this.loadBooks();
    const target = books.find(b => b.id === bookId);
    if (target) {
      target.isFavorite = !target.isFavorite;
      this.saveBooks(books);
      return target.isFavorite;
    }
    return false;
  },

  loadBookmarks(bookId: string): Bookmark[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_BOOKMARKS}_${bookId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addBookmark(bookId: string, pageNumber: number, quote: string, note?: string): Bookmark {
    const list = this.loadBookmarks(bookId);
    const newBm: Bookmark = {
      id: 'bm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      bookId,
      pageNumber,
      quote,
      note,
      timestamp: Date.now()
    };
    list.unshift(newBm);
    localStorage.setItem(`${STORAGE_KEY_BOOKMARKS}_${bookId}`, JSON.stringify(list));
    return newBm;
  },

  deleteBookmark(bookId: string, bookmarkId: string): void {
    const list = this.loadBookmarks(bookId).filter(b => b.id !== bookmarkId);
    localStorage.setItem(`${STORAGE_KEY_BOOKMARKS}_${bookId}`, JSON.stringify(list));
  },

  loadReaderConfig(): ReaderConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {
      fontSize: 18,
      theme: 'sepia',
      font: 'serif',
      mode: 'paginated',
      lineHeight: 1.7
    };
  },

  saveReaderConfig(config: ReaderConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // ignore
    }
  }
};

function generateFallbackContent(book: Book): string {
  return `${book.title.toUpperCase()}
By ${book.author}
Category: ${book.category}

--- PREVIEW & SYNOPSIS ---
${book.description}

--- CHAPTER 1 ---
The timeless words of ${book.author} are now preserved inside your in-app library.
You are reading a completely free, offline-ready literary edition in KitabGhar.

${book.contentPreview || 'A masterpiece of classic literature, ready for peaceful study.'}`;
}
