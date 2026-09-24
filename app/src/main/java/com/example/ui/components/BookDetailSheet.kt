package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.local.BookEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookDetailSheet(
    book: BookEntity,
    isDownloading: Boolean,
    onDismiss: () -> Unit,
    onRead: () -> Unit,
    onDownload: () -> Unit,
    onRemoveDownload: () -> Unit,
    onToggleFavorite: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Book Cover Art
            Box(
                modifier = Modifier
                    .width(130.dp)
                    .height(180.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
            ) {
                if (book.coverUrl.isNotBlank()) {
                    AsyncImage(
                        model = book.coverUrl,
                        contentDescription = "Cover",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.MenuBook,
                        contentDescription = null,
                        modifier = Modifier
                            .size(64.dp)
                            .align(Alignment.Center),
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Title
            Text(
                text = book.title,
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                ),
                color = MaterialTheme.colorScheme.onSurface
            )

            // Author
            Text(
                text = "By ${book.author}",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Badges
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                SuggestionChip(
                    onClick = {},
                    label = { Text(book.category) }
                )
                SuggestionChip(
                    onClick = {},
                    label = { Text("Language: ${book.language.uppercase()}") }
                )
                SuggestionChip(
                    onClick = {},
                    label = { Text("Free & Open") }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // In-App Storage Clarification Card (Highlighting user's requirement: downloaded in app, free, not phone files)
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                color = if (book.isDownloaded) Color(0xFFECFDF5) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (book.isDownloaded) Icons.Default.CheckCircle else Icons.Default.CloudDownload,
                        contentDescription = null,
                        tint = if (book.isDownloaded) Color(0xFF059669) else MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = if (book.isDownloaded)
                                "Downloaded in App (Offline Ready)"
                            else
                                "In-App Free Download Available",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = if (book.isDownloaded) Color(0xFF065F46) else MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (book.isDownloaded)
                                "Stored safely inside KitabGhar app memory. Doesn't take up public phone download space."
                            else
                                "Download to read offline anytime anywhere inside KitabGhar without internet.",
                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                            color = if (book.isDownloaded) Color(0xFF047857) else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Description / Synopsis
            Text(
                text = "Synopsis & Overview",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = book.description.ifBlank { "Full literary work available for reading and offline study in KitabGhar." },
                style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 20.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Main Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = {
                        onDismiss()
                        onRead()
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .testTag("sheet_read_button"),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(imageVector = Icons.Default.AutoStories, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Read Now", fontWeight = FontWeight.Bold)
                }

                if (book.isDownloaded) {
                    OutlinedButton(
                        onClick = onRemoveDownload,
                        modifier = Modifier
                            .height(48.dp)
                            .testTag("sheet_remove_download_button"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(imageVector = Icons.Default.DeleteOutline, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Delete Download")
                    }
                } else {
                    FilledTonalButton(
                        onClick = onDownload,
                        enabled = !isDownloading,
                        modifier = Modifier
                            .height(48.dp)
                            .testTag("sheet_download_button"),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        if (isDownloading) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(imageVector = Icons.Default.Download, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Download (Free)")
                        }
                    }
                }
            }
        }
    }
}
