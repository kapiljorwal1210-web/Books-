import { Book } from '../types/book';

interface GutendexPerson {
  name: string;
  birth_year?: number;
  death_year?: number;
}

interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexPerson[];
  subjects: string[];
  languages: string[];
  formats: Record<string, string>;
  download_count: number;
}

interface GutendexApiResponse {
  count: number;
  results: GutendexBook[];
}

export const gutendexService = {
  async searchOnline(query: string): Promise<Book[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const url = `https://gutendex.com/books/?search=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to search online catalog (HTTP ${response.status})`);
    }

    const data: GutendexApiResponse = await response.json();
    return data.results.map(gBook => this.toBook(gBook));
  },

  async fetchBookText(textUrl: string): Promise<string> {
    const response = await fetch(textUrl);
    if (!response.ok) {
      throw new Error(`Failed to download book text (HTTP ${response.status})`);
    }
    return await response.text();
  },

  toBook(gBook: GutendexBook): Book {
    let authorName = 'Unknown Author';
    if (gBook.authors && gBook.authors.length > 0) {
      const raw = gBook.authors[0].name;
      if (raw.includes(',')) {
        const parts = raw.split(',').map(s => s.trim());
        authorName = parts.length >= 2 ? `${parts[1]} ${parts[0]}` : raw;
      } else {
        authorName = raw;
      }
    }

    const coverUrl =
      gBook.formats['image/jpeg'] ||
      gBook.formats['image/png'] ||
      `https://www.gutenberg.org/cache/epub/${gBook.id}/pg${gBook.id}.cover.medium.jpg`;

    const downloadUrl =
      gBook.formats['text/plain; charset=utf-8'] ||
      gBook.formats['text/plain; charset=us-ascii'] ||
      gBook.formats['text/plain'] ||
      `https://www.gutenberg.org/ebooks/${gBook.id}.txt.utf-8`;

    const topic = gBook.subjects?.[0] || 'Classic';
    let cleanCategory = 'Classic Literature';
    if (/poetry|sonnet|verse|poem/i.test(topic)) cleanCategory = 'Poetry';
    else if (/fiction|novel|stories/i.test(topic)) cleanCategory = 'Fiction';
    else if (/philosophy|ethics|thought/i.test(topic)) cleanCategory = 'Philosophy';
    else if (/detective|mystery|crime/i.test(topic)) cleanCategory = 'Mystery';
    else if (/science|nature|astronomy/i.test(topic)) cleanCategory = 'Science';
    else if (/drama|plays|theatre/i.test(topic)) cleanCategory = 'Drama';

    return {
      id: `gutenberg_${gBook.id}`,
      title: gBook.title,
      author: authorName,
      category: cleanCategory,
      coverUrl,
      description: `Public domain classic by ${authorName}. Over ${gBook.download_count?.toLocaleString()} readers worldwide on Project Gutenberg.`,
      language: gBook.languages?.[0] || 'en',
      downloadUrl,
      isDownloaded: false,
      lastReadTimestamp: 0,
      lastReadPage: 1,
      totalPages: 30,
      totalReadingTimeSeconds: 0,
      readingSessionsCount: 0,
      isFavorite: false,
      fileSizeBytes: 0,
      contentPreview: 'Free eBook available through Project Gutenberg archive. Download directly into KitabGhar for offline reading.'
    };
  }
};
