// app.js - Core Application Logic

/**
 * Global State Management
 * @type {object}
 */
const state = {
    currentView: 'dashboard',
    readingText: [],
    wordChunkIndex: 0,
    isReading: false,
    speedWPM: 300,
    theme: 'oled-dark'
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("SpeedReader App Initializing...");
    // Load state from localStorage
    // Setup event listeners for UI elements
    // Initialize theme based on state.theme
});

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
    // 1. Parse the document using the engine
    parseDocument(file).then(words => {
        if (words.length === 0) {
            console.error("Parsing failed or returned empty text.");
            return;
        }
        
        // 2. Store the parsed words
        state.readingText = words;
        state.wordChunkIndex = 0;
        
        // 3. Transition to reader view
        switchView('reader');
        console.log(`Document loaded successfully. Total words: ${words.length}`);
    });
}

// Add event listeners to setup the UI
document.addEventListener('DOMContentLoaded', () => {
    console.log("SpeedReader App Initializing...");
    
    // Drag and Drop
    const dropzone = document.getElementById('upload-zone');
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
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

    // Play/Pause Button
    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
        playPauseButton.addEventListener('click', () => {
            if (state.isReading) {
                stopReading();
                playPauseButton.textContent = 'Play';
            } else {
                startReading();
                playPauseButton.textContent = 'Pause';
            }
        });
    }
});
}

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
    state.wordChunkIndex = 0;
    
    document.getElementById('reader-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('html'); // Force show reader
    document.getElementById('dashboard-view').classList.add('hidden');
    
    console.log("Starting RSVP reading...");
    runLoop();
}

function stopReading() {
    state.isReading = false;
    console.log("Reading stopped.");
}

async function runLoop() {
    if (!state.isReading || state.wordChunkIndex >= state.readingText.length) {
        state.isReading = false;
        console.log("Reading finished.");
        return;
    }

    const chunkSize = 3;
    const chunk = state.readingText.slice(state.wordChunkIndex, state.wordChunkIndex + chunkSize);
    const fullText = chunk.join(' ');
    
    const canvas = document.getElementById('reading-canvas');
    if (canvas) {
        const mid = Math.floor(fullText.length / 2);
        const left = fullText.substring(0, mid);
        const anchor = fullText.substring(mid, mid + 1);
        const right = fullText.substring(mid + 1);

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
    const lastWord = chunk[chunk.length - 1];
    const delay = calculateDelay(lastWord);

    setTimeout(runLoop, delay);
}

// --- Utility Functions ---
function calculateDelay(word) {
    const baseDelay = 1000 / state.speedWPM;
    let multiplier = 1.0;

    // Punctuation-based delay scaling
    if (/[.!?]/.test(word)) {
        multiplier = 3.0;
    } else if (/[,;]/.test(word)) {
        multiplier = 1.5;
    }

    // Long word delay (words > 7 chars)
    if (word.length > 7) {
        multiplier += 0.5;
    }

    return baseDelay * multiplier;
}

// Export functions if needed for modularity
window.SpeedReaderApp = {
    startReading,
    handleFileDrop,
};