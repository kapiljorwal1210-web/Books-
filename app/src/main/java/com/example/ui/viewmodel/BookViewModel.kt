package com.example.ui.viewmodel

import android.app.Application
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.BookEntity
import com.example.data.local.BookmarkEntity
import com.example.data.repository.BookRepository
import com.example.ui.model.ReaderConfig
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Locale

enum class LibraryFilter(val displayName: String) {
    DOWNLOADED("Downloaded (In-App)"),
    ALL("All Books"),
    POETRY("Poetry & Poems"),
    CLASSICS("Classics & Novels"),
    PHILOSOPHY("Philosophy"),
    ONLINE("Search Online Catalog")
}

class BookViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = BookRepository.getInstance(application)

    val allBooks = repository.allBooks.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val downloadedBooks = repository.downloadedBooks.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val downloadedCount = repository.downloadedCount.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0
    )

    val favoriteBooks = repository.favoriteBooks.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val recentBooks = repository.recentBooks.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val searchQuery = MutableStateFlow("")
    val activeFilter = MutableStateFlow(LibraryFilter.DOWNLOADED)

    val onlineBooks = MutableStateFlow<List<BookEntity>>(emptyList())
    val isOnlineLoading = MutableStateFlow(false)
    val onlineError = MutableStateFlow<String?>(null)

    val downloadingBookIds = MutableStateFlow<Set<String>>(emptySet())
    val statusMessage = MutableStateFlow<String?>(null)

    // Reader state
    val selectedBookForReading = MutableStateFlow<BookEntity?>(null)
    val readingContent = MutableStateFlow<String?>(null)
    val isLoadingReadingContent = MutableStateFlow(false)
    val currentReadingPage = MutableStateFlow(1)
    val totalReadingPages = MutableStateFlow(1)
    val readerConfig = MutableStateFlow(ReaderConfig())
    val activeBookmarks = MutableStateFlow<List<BookmarkEntity>>(emptyList())

    // Book details sheet
    val selectedBookDetails = MutableStateFlow<BookEntity?>(null)

    // Text to Speech
    private var textToSpeech: TextToSpeech? = null
    val isTtsReady = MutableStateFlow(false)
    val isTtsSpeaking = MutableStateFlow(false)

    private var onlineSearchJob: Job? = null

    // Combined filtered books for the top search bar and filter chips
    val filteredBooks: StateFlow<List<BookEntity>> = combine(
        allBooks,
        downloadedBooks,
        searchQuery,
        activeFilter
    ) { all, downloaded, query, filter ->
        val sourceList = when (filter) {
            LibraryFilter.DOWNLOADED -> downloaded
            LibraryFilter.ALL -> all
            LibraryFilter.POETRY -> all.filter { it.category.contains("Poetry", ignoreCase = true) || it.category.contains("Shayari", ignoreCase = true) }
            LibraryFilter.CLASSICS -> all.filter { it.category.contains("Classic", ignoreCase = true) || it.category.contains("Fiction", ignoreCase = true) }
            LibraryFilter.PHILOSOPHY -> all.filter { it.category.contains("Philosophy", ignoreCase = true) || it.category.contains("Strategy", ignoreCase = true) }
            LibraryFilter.ONLINE -> emptyList()
        }

        if (query.isBlank()) {
            sourceList
        } else {
            val q = query.trim().lowercase(Locale.ROOT)
            sourceList.filter { book ->
                book.title.lowercase(Locale.ROOT).contains(q) ||
                book.author.lowercase(Locale.ROOT).contains(q) ||
                book.category.lowercase(Locale.ROOT).contains(q) ||
                book.description.lowercase(Locale.ROOT).contains(q)
            }
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    init {
        viewModelScope.launch {
            repository.initDatabase()
        }
        initTts()
    }

    private fun initTts() {
        textToSpeech = TextToSpeech(getApplication()) { status ->
            if (status == TextToSpeech.SUCCESS) {
                textToSpeech?.language = Locale.US
                isTtsReady.value = true
                textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        isTtsSpeaking.value = true
                    }
                    override fun onDone(utteranceId: String?) {
                        isTtsSpeaking.value = false
                    }
                    override fun onError(utteranceId: String?) {
                        isTtsSpeaking.value = false
                    }
                })
            }
        }
    }

    fun onSearchQueryChanged(newQuery: String) {
        searchQuery.value = newQuery
        if (activeFilter.value == LibraryFilter.ONLINE && newQuery.length >= 2) {
            triggerOnlineSearchDebounced(newQuery)
        }
    }

    fun onFilterSelected(filter: LibraryFilter) {
        activeFilter.value = filter
        if (filter == LibraryFilter.ONLINE) {
            if (searchQuery.value.length >= 2) {
                searchOnlineBooks(searchQuery.value)
            } else if (onlineBooks.value.isEmpty()) {
                fetchPopularOnlineBooks()
            }
        }
    }

    fun triggerOnlineSearchDebounced(query: String) {
        onlineSearchJob?.cancel()
        onlineSearchJob = viewModelScope.launch {
            delay(500)
            searchOnlineBooks(query)
        }
    }

    fun searchOnlineBooks(query: String) {
        if (query.isBlank()) return
        viewModelScope.launch {
            isOnlineLoading.value = true
            onlineError.value = null
            val result = repository.searchOnlineCatalog(query)
            isOnlineLoading.value = false
            result.onSuccess { books ->
                onlineBooks.value = books
                if (books.isEmpty()) {
                    onlineError.value = "No books found for \"$query\" in free catalog."
                }
            }.onFailure { err ->
                onlineError.value = "Failed to connect to online catalog: ${err.localizedMessage ?: "Unknown error"}"
            }
        }
    }

    fun fetchPopularOnlineBooks() {
        viewModelScope.launch {
            isOnlineLoading.value = true
            onlineError.value = null
            val result = repository.getPopularOnlineCatalog()
            isOnlineLoading.value = false
            result.onSuccess { books ->
                onlineBooks.value = books
            }.onFailure {
                onlineError.value = "Could not load online catalog. Please check internet connection."
            }
        }
    }

    fun downloadBook(book: BookEntity) {
        viewModelScope.launch {
            downloadingBookIds.value = downloadingBookIds.value + book.id
            statusMessage.value = "Downloading \"${book.title}\" to app..."

            // Ensure book exists in Room
            repository.saveBookToLocalCatalog(book)

            val result = repository.downloadBookToAppStorage(book)
            downloadingBookIds.value = downloadingBookIds.value - book.id

            result.onSuccess {
                statusMessage.value = "✓ \"${book.title}\" saved to app library!"
                // Refresh details sheet if active
                if (selectedBookDetails.value?.id == book.id) {
                    selectedBookDetails.value = book.copy(isDownloaded = true)
                }
            }.onFailure { err ->
                statusMessage.value = "Download failed: ${err.localizedMessage}"
            }
        }
    }

    fun removeDownload(book: BookEntity) {
        viewModelScope.launch {
            repository.removeBookDownload(book)
            statusMessage.value = "\"${book.title}\" removed from downloaded library."
            if (selectedBookDetails.value?.id == book.id) {
                selectedBookDetails.value = book.copy(isDownloaded = false)
            }
        }
    }

    fun toggleFavorite(book: BookEntity) {
        viewModelScope.launch {
            repository.toggleFavorite(book)
        }
    }

    fun selectBookDetails(book: BookEntity?) {
        selectedBookDetails.value = book
    }

    fun openReader(book: BookEntity) {
        viewModelScope.launch {
            selectedBookForReading.value = book
            isLoadingReadingContent.value = true
            currentReadingPage.value = book.lastReadPage.coerceAtLeast(1)

            // Save book in local DB if not yet saved
            repository.saveBookToLocalCatalog(book)

            val text = repository.loadBookContent(book)
            readingContent.value = text
            isLoadingReadingContent.value = false

            // Estimate pages
            val total = maxOf(1, text.length / 1400)
            totalReadingPages.value = total

            // Load bookmarks
            repository.getBookmarks(book.id).collect { bmarks ->
                activeBookmarks.value = bmarks
            }
        }
    }

    fun closeReader() {
        stopTts()
        selectedBookForReading.value?.let { book ->
            val page = currentReadingPage.value
            val total = totalReadingPages.value
            viewModelScope.launch {
                repository.updateReadingProgress(book.id, page, total)
            }
        }
        selectedBookForReading.value = null
        readingContent.value = null
    }

    fun goToPage(page: Int) {
        val validPage = page.coerceIn(1, totalReadingPages.value.coerceAtLeast(1))
        currentReadingPage.value = validPage
        selectedBookForReading.value?.let { book ->
            viewModelScope.launch {
                repository.updateReadingProgress(book.id, validPage, totalReadingPages.value)
            }
        }
    }

    fun addBookmarkForCurrentPage(quote: String, note: String = "") {
        selectedBookForReading.value?.let { book ->
            viewModelScope.launch {
                repository.addBookmark(book.id, currentReadingPage.value, quote, note)
                statusMessage.value = "Bookmark saved on Page ${currentReadingPage.value}"
            }
        }
    }

    fun deleteBookmark(id: Long) {
        viewModelScope.launch {
            repository.deleteBookmark(id)
        }
    }

    fun updateReaderConfig(config: ReaderConfig) {
        readerConfig.value = config
    }

    fun toggleTts(textToSpeak: String) {
        if (!isTtsReady.value) {
            statusMessage.value = "Text-to-Speech initializing..."
            return
        }
        if (isTtsSpeaking.value) {
            stopTts()
        } else {
            val cleanText = textToSpeak.take(4000)
            textToSpeech?.speak(cleanText, TextToSpeech.QUEUE_FLUSH, null, "KitabGharTTS")
            isTtsSpeaking.value = true
        }
    }

    private fun stopTts() {
        textToSpeech?.stop()
        isTtsSpeaking.value = false
    }

    fun clearStatusMessage() {
        statusMessage.value = null
    }

    override fun onCleared() {
        super.onCleared()
        textToSpeech?.stop()
        textToSpeech?.shutdown()
    }
}
