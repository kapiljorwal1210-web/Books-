package com.example.ui.model

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import com.example.ui.theme.*

enum class ReaderTheme(
    val label: String,
    val backgroundColor: Color,
    val textColor: Color,
    val surfaceColor: Color
) {
    SEPIA(
        label = "Sepia (Classic)",
        backgroundColor = BookSepiaBg,
        textColor = BookSepiaText,
        surfaceColor = Color(0xFFEADFC6)
    ),
    PAPER(
        label = "Paper White",
        backgroundColor = BookWhiteBg,
        textColor = BookWhiteText,
        surfaceColor = Color(0xFFF0F0F0)
    ),
    NIGHT(
        label = "Night Dark",
        backgroundColor = BookDarkBg,
        textColor = BookDarkText,
        surfaceColor = Color(0xFF26292B)
    ),
    MINT(
        label = "Eye Comfort",
        backgroundColor = BookMintBg,
        textColor = BookMintText,
        surfaceColor = Color(0xFFD4EBD7)
    )
}

enum class ReaderFont(val label: String, val fontFamily: FontFamily) {
    SERIF("Serif (Book)", FontFamily.Serif),
    SANS("Sans (Clean)", FontFamily.SansSerif),
    MONO("Mono (Draft)", FontFamily.Monospace)
}

enum class ReaderMode(val label: String) {
    PAGINATED("PDF Page Flip"),
    SCROLL("Continuous Scroll")
}

data class ReaderConfig(
    val fontSizeSp: Float = 18f,
    val theme: ReaderTheme = ReaderTheme.SEPIA,
    val font: ReaderFont = ReaderFont.SERIF,
    val mode: ReaderMode = ReaderMode.PAGINATED,
    val lineSpacingMultiplier: Float = 1.6f
)
