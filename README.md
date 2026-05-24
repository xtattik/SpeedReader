# Speed Reader

A fast, portable RSVP (Rapid Serial Visual Presentation) speed-reading tool that runs entirely in your browser with no installation required.

Words flash at a fixed focal point — the **red anchor letter** — so your eyes never have to scan across the page. Only your brain processes the text.

## Getting Started

1. Open `index.html` in any modern browser (or serve it locally).
2. Drop a file onto the upload zone, click **Browse Files**, or paste text directly.
3. Press **Play** (or `Space`) to begin reading.
4. Adjust speed and words-per-group using the controls at the bottom.

## Features

- **RSVP engine** with a fixed anchor point that never drifts
- **Dynamic pacing** — longer words and punctuation get extra time automatically
- **Multi-word chunks** — display 1–5 words at once for faster reading
- **4 themes** — OLED Dark, Cyberpunk Neon, Sepia Warm, Alpine Light
- **Session persistence** — speed, chunk size, and theme are remembered between sessions
- **PWA support** — installable on desktop and mobile, works fully offline

## Supported File Formats

| Format | Notes |
|--------|-------|
| `.txt`, `.md` | Plain text and Markdown |
| `.pdf` | Parsed via PDF.js |
| `.docx` | Parsed via Mammoth.js |
| `.odt` | OpenDocument Text via JSZip |
| `.epub` | E-books via JSZip |
| `.rtf` | Rich Text Format |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `R` | Restart from beginning |
| `Esc` | Return to library / dashboard |

## How the Anchor Works

Each word chunk is split into three parts:
- **Left** — text to the left of the anchor, right-aligned
- **Anchor** — a single highlighted letter at the optical recognition point
- **Right** — text to the right, left-aligned

Both halves use equal-width columns (`1fr auto 1fr` CSS grid), so the anchor character sits at exactly the **horizontal center** of the display on every single word — your eyes never need to move.

## Local Development

No build step needed. Just open `index.html`:

```bash
# Option 1: direct file
open index.html

# Option 2: simple local server (Python)
python -m http.server 8080
# then open http://localhost:8080
```

## Project Structure

```
SpeedReader/
├── index.html      — Layout and UI
├── styles.css      — Themes, glassmorphism, RSVP display
├── app.js          — RSVP engine, file parsers, state management
├── manifest.json   — PWA configuration
├── sw.js           — Service Worker for offline caching
└── README.md       — This file
```
