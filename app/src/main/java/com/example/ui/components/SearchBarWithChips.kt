package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.DownloadDone
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.viewmodel.LibraryFilter

@Composable
fun TopLibrarySearchBar(
    query: String,
    onQueryChanged: (String) -> Unit,
    activeFilter: LibraryFilter,
    onFilterSelected: (LibraryFilter) -> Unit,
    downloadedCount: Int,
    onSearchAction: () -> Unit,
    modifier: Modifier = Modifier
) {
    val focusManager = LocalFocusManager.current
    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .padding(top = 8.dp, bottom = 4.dp)
    ) {
        // Main Search Bar Input
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f),
            tonalElevation = 2.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 2.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(24.dp)
                )

                Spacer(modifier = Modifier.width(8.dp))

                TextField(
                    value = query,
                    onValueChange = onQueryChanged,
                    placeholder = {
                        Text(
                            text = if (activeFilter == LibraryFilter.DOWNLOADED) {
                                "Search books or authors in downloaded library..."
                            } else {
                                "Search any book, author, poet, or topic..."
                            },
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                                fontSize = 14.sp
                            ),
                            maxLines = 1
                        )
                    },
                    modifier = Modifier
                        .weight(1f)
                        .testTag("library_search_input"),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        disabledContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    ),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(
                        onSearch = {
                            focusManager.clearFocus()
                            onSearchAction()
                        }
                    )
                )

                AnimatedVisibility(
                    visible = query.isNotEmpty(),
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    IconButton(
                        onClick = {
                            onQueryChanged("")
                        },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("clear_search_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Clear,
                            contentDescription = "Clear search",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Horizontal filter chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(scrollState)
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Downloaded filter chip with count badge
            FilterChip(
                selected = activeFilter == LibraryFilter.DOWNLOADED,
                onClick = { onFilterSelected(LibraryFilter.DOWNLOADED) },
                label = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DownloadDone,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Downloaded",
                            fontWeight = if (activeFilter == LibraryFilter.DOWNLOADED) FontWeight.Bold else FontWeight.Normal
                        )
                        Box(
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(
                                    if (activeFilter == LibraryFilter.DOWNLOADED)
                                        MaterialTheme.colorScheme.onPrimary
                                    else
                                        MaterialTheme.colorScheme.primaryContainer
                                )
                                .padding(horizontal = 6.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "$downloadedCount",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (activeFilter == LibraryFilter.DOWNLOADED)
                                        MaterialTheme.colorScheme.primary
                                    else
                                        MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            )
                        }
                    }
                },
                modifier = Modifier.testTag("filter_chip_downloaded"),
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primary,
                    selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                    selectedLeadingIconColor = MaterialTheme.colorScheme.onPrimary
                )
            )

            // Other filters
            LibraryFilter.entries.filter { it != LibraryFilter.DOWNLOADED }.forEach { filter ->
                FilterChip(
                    selected = activeFilter == filter,
                    onClick = { onFilterSelected(filter) },
                    label = {
                        Text(
                            text = filter.displayName,
                            fontWeight = if (activeFilter == filter) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    modifier = Modifier.testTag("filter_chip_${filter.name.lowercase()}"),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.primary,
                        selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                    )
                )
            }
        }
    }
}
