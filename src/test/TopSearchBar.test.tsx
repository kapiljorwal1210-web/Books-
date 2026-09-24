import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopSearchBar } from '../components/TopSearchBar';

describe('TopSearchBar', () => {
  it('renders search input and responds to input changes', () => {
    const onQueryChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <TopSearchBar
        query=""
        onQueryChange={onQueryChange}
        activeFilter="downloaded"
        onFilterChange={onFilterChange}
        downloadedCount={3}
        totalLocalCount={8}
        filteredResultCount={3}
        totalReadingTimeText="1h 34m"
      />
    );

    const input = screen.getByTestId('library_search_input');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Tagore' } });
    expect(onQueryChange).toHaveBeenCalledWith('Tagore');
  });

  it('renders total reading time badge and in-app downloaded count', () => {
    const onQueryChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <TopSearchBar
        query=""
        onQueryChange={onQueryChange}
        activeFilter="downloaded"
        onFilterChange={onFilterChange}
        downloadedCount={4}
        totalLocalCount={8}
        filteredResultCount={4}
        totalReadingTimeText="2h 10m"
      />
    );

    expect(screen.getByText('2h 10m')).toBeInTheDocument();
    expect(screen.getByText('4 in App Storage')).toBeInTheDocument();
  });

  it('fires filter change when filter chip is clicked', () => {
    const onQueryChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <TopSearchBar
        query=""
        onQueryChange={onQueryChange}
        activeFilter="downloaded"
        onFilterChange={onFilterChange}
        downloadedCount={3}
        totalLocalCount={8}
        filteredResultCount={3}
      />
    );

    const poetryChip = screen.getByRole('button', { name: /Poetry/i });
    fireEvent.click(poetryChip);
    expect(onFilterChange).toHaveBeenCalledWith('poetry');
  });

  it('allows clearing query when text is present', () => {
    const onQueryChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <TopSearchBar
        query="Premchand"
        onQueryChange={onQueryChange}
        activeFilter="downloaded"
        onFilterChange={onFilterChange}
        downloadedCount={3}
        totalLocalCount={8}
        filteredResultCount={1}
      />
    );

    const clearBtn = screen.getByTitle('Clear search');
    fireEvent.click(clearBtn);
    expect(onQueryChange).toHaveBeenCalledWith('');
  });
});
