// app.js - Core Application Logic

const STORAGE_KEY = 'speedreader_settings';
const READING_KEY = 'speedreader_reading';

function loadSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) { console.warn('Failed to load settings:', e); }
    return null;
}

function saveSettings() {
    try {
        const settings = {
            theme: state.theme,
            chunkSize: state.chunkSize,
            chunksPerMinute: state.chunksPerMinute
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) { console.warn('Failed to save settings:', e); }
}

function loadReadingState() {
    try {
        const saved = localStorage.getItem(READING_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) { console.warn('Failed to load reading state:', e); }
    return null;
}

function saveReadingState() {
    try {
        if (state.readingText.length === 0) {
            localStorage.removeItem(READING_KEY);
            return;
        }
        const textId = state.readingText.join('___').substring(0, 500);
        const readingState = {
            textId,
            wordChunkIndex: state.wordChunkIndex,
            timestamp: Date.now()
        };
        localStorage.setItem(READING_KEY, JSON.stringify(readingState));
    } catch (e) { console.warn('Failed to save reading state:', e); }
}

function clearReadingState() {
    try { localStorage.removeItem(READING_KEY); } catch (e) { /* ignore */ }
}

function applyTheme(themeName) {
    state.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = themeName;
    saveSettings();
}

const defaults = {
    chunkSize: 1,
    chunksPerMinute: 120,
    theme: 'oled-dark'
};

const state = {
    currentView: 'dashboard',
    readingText: [],
    wordChunkIndex: 0,
    isReading: false,
    hasStarted: false,
    chunkSize: defaults.chunkSize,
    chunksPerMinute: defaults.chunksPerMinute,
    theme: defaults.theme
};

// --- UI Handlers ---
function switchView(viewName) {
    state.currentView = viewName;
    const dashboard = document.getElementById('dashboard-view');
    const reader = document.getElementById('reader-view');
    
    if (viewName === 'reader') {
        dashboard.classList.add('hidden');
        reader.classList.remove('hidden');
    } else {
        dashboard.classList.remove('hidden');
        reader.classList.add('hidden');
    }
}

function handleFileDrop(file) {
    showNotification('Loading document...', 'info');
    parseDocument(file).then(words => {
        if (words.length === 0) {
            showNotification('Failed to parse document.', 'error');
            console.error("Parsing failed or returned empty text.");
            return;
        }
        state.readingText = words;
        const textId = words.join('___').substring(0, 500);
        const savedReading = loadReadingState();
        let startIdx = 0;
        let wasResumed = false;
        if (savedReading && savedReading.textId === textId) {
            startIdx = savedReading.wordChunkIndex || 0;
            if (startIdx > 0 && startIdx < words.length) {
                state.wordChunkIndex = startIdx;
                state.hasStarted = true;
                wasResumed = true;
                showNotification(`Resumed from word ${startIdx}`, 'info');
            }
        }
        state.wordChunkIndex = startIdx;
        state.hasStarted = state.hasStarted || wasResumed;
        state.isReading = false;
        switchView('reader');
        updateProgress();
        console.log(`Document loaded successfully. Total words: ${words.length}`);
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("SpeedReader App Initializing...");

    // Load saved settings
    const savedSettings = loadSettings();
    if (savedSettings) {
        if (savedSettings.theme) { state.theme = savedSettings.theme; applyTheme(savedSettings.theme); }
        if (savedSettings.chunkSize) { state.chunkSize = savedSettings.chunkSize; const cs = document.getElementById('chunkSizeSelect'); if (cs) cs.value = state.chunkSize; }
        if (savedSettings.chunksPerMinute) { state.chunksPerMinute = savedSettings.chunksPerMinute; const sr = document.getElementById('speedRange'); const sd = document.getElementById('speed-display'); if (sr) sr.value = state.chunksPerMinute; if (sd) sd.textContent = state.chunksPerMinute; }
    }
    applyTheme(state.theme);
    updateEffectiveWPM();

    // Drag and Drop
    const dropzone = document.getElementById('upload-zone');
    if (dropzone) {
        // Prevent browser from opening dropped files
        window.addEventListener('dragover', (e) => e.preventDefault(), { passive: false });
        window.addEventListener('drop', (e) => e.preventDefault(), { passive: false });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('drag-over');
        });
        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('drag-over');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) handleFileDrop(file);
        });
    }

    // Browse Button
    const fileInput = document.getElementById('fileInput');
    const browseButton = document.getElementById('browseButton');
    if (browseButton && fileInput) {
        browseButton.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFileDrop(file);
        });
    }

    // Paste Functionality (Clipboard API)
    const pasteButton = document.getElementById('pasteButton');
    if (pasteButton) {
        pasteButton.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    state.readingText = text.split(/\s+/).filter(w => w.length > 0);
                    state.wordChunkIndex = 0;
                    switchView('reader');
                    console.log("Text pasted from clipboard successfully.");
                } else {
                    alert("Clipboard is empty.");
                }
            } catch (err) {
                alert("Failed to read clipboard. Please ensure you have given permission.");
                console.error(`Error: ${err.message}`);
            }
        });
    }

    // Manual Text Area Functionality
    const manualSubmitButton = document.getElementById('manualSubmitButton');
    const manualPasteArea = document.getElementById('manualPasteArea');
    if (manualSubmitButton && manualPasteArea) {
        manualSubmitButton.addEventListener('click', () => {
            const text = manualPasteArea.value.trim();
            if (text) {
                state.readingText = text.split(/\s+/).filter(w => w.length > 0);
                state.wordChunkIndex = 0;
                switchView('reader');
                console.log("Manual text submitted successfully.");
            } else {
                alert("Please enter some text first.");
            }
        });
    }

    // Play/Pause Button
    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
        playPauseButton.addEventListener('click', () => {
            if (state.isReading) {
                stopReading();
                playPauseButton.textContent = state.hasStarted ? 'Resume' : 'Play';
            } else {
                startReading();
                playPauseButton.textContent = 'Pause';
            }
        });
    }

    // Restart Button
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (state.isReading) stopReading();
            state.wordChunkIndex = 0;
            if (playPauseButton) playPauseButton.textContent = 'Play';
        });
    }

    // Chunk Size Selector
    const chunkSizeSelect = document.getElementById('chunkSizeSelect');
    if (chunkSizeSelect) {
        chunkSizeSelect.addEventListener('change', (e) => {
            state.chunkSize = parseInt(e.target.value);
            updateEffectiveWPM();
            saveSettings();
        });
    }

    // Speed Slider (chunks/min)
    const speedRange = document.getElementById('speedRange');
    const speedDisplay = document.getElementById('speed-display');
    if (speedRange && speedDisplay) {
        speedRange.addEventListener('input', (e) => {
            const newSpeed = parseInt(e.target.value);
            state.chunksPerMinute = newSpeed;
            speedDisplay.textContent = newSpeed;
            updateEffectiveWPM();
            saveSettings();
        });
    }

    // Theme Selector
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
            updateEffectiveWPM();
        });
    }

    // Reset Progress Button
    const resetProgressBtn = document.getElementById('resetProgressBtn');
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener('click', () => {
            clearReadingState();
            state.wordChunkIndex = 0;
            updateProgress();
            showNotification('Reading position reset', 'info');
        });
    }

    // Settings Toggle
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsSidebar = document.getElementById('settings-sidebar');
    if (settingsToggle && settingsSidebar) {
        settingsToggle.addEventListener('click', () => {
            const isVisible = !settingsSidebar.classList.contains('hidden');
            settingsSidebar.classList.toggle('hidden', isVisible);
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
        switch (e.code) {
            case 'Space':
                if (state.isReading) {
                    stopReading();
                    if (playPauseButton) playPauseButton.textContent = 'Resume';
                } else {
                    startReading();
                    if (playPauseButton) playPauseButton.textContent = 'Pause';
                }
                break;
            case 'Escape':
                if (state.isReading) stopReading();
                switchView('dashboard');
                if (playPauseButton) playPauseButton.textContent = 'Play';
                break;
            case 'KeyR':
                state.wordChunkIndex = 0;
                if (state.isReading) startReading();
                else if (playPauseButton) playPauseButton.textContent = 'Play';
                break;
        }
    });
});

