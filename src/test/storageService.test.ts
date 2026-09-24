import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';
import { Book } from '../types/book';

describe('storageService reading calculations and metrics', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('formatReadingTime', () => {
    it('returns "0 min" for 0 or negative seconds', () => {
      expect(storageService.formatReadingTime(0)).toBe('0 min');
      expect(storageService.formatReadingTime(-15)).toBe('0 min');
    });

    it('formats seconds under a minute', () => {
      expect(storageService.formatReadingTime(45)).toBe('45s read');
    });

    it('formats minutes under an hour', () => {
      expect(storageService.formatReadingTime(60)).toBe('1 min');
      expect(storageService.formatReadingTime(120)).toBe('2 mins');
      expect(storageService.formatReadingTime(1560)).toBe('26 mins');
    });

    it('formats exact hours', () => {
      expect(storageService.formatReadingTime(3600)).toBe('1 hr');
      expect(storageService.formatReadingTime(7200)).toBe('2 hrs');
    });

    it('formats hours and minutes', () => {
      expect(storageService.formatReadingTime(5400)).toBe('1h 30m');
      expect(storageService.formatReadingTime(8100)).toBe('2h 15m');
    });
  });

  describe('calculateProgressPercentage', () => {
    it('returns 0 when totalPages is 0 or invalid', () => {
      expect(storageService.calculateProgressPercentage(0, 0)).toBe(0);
      expect(storageService.calculateProgressPercentage(5, 0)).toBe(0);
    });

    it('returns 0 when lastReadPage is 0', () => {
      expect(storageService.calculateProgressPercentage(0, 50)).toBe(0);
    });

    it('calculates accurate percentages and rounds', () => {
      expect(storageService.calculateProgressPercentage(8, 24)).toBe(33); // 33.33% -> 33
      expect(storageService.calculateProgressPercentage(18, 18)).toBe(100);
      expect(storageService.calculateProgressPercentage(1, 2)).toBe(50);
    });

    it('caps progress at 100%', () => {
      expect(storageService.calculateProgressPercentage(50, 20)).toBe(100);
    });
  });

  describe('calculateEstimatedTimeRemaining', () => {
    const mockBook: Book = {
      id: 'test-1',
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test',
      category: 'Classics',
      language: 'en',
      isDownloaded: true,
      lastReadTimestamp: Date.now(),
      lastReadPage: 18,
      totalPages: 18,
      totalReadingTimeSeconds: 1200,
      readingSessionsCount: 2,
      isFavorite: false,
      fileSizeBytes: 1000,
      contentPreview: 'Test preview'
    };

    it('returns "Completed" when 100% read', () => {
      expect(storageService.calculateEstimatedTimeRemaining(mockBook)).toBe('Completed');
    });

    it('estimates remaining time for in-progress books', () => {
      const inProgressBook: Book = {
        ...mockBook,
        lastReadPage: 10,
        totalPages: 20
      };
      const est = storageService.calculateEstimatedTimeRemaining(inProgressBook);
      expect(est).toContain('left');
    });
  });

  describe('getReadingStats', () => {
    it('aggregates statistics correctly across downloaded books', () => {
      const books: Book[] = [
        {
          id: '1',
          title: 'Book One',
          author: 'Author One',
          description: '',
          category: 'Poetry',
          language: 'en',
          isDownloaded: true,
          lastReadTimestamp: Date.now(),
          lastReadPage: 20,
          totalPages: 20, // 100% completed
          totalReadingTimeSeconds: 1800,
          readingSessionsCount: 3,
          isFavorite: false,
          fileSizeBytes: 1000,
          contentPreview: ''
        },
        {
          id: '2',
          title: 'Book Two',
          author: 'Author Two',
          description: '',
          category: 'Fiction',
          language: 'en',
          isDownloaded: true,
          lastReadTimestamp: Date.now(),
          lastReadPage: 10,
          totalPages: 20, // 50% in progress
          totalReadingTimeSeconds: 900,
          readingSessionsCount: 1,
          isFavorite: true,
          fileSizeBytes: 2000,
          contentPreview: ''
        },
        {
          id: '3',
          title: 'Book Three (Not Downloaded)',
          author: 'Author Three',
          description: '',
          category: 'Fiction',
          language: 'en',
          isDownloaded: false,
          lastReadTimestamp: 0,
          lastReadPage: 0,
          totalPages: 30,
          totalReadingTimeSeconds: 0,
          readingSessionsCount: 0,
          isFavorite: false,
          fileSizeBytes: 0,
          contentPreview: ''
        }
      ];

      const stats = storageService.getReadingStats(books);
      expect(stats.totalBooksDownloaded).toBe(2);
      expect(stats.totalSeconds).toBe(2700); // 1800 + 900
      expect(stats.completedCount).toBe(1);
      expect(stats.inProgressCount).toBe(1);
      expect(stats.averageProgressPercent).toBe(75); // (100 + 50) / 2
      expect(stats.mostReadBook?.id).toBe('1');
    });
  });

  describe('persistence and updates', () => {
    it('updates progress and reading time for a book', () => {
      const initialBook: Book = {
        id: 'b1',
        title: 'Book 1',
        author: 'A1',
        description: '',
        category: 'Classics',
        language: 'en',
        isDownloaded: true,
        lastReadTimestamp: 0,
        lastReadPage: 1,
        totalPages: 20,
        totalReadingTimeSeconds: 0,
        readingSessionsCount: 0,
        isFavorite: false,
        fileSizeBytes: 500,
        contentPreview: ''
      };

      storageService.saveBooks([initialBook]);
      storageService.updateProgress('b1', 5, 20, 120);

      const loaded = storageService.loadBooks();
      const updated = loaded.find(b => b.id === 'b1');
      expect(updated?.lastReadPage).toBe(5);
      expect(updated?.totalReadingTimeSeconds).toBe(120);
    });

    it('toggles favorite state', () => {
      const book: Book = {
        id: 'fav-1',
        title: 'Fav Book',
        author: 'Author',
        description: '',
        category: 'Poetry',
        language: 'en',
        isDownloaded: true,
        lastReadTimestamp: 0,
        lastReadPage: 1,
        totalPages: 10,
        totalReadingTimeSeconds: 0,
        readingSessionsCount: 0,
        isFavorite: false,
        fileSizeBytes: 500,
        contentPreview: ''
      };

      storageService.saveBooks([book]);
      const nowFav = storageService.toggleFavorite('fav-1');
      expect(nowFav).toBe(true);

      const loaded = storageService.loadBooks();
      expect(loaded[0].isFavorite).toBe(true);
    });
  });
});
