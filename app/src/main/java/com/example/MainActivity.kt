package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.reader.BookReaderScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.BookViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    KitabGharApp()
                }
            }
        }
    }
}

@Composable
fun KitabGharApp(
    viewModel: BookViewModel = viewModel()
) {
    val selectedBookForReading by viewModel.selectedBookForReading.collectAsState()
    val readingContent by viewModel.readingContent.collectAsState()
    val isLoadingReadingContent by viewModel.isLoadingReadingContent.collectAsState()
    val currentReadingPage by viewModel.currentReadingPage.collectAsState()
    val totalReadingPages by viewModel.totalReadingPages.collectAsState()
    val readerConfig by viewModel.readerConfig.collectAsState()
    val isTtsSpeaking by viewModel.isTtsSpeaking.collectAsState()
    val bookmarks by viewModel.activeBookmarks.collectAsState()

    AnimatedContent(
        targetState = selectedBookForReading,
        transitionSpec = {
            if (targetState != null) {
                slideInVertically { it / 2 } + fadeIn() togetherWith fadeOut()
            } else {
                fadeIn() togetherWith slideOutVertically { it / 2 } + fadeOut()
            }
        },
        label = "ScreenTransition"
    ) { bookToRead ->
        if (bookToRead != null) {
            BackHandler {
                viewModel.closeReader()
            }
            BookReaderScreen(
                book = bookToRead,
                content = readingContent,
                isLoading = isLoadingReadingContent,
                currentPage = currentReadingPage,
                totalPages = totalReadingPages,
                readerConfig = readerConfig,
                isTtsPlaying = isTtsSpeaking,
                bookmarks = bookmarks,
                onBack = { viewModel.closeReader() },
                onPageChanged = { viewModel.goToPage(it) },
                onConfigChanged = { viewModel.updateReaderConfig(it) },
                onToggleTts = { viewModel.toggleTts(it) },
                onAddBookmark = { viewModel.addBookmarkForCurrentPage(it) },
                onDeleteBookmark = { viewModel.deleteBookmark(it) }
            )
        } else {
            HomeScreen(viewModel = viewModel)
        }
    }
}
