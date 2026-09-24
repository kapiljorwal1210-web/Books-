package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.BookEntity
import com.example.ui.components.BookDetailSheet
import com.example.ui.components.BookItemCard
import com.example.ui.components.TopLibrarySearchBar
import com.example.ui.viewmodel.BookViewModel
import com.example.ui.viewmodel.LibraryFilter

enum class AppNavTab(val title: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    MY_LIBRARY("My Library", Icons.Default.LibraryBooks),
    DISCOVER("Discover & Free", Icons.Default.Explore),
    STORAGE("App Storage", Icons.Default.Storage)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: BookViewModel,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(AppNavTab.MY_LIBRARY) }

    val searchQuery by viewModel.searchQuery.collectAsState()
    val activeFilter by viewModel.activeFilter.collectAsState()
    val downloadedCount by viewModel.downloadedCount.collectAsState()
    val downloadingIds by viewModel.downloadingBookIds.collectAsState()
    val statusMessage by viewModel.statusMessage.collectAsState()

    val filteredBooks by viewModel.filteredBooks.collectAsState()
    val onlineBooks by viewModel.onlineBooks.collectAsState()
    val isOnlineLoading by viewModel.isOnlineLoading.collectAsState()
    val onlineError by viewModel.onlineError.collectAsState()

    val selectedBookDetails by viewModel.selectedBookDetails.collectAsState()
    val recentBooks by viewModel.recentBooks.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    // Show transient status messages
    LaunchedEffect(statusMessage) {
        statusMessage?.let { msg ->
            snackbarHostState.showSnackbar(
                message = msg,
                duration = SnackbarDuration.Short
            )
            viewModel.clearStatusMessage()
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            // Prominent Search Bar with Category & Downloaded Chips at the very top!
            TopLibrarySearchBar(
                query = searchQuery,
                onQueryChanged = { viewModel.onSearchQueryChanged(it) },
                activeFilter = activeFilter,
                onFilterSelected = { filter ->
                    viewModel.onFilterSelected(filter)
                    if (filter == LibraryFilter.ONLINE) {
                        selectedTab = AppNavTab.DISCOVER
                    }
                },
                downloadedCount = downloadedCount,
                onSearchAction = {
                    if (activeFilter == LibraryFilter.ONLINE && searchQuery.isNotBlank()) {
                        viewModel.searchOnlineBooks(searchQuery)
                    }
                },
                modifier = Modifier.statusBarsPadding()
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                AppNavTab.entries.forEach { tab ->
                    NavigationBarItem(
                        selected = selectedTab == tab,
                        onClick = {
                            selectedTab = tab
                            if (tab == AppNavTab.DISCOVER && activeFilter != LibraryFilter.ONLINE) {
                                viewModel.onFilterSelected(LibraryFilter.ONLINE)
                            } else if (tab == AppNavTab.MY_LIBRARY && activeFilter == LibraryFilter.ONLINE) {
                                viewModel.onFilterSelected(LibraryFilter.DOWNLOADED)
                            }
                        },
                        icon = {
                            BadgedBox(
                                badge = {
                                    if (tab == AppNavTab.MY_LIBRARY && downloadedCount > 0) {
                                        Badge { Text("$downloadedCount") }
                                    }
                                }
                            ) {
                                Icon(imageVector = tab.icon, contentDescription = tab.title)
                            }
                        },
                        label = { Text(tab.title) },
                        modifier = Modifier.testTag("nav_tab_${tab.name.lowercase()}")
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                AppNavTab.MY_LIBRARY -> {
                    LibraryTabContent(
                        books = filteredBooks,
                        searchQuery = searchQuery,
                        activeFilter = activeFilter,
                        downloadingIds = downloadingIds,
                        onRead = { viewModel.openReader(it) },
                        onDownload = { viewModel.downloadBook(it) },
                        onFavorite = { viewModel.toggleFavorite(it) },
                        onSelectDetails = { viewModel.selectBookDetails(it) },
                        onSwitchToDiscover = {
                            selectedTab = AppNavTab.DISCOVER
                            viewModel.onFilterSelected(LibraryFilter.ONLINE)
                        }
                    )
                }
                AppNavTab.DISCOVER -> {
                    DiscoverTabContent(
                        searchQuery = searchQuery,
                        onlineBooks = onlineBooks,
                        isLoading = isOnlineLoading,
                        errorMessage = onlineError,
                        downloadingIds = downloadingIds,
                        onSearch = { viewModel.searchOnlineBooks(it) },
                        onRead = { viewModel.openReader(it) },
                        onDownload = { viewModel.downloadBook(it) },
                        onFavorite = { viewModel.toggleFavorite(it) },
                        onSelectDetails = { viewModel.selectBookDetails(it) }
                    )
                }
                AppNavTab.STORAGE -> {
                    StorageInfoContent(
                        downloadedBooks = filteredBooks.filter { it.isDownloaded },
                        onRemoveDownload = { viewModel.removeDownload(it) },
                        onRead = { viewModel.openReader(it) }
                    )
                }
            }
        }
    }

    // Book Detail Modal Sheet
    selectedBookDetails?.let { book ->
        BookDetailSheet(
            book = book,
            isDownloading = downloadingIds.contains(book.id),
            onDismiss = { viewModel.selectBookDetails(null) },
            onRead = { viewModel.openReader(book) },
            onDownload = { viewModel.downloadBook(book) },
            onRemoveDownload = { viewModel.removeDownload(book) },
            onToggleFavorite = { viewModel.toggleFavorite(book) }
        )
    }
}

@Composable
fun LibraryTabContent(
    books: List<BookEntity>,
    searchQuery: String,
    activeFilter: LibraryFilter,
    downloadingIds: Set<String>,
    onRead: (BookEntity) -> Unit,
    onDownload: (BookEntity) -> Unit,
    onFavorite: (BookEntity) -> Unit,
    onSelectDetails: (BookEntity) -> Unit,
    onSwitchToDiscover: () -> Unit
) {
    if (books.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f),
                    modifier = Modifier.size(80.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = if (searchQuery.isNotBlank()) Icons.Default.SearchOff else Icons.Default.LibraryBooks,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(40.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = if (searchQuery.isNotBlank()) {
                        "No matches for \"$searchQuery\""
                    } else if (activeFilter == LibraryFilter.DOWNLOADED) {
                        "No books downloaded yet"
                    } else {
                        "No books found in this category"
                    },
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = if (searchQuery.isNotBlank()) {
                        "Try searching another keyword or search the free online catalog."
                    } else {
                        "Books downloaded in KitabGhar are stored safely in the app for offline reading."
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 24.dp)
                )

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = onSwitchToDiscover,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(imageVector = Icons.Default.Explore, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Browse & Download Free Books")
                }
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header Info Banner
            item {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Verified,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = if (activeFilter == LibraryFilter.DOWNLOADED) {
                                    if (searchQuery.isBlank()) "Downloaded Library (In-App Offline)" else "Searching Downloaded Library"
                                } else {
                                    activeFilter.displayName
                                },
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = "Found ${books.size} ${if (books.size == 1) "book" else "books"}. Stored securely inside the app.",
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            // List of books
            items(books, key = { it.id }) { book ->
                BookItemCard(
                    book = book,
                    isDownloading = downloadingIds.contains(book.id),
                    onReadClick = { onRead(book) },
                    onDownloadClick = { onDownload(book) },
                    onFavoriteToggle = { onFavorite(book) },
                    onCardClick = { onSelectDetails(book) }
                )
            }
        }
    }
}

@Composable
fun DiscoverTabContent(
    searchQuery: String,
    onlineBooks: List<BookEntity>,
    isLoading: Boolean,
    errorMessage: String?,
    downloadingIds: Set<String>,
    onSearch: (String) -> Unit,
    onRead: (BookEntity) -> Unit,
    onDownload: (BookEntity) -> Unit,
    onFavorite: (BookEntity) -> Unit,
    onSelectDetails: (BookEntity) -> Unit
) {
    Column(modifier = Modifier.fillMaxSize()) {
        // Quick Category Suggestions
        val quickTopics = listOf(
            "Poetry", "Gitanjali", "Premchand", "Sherlock Holmes",
            "Philosophy", "Shakespeare", "Jane Austen", "History"
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = "Trending:",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.secondary
                ),
                modifier = Modifier.align(Alignment.CenterVertically)
            )
            quickTopics.take(4).forEach { topic ->
                SuggestionChip(
                    onClick = { onSearch(topic) },
                    label = { Text(topic, fontSize = 11.sp) }
                )
            }
        }

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator()
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Searching 70,000+ free public domain books...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else if (errorMessage != null && onlineBooks.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.secondary,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    FilledTonalButton(onClick = { onSearch(searchQuery.ifBlank { "Classic" }) }) {
                        Text("Retry Search")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Text(
                        text = "Free Public Domain Catalog (${onlineBooks.size} results)",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }

                items(onlineBooks, key = { it.id }) { book ->
                    BookItemCard(
                        book = book,
                        isDownloading = downloadingIds.contains(book.id),
                        onReadClick = { onRead(book) },
                        onDownloadClick = { onDownload(book) },
                        onFavoriteToggle = { onFavorite(book) },
                        onCardClick = { onSelectDetails(book) }
                    )
                }
            }
        }
    }
}

