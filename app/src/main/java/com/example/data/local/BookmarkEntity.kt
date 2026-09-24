package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "bookmarks")
data class BookmarkEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val bookId: String,
    val pageNumber: Int,
    val quote: String,
    val note: String = "",
    val timestamp: Long = System.currentTimeMillis()
)
