package com.example.data.remote

import okhttp3.OkHttpClient
import okhttp3.Request
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

interface GutendexService {
    @GET("books/")
    suspend fun searchBooks(
        @Query("search") query: String,
        @Query("page") page: Int = 1
    ): GutendexResponse

    @GET("books/")
    suspend fun getPopularBooks(
        @Query("page") page: Int = 1
    ): GutendexResponse

    @GET("books/")
    suspend fun getBooksByTopic(
        @Query("topic") topic: String,
        @Query("page") page: Int = 1
    ): GutendexResponse

    companion object {
        private const val BASE_URL = "https://gutendex.com/"

        val okHttpClient: OkHttpClient by lazy {
            OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build()
        }

        val instance: GutendexService by lazy {
            Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(okHttpClient)
                .addConverterFactory(MoshiConverterFactory.create())
                .build()
                .create(GutendexService::class.java)
        }

        suspend fun downloadBookText(url: String): Result<String> {
            return runCatching {
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", "KitabGhar-FreeBookReader/1.0")
                    .build()
                val response = okHttpClient.newCall(request).execute()
                if (!response.isSuccessful) {
                    throw Exception("Failed to download book: HTTP ${response.code}")
                }
                response.body?.string() ?: throw Exception("Empty book body response")
            }
        }
    }
}
