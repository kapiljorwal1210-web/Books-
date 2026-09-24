package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.local.BookEntity

@Composable
fun BookItemCard(
    book: BookEntity,
    isDownloading: Boolean,
    onReadClick: () -> Unit,
    onDownloadClick: () -> Unit,
    onFavoriteToggle: () -> Unit,
    onCardClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    ElevatedCard(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onCardClick)
            .testTag("book_card_${book.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Book Cover
            Box(
                modifier = Modifier
                    .width(80.dp)
                    .height(115.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(
                        Brush.verticalGradient(
                            listOf(
                                MaterialTheme.colorScheme.primaryContainer,
                                MaterialTheme.colorScheme.surfaceVariant
                            )
                        )
                    )
            ) {
                if (book.coverUrl.isNotBlank()) {
                    AsyncImage(
                        model = book.coverUrl,
                        contentDescription = "Cover of ${book.title}",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    // Fallback artistic book cover
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(6.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.MenuBook,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = book.category.take(12),
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 9.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            ),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                // In-App Offline Badge on top of cover
                if (book.isDownloaded) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .background(
                                color = Color(0xFF059669),
                                shape = RoundedCornerShape(bottomEnd = 8.dp)
                            )
                            .padding(horizontal = 5.dp, vertical = 2.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Downloaded in App",
                                tint = Color.White,
                                modifier = Modifier.size(10.dp)
                            )
                            Spacer(modifier = Modifier.width(2.dp))
                            Text(
                                text = "App",
                                color = Color.White,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            // Book Details
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Category & Favorite Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.6f)
                    ) {
                        Text(
                            text = book.category,
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                fontSize = 10.sp
                            ),
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    IconButton(
                        onClick = onFavoriteToggle,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = if (book.isFavorite) Icons.Default.Favorite else Icons.Outlined.FavoriteBorder,
                            contentDescription = "Favorite",
                            tint = if (book.isFavorite) Color(0xFFE11D48) else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                // Title
                Text(
                    text = book.title,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        lineHeight = 20.sp
                    ),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                // Author
                Text(
                    text = "By ${book.author}",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 12.sp
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                // Reading Progress if started
                if (book.lastReadTimestamp > 0 && book.totalPages > 0) {
                    val progress = (book.lastReadPage.toFloat() / book.totalPages.toFloat()).coerceIn(0f, 1f)
                    Spacer(modifier = Modifier.height(4.dp))
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Page ${book.lastReadPage} of ${book.totalPages}",
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                color = MaterialTheme.colorScheme.secondary
                            )
                            Text(
                                text = "${(progress * 100).toInt()}%",
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.secondary
                            )
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        LinearProgressIndicator(
                            progress = { progress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp)),
                            color = MaterialTheme.colorScheme.secondary,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Action Buttons Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Read Button
                    Button(
                        onClick = onReadClick,
                        modifier = Modifier
                            .weight(1f)
                            .height(36.dp)
                            .testTag("read_button_${book.id}"),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoStories,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (book.lastReadTimestamp > 0) "Continue" else "Read",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                        )
                    }

                    // Download / Status Button
                    if (book.isDownloaded) {
                        OutlinedButton(
                            onClick = onCardClick,
                            modifier = Modifier
                                .height(36.dp)
                                .testTag("in_app_status_${book.id}"),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color(0xFF047857)
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Default.DownloadDone,
                                contentDescription = "In-App Stored",
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Saved",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold)
                            )
                        }
                    } else {
                        FilledTonalButton(
                            onClick = onDownloadClick,
                            enabled = !isDownloading,
                            modifier = Modifier
                                .height(36.dp)
                                .testTag("download_button_${book.id}"),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp)
                        ) {
                            if (isDownloading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Download,
                                    contentDescription = "Download to App",
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Free",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
