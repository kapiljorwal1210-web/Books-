package com.example.data.repository

import android.content.Context
import com.example.data.catalog.DefaultLibraryData
import com.example.data.local.AppDatabase
import com.example.data.local.BookDao
import com.example.data.local.BookEntity
import com.example.data.local.BookmarkDao
import com.example.data.local.BookmarkEntity
import com.example.data.remote.GutendexBook
import com.example.data.remote.GutendexService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import java.io.File

class BookRepository(
    private val context: Context,
    private val bookDao: BookDao,
    private val bookmarkDao: BookmarkDao
) {
    val allBooks: Flow<List<BookEntity>> = bookDao.getAllBooks()
    val downloadedBooks: Flow<List<BookEntity>> = bookDao.getDownloadedBooks()
    val downloadedCount: Flow<Int> = bookDao.getDownloadedBooksCount()
    val favoriteBooks: Flow<List<BookEntity>> = bookDao.getFavoriteBooks()
    val recentBooks: Flow<List<BookEntity>> = bookDao.getRecentlyReadBooks()

    suspend fun initDatabase() = withContext(Dispatchers.IO) {
        val currentCount = downloadedCount.first()
        val all = allBooks.first()
        if (all.isEmpty()) {
            val booksDir = File(context.filesDir, "books").apply { mkdirs() }
            val booksToSeed = DefaultLibraryData.initialBooks.map { book ->
                if (book.isDownloaded && !book.fullContent.isNullOrBlank()) {
                    val file = File(booksDir, "${book.id}.txt")
                    file.writeText(book.fullContent)
                    book.copy(
                        downloadedFilePath = file.absolutePath,
                        fileSizeBytes = file.length(),
                        downloadDate = System.currentTimeMillis()
                    )
                } else {
                    book
                }
            }
            bookDao.insertAll(booksToSeed)
        }
    }

    fun searchDownloadedBooks(query: String): Flow<List<BookEntity>> {
        val trimmed = query.trim()
        return if (trimmed.isEmpty()) {
            bookDao.getDownloadedBooks()
        } else {
            bookDao.searchDownloadedBooks(trimmed)
        }
    }

    fun searchAllLocalBooks(query: String): Flow<List<BookEntity>> {
        val trimmed = query.trim()
        return if (trimmed.isEmpty()) {
            bookDao.getAllBooks()
        } else {
            bookDao.searchAllBooks(trimmed)
        }
    }

    fun getBookById(id: String): Flow<BookEntity?> {
        return bookDao.getBookById(id)
    }

    suspend fun searchOnlineCatalog(query: String): Result<List<BookEntity>> = withContext(Dispatchers.IO) {
        runCatching {
            val response = GutendexService.instance.searchBooks(query)
            response.results.map { it.toBookEntity() }
        }
    }

    suspend fun getPopularOnlineCatalog(): Result<List<BookEntity>> = withContext(Dispatchers.IO) {
        runCatching {
            val response = GutendexService.instance.getPopularBooks()
            response.results.map { it.toBookEntity() }
        }
    }

    suspend fun downloadBookToAppStorage(book: BookEntity): Result<Unit> = withContext(Dispatchers.IO) {
        runCatching {
            val booksDir = File(context.filesDir, "books").apply { mkdirs() }
            val targetFile = File(booksDir, "${book.id}.txt")

            var content = book.fullContent
            if (content.isNullOrBlank() && !book.downloadUrl.isNullOrBlank()) {
                val downloaded = GutendexService.downloadBookText(book.downloadUrl)
                content = downloaded.getOrThrow()
            }

            if (content.isNullOrBlank()) {
                content = generateReaderContent(book)
            }

            targetFile.writeText(content)

            // Calculate estimated pages (approx 1800 characters per page)
            val calculatedPages = maxOf(1, (content.length / 1800))

            bookDao.updateDownloadStatus(
                bookId = book.id,
                isDownloaded = true,
                filePath = targetFile.absolutePath,
                fileSize = targetFile.length(),
                downloadDate = System.currentTimeMillis(),
                fullContent = content
            )
        }
    }

    suspend fun removeBookDownload(book: BookEntity) = withContext(Dispatchers.IO) {
        book.downloadedFilePath?.let { path ->
            val file = File(path)
            if (file.exists()) {
                file.delete()
            }
        }
        bookDao.removeDownload(book.id)
    }

    suspend fun loadBookContent(book: BookEntity): String = withContext(Dispatchers.IO) {
        // 1. Try reading from internal downloaded file
        if (!book.downloadedFilePath.isNullOrBlank()) {
            val file = File(book.downloadedFilePath)
            if (file.exists() && file.length() > 0) {
                return@withContext file.readText()
            }
        }

        // 2. Try fullContent field
        if (!book.fullContent.isNullOrBlank()) {
            return@withContext book.fullContent
        }

        // 3. Try downloading if downloadUrl is available
        if (!book.downloadUrl.isNullOrBlank()) {
            val result = GutendexService.downloadBookText(book.downloadUrl)
            if (result.isSuccess) {
                val fetched = result.getOrThrow()
                // Cache it locally in app sandbox
                val booksDir = File(context.filesDir, "books").apply { mkdirs() }
                val targetFile = File(booksDir, "${book.id}.txt")
                targetFile.writeText(fetched)
                bookDao.updateDownloadStatus(
                    bookId = book.id,
                    isDownloaded = true,
                    filePath = targetFile.absolutePath,
                    fileSize = targetFile.length(),
                    downloadDate = System.currentTimeMillis(),
                    fullContent = fetched
                )
                return@withContext fetched
            }
        }

        // 4. Fallback generated book text
        generateReaderContent(book)
    }

    suspend fun updateReadingProgress(bookId: String, page: Int, totalPages: Int) = withContext(Dispatchers.IO) {
        bookDao.updateReadingProgress(bookId, page, totalPages, System.currentTimeMillis())
    }

    suspend fun toggleFavorite(book: BookEntity) = withContext(Dispatchers.IO) {
        bookDao.setFavorite(book.id, !book.isFavorite)
    }

    fun getBookmarks(bookId: String): Flow<List<BookmarkEntity>> {
        return bookmarkDao.getBookmarksForBook(bookId)
    }

    suspend fun addBookmark(bookId: String, page: Int, quote: String, note: String = "") = withContext(Dispatchers.IO) {
        bookmarkDao.insertBookmark(
            BookmarkEntity(
                bookId = bookId,
                pageNumber = page,
                quote = quote,
                note = note
            )
        )
    }

    suspend fun deleteBookmark(id: Long) = withContext(Dispatchers.IO) {
        bookmarkDao.deleteBookmark(id)
    }

    suspend fun saveBookToLocalCatalog(book: BookEntity) = withContext(Dispatchers.IO) {
        bookDao.insertOrUpdate(book)
    }

    private fun generateReaderContent(book: BookEntity): String {
        return """
${book.title.uppercase()}
By ${book.author}
Category: ${book.category}
Language: ${book.language}

--- INTRODUCTION ---
${book.description.ifBlank { "A classic literary masterpiece from the world of public domain literature, freely accessible for reading in KitabGhar." }}

--- CHAPTER 1 ---
In the quiet halls of literature, every word penned by ${book.author} reverberates across time. This edition has been formatted for digital reading directly inside your KitabGhar reader.

Enjoy this immersive, distraction-free reading experience. You can customize font size, typeface, reader theme (Sepia, Dark, Night, Paper), or listen along using Read Aloud.

--- PREVIEW EXCERPT ---
${book.contentPreview.ifBlank { "Full text is available for offline reading in the in-app library." }}
        """.trimIndent()
    }

    private fun GutendexBook.toBookEntity(): BookEntity {
        val topic = subjects.firstOrNull() ?: "Classic Literature"
        val cleanCategory = when {
            topic.contains("Poetry", ignoreCase = true) -> "Poetry"
            topic.contains("Fiction", ignoreCase = true) -> "Fiction"
            topic.contains("Philosophy", ignoreCase = true) -> "Philosophy"
            topic.contains("Science", ignoreCase = true) -> "Science"
            topic.contains("History", ignoreCase = true) -> "History"
            topic.contains("Drama", ignoreCase = true) -> "Drama"
            else -> "Classic"
        }
        return BookEntity(
            id = "gutenberg_$id",
            title = title,
            author = authorName,
            category = cleanCategory,
            coverUrl = coverImageUrl,
            description = "Public domain classic by $authorName. Part of the Gutenberg collection with over $downloadCount readers worldwide.",
            language = languages.firstOrNull() ?: "en",
            downloadUrl = textDownloadUrl,
            isDownloaded = false,
            totalPages = 25,
            isFavorite = false,
            fileSizeBytes = 0L,
            contentPreview = "Free eBook available through Project Gutenberg archive. Download directly into KitabGhar for full offline access."
        )
    }

    companion object {
        @Volatile
        private var INSTANCE: BookRepository? = null

        fun getInstance(context: Context): BookRepository {
            return INSTANCE ?: synchronized(this) {
                val db = AppDatabase.getDatabase(context)
                val instance = BookRepository(
                    context.applicationContext,
                    db.bookDao(),
                    db.bookmarkDao()
                )
                INSTANCE = instance
                instance
            }
        }
    }
}
