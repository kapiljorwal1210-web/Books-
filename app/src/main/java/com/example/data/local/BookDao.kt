package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface BookDao {
    @Query("SELECT * FROM books ORDER BY isDownloaded DESC, lastReadTimestamp DESC, title ASC")
    fun getAllBooks(): Flow<List<BookEntity>>

    @Query("SELECT * FROM books WHERE isDownloaded = 1 ORDER BY downloadDate DESC")
    fun getDownloadedBooks(): Flow<List<BookEntity>>

    @Query("""
        SELECT * FROM books 
        WHERE isDownloaded = 1 AND (title LIKE '%' || :query || '%' OR author LIKE '%' || :query || '%' OR category LIKE '%' || :query || '%')
        ORDER BY title ASC
    """)
    fun searchDownloadedBooks(query: String): Flow<List<BookEntity>>

    @Query("""
        SELECT * FROM books 
        WHERE title LIKE '%' || :query || '%' OR author LIKE '%' || :query || '%' OR category LIKE '%' || :query || '%'
        ORDER BY isDownloaded DESC, title ASC
    """)
    fun searchAllBooks(query: String): Flow<List<BookEntity>>

    @Query("SELECT * FROM books WHERE id = :bookId LIMIT 1")
    fun getBookById(bookId: String): Flow<BookEntity?>

    @Query("SELECT * FROM books WHERE id = :bookId LIMIT 1")
    suspend fun getBookByIdSync(bookId: String): BookEntity?

    @Query("SELECT * FROM books WHERE isFavorite = 1 ORDER BY title ASC")
    fun getFavoriteBooks(): Flow<List<BookEntity>>

    @Query("SELECT * FROM books WHERE lastReadTimestamp > 0 ORDER BY lastReadTimestamp DESC LIMIT 10")
    fun getRecentlyReadBooks(): Flow<List<BookEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(book: BookEntity)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(books: List<BookEntity>)

    @Query("""
        UPDATE books 
        SET isDownloaded = :isDownloaded, 
            downloadedFilePath = :filePath, 
            fileSizeBytes = :fileSize, 
            downloadDate = :downloadDate,
            fullContent = :fullContent
        WHERE id = :bookId
    """)
    suspend fun updateDownloadStatus(
        bookId: String,
        isDownloaded: Boolean,
        filePath: String?,
        fileSize: Long,
        downloadDate: Long?,
        fullContent: String?
    )

    @Query("""
        UPDATE books 
        SET lastReadPage = :page, 
            totalPages = :totalPages, 
            lastReadTimestamp = :timestamp 
        WHERE id = :bookId
    """)
    suspend fun updateReadingProgress(bookId: String, page: Int, totalPages: Int, timestamp: Long)

    @Query("UPDATE books SET isFavorite = :isFav WHERE id = :bookId")
    suspend fun setFavorite(bookId: String, isFav: Boolean)

    @Query("""
        UPDATE books 
        SET isDownloaded = 0, 
            downloadedFilePath = NULL, 
            downloadDate = NULL,
            fullContent = NULL
        WHERE id = :bookId
    """)
    suspend fun removeDownload(bookId: String)

    @Query("DELETE FROM books WHERE id = :bookId")
    suspend fun deleteBook(bookId: String)

    @Query("SELECT COUNT(*) FROM books WHERE isDownloaded = 1")
    fun getDownloadedBooksCount(): Flow<Int>
}
