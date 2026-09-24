import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReadingHistoryDashboard } from '../components/ReadingHistoryDashboard';
import { Book } from '../types/book';

describe('ReadingHistoryDashboard', () => {
  const mockBooks: Book[] = [
    {
      id: 'book-1',
      title: 'Gitanjali Song Offerings',
      author: 'Rabindranath Tagore',
      description: 'Poetic verses',
      category: 'Poetry & Poems',
      language: 'en',
      isDownloaded: true,
      lastReadTimestamp: Date.now() - 3600000,
      lastReadPage: 8,
      totalPages: 24, // 33%
      totalReadingTimeSeconds: 1560, // 26 mins
      readingSessionsCount: 4,
      isFavorite: true,
      fileSizeBytes: 48500,
      contentPreview: 'Thou hast made me endless...'
    },
    {
      id: 'book-2',
      title: 'Idgah',
      author: 'Munshi Premchand',
      description: 'Classic Hindi tale',
      category: 'Classics & Stories',
      language: 'hi',
      isDownloaded: true,
      lastReadTimestamp: Date.now() - 7200000,
      lastReadPage: 18,
      totalPages: 18, // 100% Completed
      totalReadingTimeSeconds: 2160, // 36 mins
      readingSessionsCount: 5,
      isFavorite: true,
      fileSizeBytes: 36000,
      contentPreview: 'A full thirty days of Ramadan...'
    }
  ];

  it('renders the 4 metric cards correctly', () => {
    const onContinueReading = vi.fn();
    const onOpenBookDetails = vi.fn();

    render(
      <ReadingHistoryDashboard
        books={mockBooks}
        onContinueReading={onContinueReading}
        onOpenBookDetails={onOpenBookDetails}
      />
    );

    // Header check
    expect(screen.getByText(/Reading History & Activity/i)).toBeInTheDocument();

    // Total Time Read: 1560 + 2160 = 3720s -> 1h 2m
    expect(screen.getByText('Total Time Read')).toBeInTheDocument();
    expect(screen.getByText('1h 2m')).toBeInTheDocument();

    // Avg completion: (33 + 100) / 2 = 67%
    expect(screen.getByText('Avg Completion')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();

    // Completed: 1 book finished
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('1 book finished')).toBeInTheDocument();

    // In Progress: 1 book currently reading
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Currently reading')).toBeInTheDocument();
  });

  it('filters books by progress status', () => {
    const onContinueReading = vi.fn();
    const onOpenBookDetails = vi.fn();

    render(
      <ReadingHistoryDashboard
        books={mockBooks}
        onContinueReading={onContinueReading}
        onOpenBookDetails={onOpenBookDetails}
      />
    );

    // Initial state shows both
    expect(screen.getByText('Gitanjali Song Offerings')).toBeInTheDocument();
    expect(screen.getByText('Idgah')).toBeInTheDocument();

    // Click "Completed" filter
    const completedTab = screen.getByRole('button', { name: /Completed/i });
    fireEvent.click(completedTab);

    // Only completed book is visible
    expect(screen.queryByText('Gitanjali Song Offerings')).not.toBeInTheDocument();
    expect(screen.getByText('Idgah')).toBeInTheDocument();

    // Click "In Progress" filter
    const inProgressTab = screen.getByRole('button', { name: /In Progress/i });
    fireEvent.click(inProgressTab);

    expect(screen.getByText('Gitanjali Song Offerings')).toBeInTheDocument();
    expect(screen.queryByText('Idgah')).not.toBeInTheDocument();
  });

  it('fires onContinueReading when resume button is clicked', () => {
    const onContinueReading = vi.fn();
    const onOpenBookDetails = vi.fn();

    render(
      <ReadingHistoryDashboard
        books={mockBooks}
        onContinueReading={onContinueReading}
        onOpenBookDetails={onOpenBookDetails}
      />
    );

    const resumeBtn = screen.getByTestId('continue_reading_book-1');
    fireEvent.click(resumeBtn);

    expect(onContinueReading).toHaveBeenCalledTimes(1);
    expect(onContinueReading).toHaveBeenCalledWith(mockBooks[0]);
  });
});
