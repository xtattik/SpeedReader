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
    
// Add event listeners to setup the UI
document.addEventListener('DOMContentLoaded', () => {
    console.log("SpeedReader App Initializing...");
    
    // Drag and Drop
    const dropzone = document.getElementById('upload-zone');
    if (dropzone) {
        // Prevent default browser behavior for the whole window to avoid file opening
        window.addEventListener('dragover', (e) => e.preventDefault(), { passive: false });
        window.addEventListener('drop', (and e) => e.preventDefault(), { passive: false });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
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

    // Paste Functionality (Clipboard API)
    const pasteButton = document.getElementById('pasteButton');
    if (paste/pasteButton) {
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
                playPauseButton.textContent = 'Play';
            } else {
                startReading();
                playPauseButton.textContent = 'Pause';
            }
        });
    }

    // Speed Slider
    const speedRange = document.getElementById('speedRange');
    const speedDisplay = document.getElementById('speed-display');
    if (speedRange && speedDisplay) {
        speedRange.addEventListener('input', (e) => {
            const newSpeed = parseInt(e.target.value);
            state.speedWPM = newSpeed;
            speedDisplay.textContent = newSpeed;
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Prevent scrolling when pressing Space
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }

        switch (e.code) {
            case 'Space':
                if (state.isReading) {
                    stopReading();
                    if (playPauseButton) playPauseButton.textContent = 'Play';
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
                break;
        }
    });
});
        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
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
                console.error(formatError(err));
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
                playPauseButton.textContent = 'Play';
            } else {
                startReading();
                playPauseButton.textContent = 'Pause';
            }
        });
    }

    // Speed Slider
    const speedRange = document.getElementById('speedRange');
    const speedDisplay = document.getElementById('speed-display');
    if (speedRange && speedDisplay) {
        speedRange.addEventListener('input', (e) => {
            const newSpeed = parseInt(e.target.value);
            state.speedWPM = newSpeed;
            speedDisplay.textContent = new                newSpeed;
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Prevent scrolling when pressing Space
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }

        switch (e.code) {
            case 'Space':
                if (state.isReading) {
                    stopReading();
                    if (playPauseButton) playPauseButton.textContent = 'Play';
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
                break;
        }
    });
});

// Helper for error logging
function formatError(err) {
    return `Error: ${err.message}`;
}

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
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

    // Paste Functionality
    const pasteButton = document.getElementById('pasteButton');
    if (pasteButton) {
        pasteButton.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    state.readingText = text.split(/\s+/).filter(w => w.length > 0);
                    state.wordChunkIndex = 0;
                    switchView('reader');
                    console.log("Text pasted successfully.");
                } else {
                    alert("Clipboard is empty.");
                }
            } catch (err) {
                alert("Failed to read clipboard. Please ensure you have given permission.");
                console.error(err);
            }
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

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Prevent scrolling when pressing Space
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }

        switch (e.code) {
            case 'Space':
                if (state.isReading) {
                    stopReading();
                    if (playPauseButton) playPauseButton.textContent = 'Play';
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
            case 'ArrowRight':
                // Forward skip logic (if implemented)
                break;
            case 'ArrowLeft':
                // Backward skip logic (if implemented)
                break;
            case 'KeyR':
                // Reset reading
                state.wordChunkIndex = 0;
                if (state.isReading) startReading();
                break;
        }
    });
});
        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) handleFileDrop(file);
        });
    }

    // Paste Functionality
    const pasteButton = document.getElementById('pasteButton');
    if (pasteButton) {
        pasteButton.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    state.readingText = text.split(/\s+/).filter(w => w.length > 0);
                    state.wordChunkIndex = 0;
                    switchView('reader');
                    console.log("Text pasted successfully.");
                } else {
                    alert("Clipboard is empty.");
                }
            } catch (err) {
                alert("Failed to read clipboard. Please ensure you have given permission.");
                console.error(err);
            }
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

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Prevent scrolling when pressing Space
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }

        switch (e.code) {
            case 'Space':
                if (state.isReading) {
                    stopReading();
                    if (playPauseButton) playPauseButton.textContent = 'Play';
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
            case 'ArrowRight':
                // Forward skip logic (if implemented)
                break;
            case 'ArrowLeft':
                // Backward skip logic (if implemented)
                break;
            case 'KeyR':
                // Reset reading
                state.wordChunkIndex = 0;
                if (state.isReading) startReading();
                break;
        }
    });
});
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