// --- Parsing Engine ---
async function parseDocument(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    let text = '';

    try {
        if (extension === 'txt' || extension === 'md' || extension === 'rtf') {
            text = await file.text();
        } else if (extension === 'pdf') {
            const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                text += textContent.items.map(item => item.str).join(' ') + '\n';
            }
        } else if (extension === 'docx') {
            const result = await mammoth.convertToText({ arrayBuffer: await file.arrayBuffer() });
            text = result.value;
        } else if (extension === 'odt' || extension === 'epub') {
            const zip = await JSZip.loadAsync(await file.arrayBuffer());
            let content = '';
            if (extension === 'odt') {
                const xml = await zip.file('content.xml').async("string");
                const parser = new DOMParser();
                const doc = parser.parseFromString(xml, "text/xml");
                const paragraphs = doc.querySelectorAll('text:p');
                paragraphs.forEach(p => {
                    content += p.textContent + ' ';
                });
                text = content;
            } else if (extension === 'epub') {
                const files = zip.file(/.+\.(xhtml|html|xml)$/i);
                for (const file of files) {
                    const xml = await file.async("string");
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(xml, "text/xml");
                    const textNode = doc.querySelector('body') || doc;
                    text += textNode.textContent + ' ';
                }
                text = content;
            }
        } else {
            throw new Error('Unsupported file type.');
        }

        const cleanedText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        return cleanedText.split(/\s+/).filter(w => w.length > 0);

    } catch (error) {
        console.error("Error parsing document:", error);
        alert("Failed to parse document. Check console for details.");
        return [];
    }
}

