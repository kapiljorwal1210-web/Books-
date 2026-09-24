package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "books")
data class BookEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val author: String,
    val category: String,
    val coverUrl: String = "",
    val description: String = "",
    val language: String = "en",
    val downloadUrl: String? = null,
    val isDownloaded: Boolean = false,
    val downloadedFilePath: String? = null,
    val downloadDate: Long? = null,
    val lastReadTimestamp: Long = 0L,
    val lastReadPage: Int = 1,
    val totalPages: Int = 20,
    val isFavorite: Boolean = false,
    val fileSizeBytes: Long = 0L,
    val contentPreview: String = "",
    val fullContent: String? = null
)
