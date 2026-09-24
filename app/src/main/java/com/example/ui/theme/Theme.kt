package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFFBBF24),
    onPrimary = Color(0xFF1E293B),
    primaryContainer = Color(0xFF334155),
    onPrimaryContainer = Color(0xFFFEF3C7),
    secondary = Color(0xFF38BDF8),
    onSecondary = Color(0xFF0F172A),
    background = Color(0xFF0F172A),
    surface = Color(0xFF1E293B),
    onBackground = Color(0xFFF1F5F9),
    onSurface = Color(0xFFF1F5F9),
    surfaceVariant = Color(0xFF293548),
    onSurfaceVariant = Color(0xFFCBD5E1)
)

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF0F172A),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFF1F5F9),
    onPrimaryContainer = Color(0xFF0F172A),
    secondary = Color(0xFFB45309),
    onSecondary = Color.White,
    background = Color(0xFFF8FAFC),
    surface = Color.White,
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A),
    surfaceVariant = Color(0xFFF1F5F9),
    onSurfaceVariant = Color(0xFF475569)
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