// --- RSVP Core Engine ---
function startReading() {
    if (state.readingText.length === 0) {
        console.warn("No text loaded to read.");
        return;
    }
    if (state.isReading) {
        stopReading();
        return;
    }

    state.isReading = true;
    if (!state.hasStarted) {
        state.wordChunkIndex = 0;
        state.hasStarted = true;
    }
    
    switchView('reader');
    console.log("Starting RSVP reading...");
    runLoop();
}

// Save state before page unload
window.addEventListener('beforeunload', () => {
    saveReadingState();
    saveSettings();
});

function stopReading() {
    state.isReading = false;
    console.log("Reading stopped.");
    updateProgress();
    saveReadingState();
}

async function runLoop() {
    if (!state.isReading || state.wordChunkIndex >= state.readingText.length) {
        state.isReading = false;
        console.log("Reading finished.");
        updateProgress();
        saveReadingState();
        return;
    }

    const chunk = state.readingText.slice(state.wordChunkIndex, state.wordChunkIndex + state.chunkSize);
    const fullText = chunk.join(' ');
    
    const canvas = document.getElementById('reading-canvas');
    if (canvas) {
        const lastWord = chunk[chunk.length - 1];
        const lastWordMid = Math.floor(lastWord.length / 2);
        const anchor = lastWord[lastWordMid];
        const lastWordLeft = lastWord.substring(0, lastWordMid);
        const lastWordRight = lastWord.substring(lastWordMid + 1);
        const prefix = chunk.length > 1 ? chunk.slice(0, chunk.length - 1).join(' ') + ' ' : '';
        const left = prefix + lastWordLeft;
        const right = lastWordRight;

        const chunkClass = `rsvp-word--chunk-${chunk.length}`;
        canvas.innerHTML = `
            <div class="rsvp-display">
                <div class="rsvp-word ${chunkClass}">
                    <span class="rsvp-word__left">${left}</span><span class="rsvp-word__anchor">${anchor}</span><span class="rsvp-word__right">${right}</span>
                </div>
            </div>
        `;
    }

    state.wordChunkIndex += chunk.length;
    updateProgress();
    const lastWord = chunk[chunk.length - 1];
    const delay = calculateDelay(lastWord, chunk.length);

    setTimeout(runLoop, delay);
}

// --- Utility Functions ---
function calculateDelay(word, chunkSize = 1) {
    const baseDelay = 60000 / state.chunksPerMinute;
    let multiplier = 1.0;

    if (/[.!?]/.test(word)) {
        multiplier = 2.5;
    } else if (/[,;]/.test(word)) {
        multiplier = 1.5;
    }

    if (word.length > 7) {
        multiplier += 0.5;
    }

    return baseDelay * multiplier;
}

function updateEffectiveWPM() {
    const display = document.getElementById('effective-wpm');
    if (display) {
        const wpm = state.chunksPerMinute * state.chunkSize;
        display.textContent = wpm;
        display.classList.toggle('wpm-warning', wpm > 600);
    }
}

function updateProgress() {
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    if (progressText) {
        progressText.textContent = `${state.wordChunkIndex} / ${state.readingText.length}`;
    }
    if (progressBar && state.readingText.length > 0) {
        const pct = (state.wordChunkIndex / state.readingText.length) * 100;
        progressBar.style.width = `${pct}%`;
    }
}

// --- Toast Notification ---
function showNotification(message, type = 'info') {
    const existing = document.getElementById('toast-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:2rem;right:2rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;';

    const toast = document.createElement('div');
    const colors = {
        success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.5)', text: 'var(--text-primary)' },
        error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.5)', text: 'var(--text-primary)' },
        info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.5)', text: 'var(--text-primary)' }
    };
    const c = colors[type] || colors.info;
    toast.style.cssText = `background:${c.bg};border:1px solid ${c.border};border-radius:var(--radius-md);padding:0.75rem 1.25rem;color:${c.text};font-size:0.875rem;font-family:inherit;backdrop-filter:blur(12px);box-shadow:0 4px 20px rgba(0,0,0,0.3);animation:toast-in 0.3s ease;`;
    toast.textContent = message;
    container.appendChild(toast);
    document.body.appendChild(container);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.opacity = '0';
        setTimeout(() => container.remove(), 300);
    }, 2500);
}

// Export for debugging
window.SpeedReaderApp = {
    startReading,
    handleFileDrop,
};
