package com.example.ui.reader

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.BookEntity
import com.example.data.local.BookmarkEntity
import com.example.ui.model.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookReaderScreen(
    book: BookEntity,
    content: String?,
    isLoading: Boolean,
    currentPage: Int,
    totalPages: Int,
    readerConfig: ReaderConfig,
    isTtsPlaying: Boolean,
    bookmarks: List<BookmarkEntity>,
    onBack: () -> Unit,
    onPageChanged: (Int) -> Unit,
    onConfigChanged: (ReaderConfig) -> Unit,
    onToggleTts: (String) -> Unit,
    onAddBookmark: (String) -> Unit,
    onDeleteBookmark: (Long) -> Unit
) {
    var showControls by remember { mutableStateOf(true) }
    var showSettingsSheet by remember { mutableStateOf(false) }
    var showBookmarksSheet by remember { mutableStateOf(false) }

    // Split text into readable pages
    val pages = remember(content) {
        if (content.isNullOrBlank()) {
            listOf("Loading content...")
        } else {
            paginateContent(content, charsPerPage = 1350)
        }
    }

    val actualTotalPages = remember(pages) { maxOf(1, pages.size) }
    val safeCurrentPage = currentPage.coerceIn(1, actualTotalPages)
    val currentPageContent = pages.getOrElse(safeCurrentPage - 1) { "" }

    val theme = readerConfig.theme

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(theme.backgroundColor)
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        // Content Area
        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = theme.textColor)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Loading book text...",
                        color = theme.textColor,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        } else {
            when (readerConfig.mode) {
                ReaderMode.PAGINATED -> {
                    // Page flip mode with gesture and tap zones
                    var dragOffset by remember { mutableFloatStateOf(0f) }

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .pointerInput(safeCurrentPage, actualTotalPages) {
                                detectHorizontalDragGestures(
                                    onDragEnd = {
                                        if (dragOffset < -60f && safeCurrentPage < actualTotalPages) {
                                            onPageChanged(safeCurrentPage + 1)
                                        } else if (dragOffset > 60f && safeCurrentPage > 1) {
                                            onPageChanged(safeCurrentPage - 1)
                                        }
                                        dragOffset = 0f
                                    },
                                    onHorizontalDrag = { _, dragAmount ->
                                        dragOffset += dragAmount
                                    }
                                )
                            }
                            .clickable {
                                showControls = !showControls
                            }
                            .padding(
                                top = if (showControls) 64.dp else 24.dp,
                                bottom = if (showControls) 80.dp else 32.dp,
                                start = 20.dp,
                                end = 20.dp
                            )
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(rememberScrollState()),
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            // Page Header
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = book.title,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontFamily = readerConfig.font.fontFamily,
                                        fontSize = 11.sp,
                                        color = theme.textColor.copy(alpha = 0.6f)
                                    ),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                    modifier = Modifier.weight(1f, fill = false)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Ch. ${(safeCurrentPage / 5) + 1}",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontSize = 11.sp,
                                        color = theme.textColor.copy(alpha = 0.6f)
                                    )
                                )
                            }

                            // Main Page Text Body
                            Text(
                                text = currentPageContent,
                                style = MaterialTheme.typography.bodyLarge.copy(
                                    fontSize = readerConfig.fontSizeSp.sp,
                                    lineHeight = (readerConfig.fontSizeSp * readerConfig.lineSpacingMultiplier).sp,
                                    fontFamily = readerConfig.font.fontFamily,
                                    color = theme.textColor
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("reader_page_text")
                            )

                            // Page Footer Indicator
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 16.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "— $safeCurrentPage / $actualTotalPages —",
                                    style = MaterialTheme.typography.labelMedium.copy(
                                        fontFamily = readerConfig.font.fontFamily,
                                        fontSize = 12.sp,
                                        color = theme.textColor.copy(alpha = 0.5f),
                                        fontWeight = FontWeight.Medium
                                    )
                                )
                            }
                        }
                    }
                }
                ReaderMode.SCROLL -> {
                    // Continuous Scroll Mode
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .clickable { showControls = !showControls }
                            .padding(
                                top = if (showControls) 64.dp else 24.dp,
                                bottom = if (showControls) 80.dp else 32.dp,
                                start = 20.dp,
                                end = 20.dp
                            )
                    ) {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            items(pages) { pageText ->
                                Text(
                                    text = pageText,
                                    style = MaterialTheme.typography.bodyLarge.copy(
                                        fontSize = readerConfig.fontSizeSp.sp,
                                        lineHeight = (readerConfig.fontSizeSp * readerConfig.lineSpacingMultiplier).sp,
                                        fontFamily = readerConfig.font.fontFamily,
                                        color = theme.textColor
                                    ),
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Divider(
                                    color = theme.textColor.copy(alpha = 0.15f),
                                    modifier = Modifier.padding(vertical = 12.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Top App Bar
        AnimatedVisibility(
            visible = showControls,
            enter = fadeIn() + slideInVertically { -it },
            exit = fadeOut() + slideOutVertically { -it },
            modifier = Modifier.align(Alignment.TopCenter)
        ) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = theme.surfaceColor.copy(alpha = 0.95f),
                tonalElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier.testTag("reader_back_button")
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = theme.textColor
                        )
                    }

                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 8.dp)
                    ) {
                        Text(
                            text = book.title,
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = theme.textColor
                            ),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = book.author,
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontSize = 11.sp,
                                color = theme.textColor.copy(alpha = 0.7f)
                            ),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    // Text to Speech Read Aloud Button
                    IconButton(
                        onClick = { onToggleTts(currentPageContent) },
                        modifier = Modifier.testTag("reader_tts_button")
                    ) {
                        Icon(
                            imageVector = if (isTtsPlaying) Icons.Default.VolumeUp else Icons.Default.VolumeMute,
                            contentDescription = "Read Aloud",
                            tint = if (isTtsPlaying) MaterialTheme.colorScheme.primary else theme.textColor
                        )
                    }

                    // Bookmark Current Page
                    IconButton(
                        onClick = {
                            val snippet = currentPageContent.take(120).replace("\n", " ") + "..."
                            onAddBookmark(snippet)
                        },
                        modifier = Modifier.testTag("reader_add_bookmark_button")
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.BookmarkBorder,
                            contentDescription = "Bookmark",
                            tint = theme.textColor
                        )
                    }

                    // All Bookmarks List
                    IconButton(
                        onClick = { showBookmarksSheet = true },
                        modifier = Modifier.testTag("reader_bookmarks_list_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Bookmarks,
                            contentDescription = "Saved Bookmarks",
                            tint = theme.textColor
                        )
                    }

                    // Reader Appearance Settings
                    IconButton(
                        onClick = { showSettingsSheet = true },
                        modifier = Modifier.testTag("reader_settings_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.FormatSize,
                            contentDescription = "Settings",
                            tint = theme.textColor
                        )
                    }
                }
            }
        }

        // Bottom Controls Bar (Slider, Prev/Next page)
        AnimatedVisibility(
            visible = showControls,
            enter = fadeIn() + slideInVertically { it },
            exit = fadeOut() + slideOutVertically { it },
            modifier = Modifier.align(Alignment.BottomCenter)
        ) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = theme.surfaceColor.copy(alpha = 0.95f),
                tonalElevation = 6.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    // Page Navigation Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Previous Page Button
                        FilledTonalIconButton(
                            onClick = {
                                if (safeCurrentPage > 1) {
                                    onPageChanged(safeCurrentPage - 1)
                                }
                            },
                            enabled = safeCurrentPage > 1,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ChevronLeft,
                                contentDescription = "Previous Page",
                                tint = theme.textColor
                            )
                        }

                        // Page Info & Percent
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "Page $safeCurrentPage of $actualTotalPages",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = theme.textColor
                                )
                            )
                            val percent = ((safeCurrentPage.toFloat() / actualTotalPages.toFloat()) * 100).toInt()
                            Text(
                                text = "$percent% completed",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontSize = 10.sp,
                                    color = theme.textColor.copy(alpha = 0.6f)
                                )
                            )
                        }

                        // Next Page Button
                        FilledTonalIconButton(
                            onClick = {
                                if (safeCurrentPage < actualTotalPages) {
                                    onPageChanged(safeCurrentPage + 1)
                                }
                            },
                            enabled = safeCurrentPage < actualTotalPages,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ChevronRight,
                                contentDescription = "Next Page",
                                tint = theme.textColor
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    // Quick Jump Slider
                    if (actualTotalPages > 1) {
                        Slider(
                            value = safeCurrentPage.toFloat(),
                            onValueChange = { newPageFloat ->
                                onPageChanged(newPageFloat.toInt())
                            },
                            valueRange = 1f..actualTotalPages.toFloat(),
                            steps = if (actualTotalPages > 2) actualTotalPages - 2 else 0,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(24.dp)
                                .testTag("reader_page_slider")
                        )
                    }
                }
            }
        }
    }

    // Appearance Settings Bottom Sheet
    if (showSettingsSheet) {
        ReaderSettingsSheet(
            config = readerConfig,
            onConfigChanged = onConfigChanged,
            onDismiss = { showSettingsSheet = false }
        )
    }

    // Bookmarks List Bottom Sheet
    if (showBookmarksSheet) {
        BookmarksSheet(
            bookmarks = bookmarks,
            onSelectBookmark = { page ->
                onPageChanged(page)
                showBookmarksSheet = false
            },
            onDeleteBookmark = onDeleteBookmark,
            onDismiss = { showBookmarksSheet = false }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderSettingsSheet(
    config: ReaderConfig,
    onConfigChanged: (ReaderConfig) -> Unit,
    onDismiss: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 36.dp)
        ) {
            Text(
                text = "Reader Appearance",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Font Size Row
            Text(
                text = "Font Size: ${config.fontSizeSp.toInt()} sp",
                style = MaterialTheme.typography.labelLarge
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        val newSize = (config.fontSizeSp - 2f).coerceAtLeast(14f)
                        onConfigChanged(config.copy(fontSizeSp = newSize))
                    },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("A- Smaller")
                }
                Button(
                    onClick = {
                        val newSize = (config.fontSizeSp + 2f).coerceAtMost(28f)
                        onConfigChanged(config.copy(fontSizeSp = newSize))
                    },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("A+ Larger")
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Themes
            Text(
                text = "Theme Palette",
                style = MaterialTheme.typography.labelLarge
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ReaderTheme.entries.forEach { theme ->
                    val isSelected = config.theme == theme
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(theme.backgroundColor)
                            .clickable { onConfigChanged(config.copy(theme = theme)) }
                            .padding(4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = theme.label.split(" ").first(),
                            color = theme.textColor,
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Medium
                            )
                        )
                        if (isSelected) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(theme.textColor)
                                    .align(Alignment.BottomCenter)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Typeface Font
            Text(
                text = "Book Typeface",
                style = MaterialTheme.typography.labelLarge
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ReaderFont.entries.forEach { fontOption ->
                    FilterChip(
                        selected = config.font == fontOption,
                        onClick = { onConfigChanged(config.copy(font = fontOption)) },
                        label = { Text(fontOption.label) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Reading Layout (PDF Flip vs Scroll)
            Text(
                text = "Reading Mode",
                style = MaterialTheme.typography.labelLarge
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ReaderMode.entries.forEach { mode ->
                    FilterChip(
                        selected = config.mode == mode,
                        onClick = { onConfigChanged(config.copy(mode = mode)) },
                        label = { Text(mode.label) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookmarksSheet(
    bookmarks: List<BookmarkEntity>,
    onSelectBookmark: (Int) -> Unit,
    onDeleteBookmark: (Long) -> Unit,
    onDismiss: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp)
        ) {
            Text(
                text = "Saved Bookmarks",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
            )

            Spacer(modifier = Modifier.height(16.dp))

            if (bookmarks.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Outlined.BookmarkBorder,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No bookmarks saved yet.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Tap the bookmark icon on any page to save quotes.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(bookmarks) { bmark ->
                        ElevatedCard(
                            onClick = { onSelectBookmark(bmark.pageNumber) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Page ${bmark.pageNumber}",
                                        style = MaterialTheme.typography.labelLarge.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    )
                                    if (bmark.quote.isNotBlank()) {
                                        Text(
                                            text = "\"${bmark.quote}\"",
                                            style = MaterialTheme.typography.bodySmall,
                                            maxLines = 2,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                }
                                IconButton(onClick = { onDeleteBookmark(bmark.id) }) {
                                    Icon(
                                        imageVector = Icons.Default.Delete,
                                        contentDescription = "Delete",
                                        tint = MaterialTheme.colorScheme.error,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Splits text into pages preserving paragraph boundaries where possible.
 */
private fun paginateContent(fullText: String, charsPerPage: Int): List<String> {
    if (fullText.length <= charsPerPage) {
        return listOf(fullText)
    }

    val pages = mutableListOf<String>()
    var startIndex = 0

    while (startIndex < fullText.length) {
        val targetEnd = (startIndex + charsPerPage).coerceAtMost(fullText.length)
        var actualEnd = targetEnd

        // Try breaking at a double newline or newline
        if (actualEnd < fullText.length) {
            val lastParagraphBreak = fullText.lastIndexOf("\n\n", actualEnd)
            if (lastParagraphBreak > startIndex + (charsPerPage * 0.6)) {
                actualEnd = lastParagraphBreak + 2
            } else {
                val lastSentenceBreak = fullText.lastIndexOf(". ", actualEnd)
                if (lastSentenceBreak > startIndex + (charsPerPage * 0.6)) {
                    actualEnd = lastSentenceBreak + 2
                }
            }
        }

        val page = fullText.substring(startIndex, actualEnd).trim()
        if (page.isNotBlank()) {
            pages.add(page)
        }
        startIndex = actualEnd
    }

    return if (pages.isEmpty()) listOf(fullText) else pages
}
