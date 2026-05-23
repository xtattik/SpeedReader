# Speed Reading Tool (RSVP / Spritz Style) - Implementation Plan

We will create a premium, visually stunning client-side Speed Reading web application. It will allow users to paste text or upload documents, parsing them entirely in the browser, and present them using Rapid Serial Visual Presentation (RSVP) with a fixed, highlighted focal anchor (Optimal Recognition Point).

The application is designed to be **100% portable**. It runs directly as a static webpage (by double-clicking `index.html` or serving it locally) and functions as a **Progressive Web App (PWA)**, meaning it can be installed on any platform (Windows, macOS, Linux, iOS, Android) and works completely offline once cached.

## User Review Required

Please review the updated additions:
1. **New File Formats**:
   - `.odt` (OpenDocument Text) - We will unzip the file using JSZip and extract text from `content.xml` using `DOMParser`.
   - `.epub` (E-books) - We will unzip using JSZip and parse XHTML chapters to extract readable book text.
2. **PWA & Offline Support**:
   - `manifest.json` will make the application installable as a standalone app.
   - `sw.js` (Service Worker) will cache the HTML, CSS, JS, and CDN assets so it works **fully offline** after the first load.
3. **Multi-Word Anchoring**:
   - For 1 word, we highlight the optimal recognition point (ORP).
   - For 2-5 words, we identify the middle word, find its ORP, and align the entire visual unit based on that letter.
4. **Natural Reading Rhythm**:
   - Dynamic delays for punctuation and long words to prevent visual fatigue.

## Proposed Changes

We will create the project inside a new folder `SpeedReader` in the workspace.

### Core Application Structure
We will build a single-page application with modular, clean JS and vanilla CSS to avoid complex bundler setups and make it run instantly and smoothly in any browser.

```
SpeedReader/
├── index.html       # Visual layout, drop zones, controls, and CDN inclusions
├── styles.css       # Fluid glassmorphism UI, transitions, and multiple premium color themes
├── app.js           # Document parsers, RSVP timing engine, keyboard listeners, history manager
├── manifest.json    # PWA configuration for desktop/mobile installation
└── sw.js            # PWA Service Worker for offline asset caching
```

#### [NEW] [index.html](file:///c:/Users/Nathan/OneDrive/Documents/Code Projects/SpeedReader/index.html)
The entry point of the application containing the layout structure:
- **Hero/Dashboard State**: File drop-zone, text paste container, recent reading history, and sample texts.
- **Reader State**: Large visual canvas with horizontal/vertical focal guidelines, interactive media controls, progress bar, time-remaining calculator, and instant settings sidebar.
- CDN integrations for Mammoth.js (docx), PDF.js (pdf), JSZip (epub/odt), and Lucide Icons.

#### [NEW] [styles.css](file:///c:/Users/Nathan/OneDrive/Documents/Code Projects/SpeedReader/styles.css)
A highly polished modern stylesheet featuring:
- Glassmorphism effects with backdrop filters.
- Curated color themes: **OLED Dark (deep charcoal/black)**, **Sepia Warm (easy on the eyes)**, **Cyberpunk Neon (neon accents)**, and **Alpine Light (crisp minimal)**.
- Precision focal line styles matching the font alignment.
- Responsive, premium CSS variables for sizes, transitions, and hover effects.

#### [NEW] [app.js](file:///c:/Users/Nathan/OneDrive/Documents/Code Projects/SpeedReader/app.js)
The core logic containing:
- **Parser Engine**: Functions to read `.txt`, `.md`, `.pdf`, `.docx`, `.odt` (JSZip content.xml extraction), `.epub` (JSZip XHTML parsing), and `.rtf`.
- **RSVP Core**: Timer-driven loop with dynamic delays based on punctuation, speed (100-1200 WPM), and chunk size (1-5 words).
- **Anchor Calculator**: Alignment math that splits word chunks into `left`, `anchor`, and `right` elements for flawless fixed-point CSS rendering.
- **State Management**: Saved settings and reading history/position in `localStorage`.
- **Keyboard Listener**: Space to toggle play, arrows to scrub/change speed, etc.

#### [NEW] [manifest.json](file:///c:/Users/Nathan/OneDrive/Documents/Code Projects/SpeedReader/manifest.json)
Provides desktop and mobile browsers with the configuration needed to install the app locally.

#### [NEW] [sw.js](file:///c:/Users/Nathan/OneDrive/Documents/Code Projects/SpeedReader/sw.js)
Registers a service worker to cache core files and loaded CDN assets, ensuring 100% offline support.

---

## Technical Details

### Client-side ODT & EPUB Parsing
Using JSZip via CDN:
1. **ODT File**: Open archive, extract `content.xml`. Load into browser `DOMParser`. Read all `<text:p>` elements and join their text content.
2. **EPUB File**: Open archive, find the `.opf` file to discover reading order, or iterate and extract text from all `.html`, `.xhtml`, or `.xml` content files, stripping HTML tags and stitching together the full book text in order.

### Keyboard Controls
- **Space**: Play/Pause.
- **Left Arrow**: Rewind 5 seconds / 10 words.
- **Right Arrow**: Fast forward 5 seconds / 10 words.
- **Up Arrow**: Increase speed by 25 WPM.
- **Down Arrow**: Decrease speed by 25 WPM.
- **Esc**: Toggle settings panel.
- **R**: Reset to beginning.

---

## Verification Plan

### Automated/Code Verification
- Verify text extraction parsing for `.docx`, `.pdf`, `.txt`, `.md`, `.odt`, `.epub`, and `.rtf` files.
- Test chunk grouping and ORP anchor calculations with edge cases (empty strings, single characters, long words, multiple spaces, emojis).

### Manual Verification
- Drag and drop various formats.
- Validate speed range (100 WPM to 1200 WPM) and check stability of visual rendering (no layout shifting, anchor stays perfectly centered).
- Test hotkeys (Space to pause, Arrows to scrub, Esc to close settings).
- Toggle light, dark, sepia, and cyberpunk themes to ensure high legibility.