@Composable
fun StorageInfoContent(
    downloadedBooks: List<BookEntity>,
    onRemoveDownload: (BookEntity) -> Unit,
    onRead: (BookEntity) -> Unit
) {
    val totalBytes = downloadedBooks.sumOf { it.fileSizeBytes }
    val totalKb = (totalBytes / 1024)

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.elevatedCardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.PhoneAndroid,
                            contentDescription = null,
                            tint = Color(0xFF059669),
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "In-App Private Storage",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                            Text(
                                text = "Zero clutter on phone's external storage",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Divider()

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "Downloaded Books",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "${downloadedBooks.size} Books",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "App Cache Size",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = if (totalKb > 1024) "${totalKb / 1024} MB" else "$totalKb KB",
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFFECFDF5)
                    ) {
                        Text(
                            text = "✓ Note: All books are 100% free and stored internally within KitabGhar's private app directory (files/books). They do not fill up your phone's personal gallery or public downloads folder.",
                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, color = Color(0xFF065F46)),
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }
            }
        }

        item {
            Text(
                text = "Manage Downloaded Files",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        if (downloadedBooks.isEmpty()) {
            item {
                Text(
                    text = "No downloaded books found in app storage.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            items(downloadedBooks, key = { it.id }) { book ->
                OutlinedCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = book.title,
                                style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                                maxLines = 1
                            )
                            Text(
                                text = "${book.author} • ${(book.fileSizeBytes / 1024).coerceAtLeast(1)} KB",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        IconButton(onClick = { onRead(book) }) {
                            Icon(
                                imageVector = Icons.Default.AutoStories,
                                contentDescription = "Read",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }

                        IconButton(onClick = { onRemoveDownload(book) }) {
                            Icon(
                                imageVector = Icons.Default.DeleteOutline,
                                contentDescription = "Delete Download",
                                tint = MaterialTheme.colorScheme.error
                            )
                        }
                    }
                }
            }
        }
    }
}
