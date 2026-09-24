package com.example.data.remote

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class GutendexResponse(
    val count: Int = 0,
    val next: String? = null,
    val previous: String? = null,
    val results: List<GutendexBook> = emptyList()
)

@JsonClass(generateAdapter = true)
data class GutendexBook(
    val id: Int,
    val title: String,
    val authors: List<GutendexPerson> = emptyList(),
    val subjects: List<String> = emptyList(),
    val languages: List<String> = emptyList(),
    val formats: Map<String, String> = emptyMap(),
    @Json(name = "download_count")
    val downloadCount: Int = 0
) {
    val authorName: String
        get() = if (authors.isNotEmpty()) {
            val raw = authors.first().name
            // Normalize "Austen, Jane" -> "Jane Austen"
            if (raw.contains(",")) {
                val parts = raw.split(",").map { it.trim() }
                if (parts.size >= 2) "${parts[1]} ${parts[0]}" else raw
            } else raw
        } else "Unknown Author"

    val coverImageUrl: String
        get() = formats["image/jpeg"]
            ?: formats["image/png"]
            ?: "https://www.gutenberg.org/cache/epub/$id/pg$id.cover.medium.jpg"

    val textDownloadUrl: String?
        get() = formats["text/plain; charset=utf-8"]
            ?: formats["text/plain; charset=us-ascii"]
            ?: formats["text/plain"]
            ?: formats["text/html; charset=utf-8"]
            ?: formats["text/html"]
            ?: "https://www.gutenberg.org/ebooks/$id.txt.utf-8"
}

@JsonClass(generateAdapter = true)
data class GutendexPerson(
    val name: String = "",
    @Json(name = "birth_year")
    val birthYear: Int? = null,
    @Json(name = "death_year")
    val deathYear: Int? = null
)
