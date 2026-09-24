export type ReaderTheme = 'sepia' | 'paper' | 'night' | 'mint';
export type ReaderFont = 'serif' | 'sans' | 'mono';
export type ReaderMode = 'paginated' | 'scroll';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  description: string;
  language: string;
  downloadUrl?: string;
  isDownloaded: boolean;
  downloadDate?: number;
  lastReadTimestamp: number;
  lastReadPage: number;
  totalPages: number;
  totalReadingTimeSeconds: number; // in seconds
  readingSessionsCount: number;
  isFavorite: boolean;
  fileSizeBytes: number;
  contentPreview: string;
  fullContent?: string;
}

export interface ReadingHistoryStats {
  totalSeconds: number;
  totalBooksDownloaded: number;
  inProgressCount: number;
  completedCount: number;
  averageProgressPercent: number;
  totalBookmarksCount: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  pageNumber: number;
  quote: string;
  note?: string;
  timestamp: number;
}

export interface ReaderConfig {
  fontSize: number; // in px, e.g. 18
  theme: ReaderTheme;
  font: ReaderFont;
  mode: ReaderMode;
  lineHeight: number;
}

export type FilterCategory = 'downloaded' | 'all' | 'poetry' | 'classics' | 'philosophy' | 'online';
