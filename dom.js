// dom.js - "Hybrid Speed" Edition
let isLockedInFocus = false; 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ADAPT_UI") applyAdaptiveUI(request.level, request.score);
    if (request.type === "MANUAL_TRIGGER_FOCUS") enterBulletMode();
    if (request.type === "MANUAL_EXIT_FOCUS") closeBulletMode();
    if (request.type === "SHOW_SUMMARY") renderSummary(request.summary);
});

function applyAdaptiveUI(level, score) {
    if (isLockedInFocus) return; 

    console.log(`[DOM] AI Suggests Level: ${level}`);

    if (level === 'FOCUS') {
        document.body.classList.add('focus-aura-pulse');
        document.documentElement.style.setProperty('--aura-intensity', Math.min(1, score / 100));
    } else if (level === 'DEEP_WORK') {
        enterBulletMode();
    } else {
        clearVisualEffects(); 
    }
}

function enterBulletMode() {
    if (isLockedInFocus) return;
    isLockedInFocus = true;
    document.body.classList.add('deep-work-active');
    
    // 1. Create UI
    let overlay = document.getElementById('bullet-mode-overlay');
    if (!overlay) createOverlayUI();
    
    // 2. SMART SCRAPING (The Diet)
    // Only grab paragraphs and headers. Ignore menus, comments, footers.
    // This reduces payload size by ~60%, making the AI much faster.
    const mainContent = findMainContent() || document.body;
    const meaningfulElements = mainContent.querySelectorAll('h1, h2, h3, p, li');
    
    let cleanTextPayload = "";
    let localDraftHTML = "";

    meaningfulElements.forEach(el => {
        const text = el.innerText.trim();
        // Ignore short garbage (e.g., "Share", "Posted by")
        if (text.length > 50) {
            cleanTextPayload += text + "\n\n";
            
            // 3. INSTANT RENDER (The Speed Trick)
            // We build a rough list NOW so the user sees text immediately.
            // We use a distinct style so they know it's a "Draft".
            localDraftHTML += `<li class="draft-item" style="opacity: 0.7;">${text.substring(0, 150)}...</li>`;
        }
    });

    // Show the "Rough Draft" immediately
    const list = document.getElementById('bullet-list');
    const header = document.getElementById('bullet-mode-header');
    if (list) {
        list.innerHTML = localDraftHTML;
        header.innerText = "⚡ Quick View (AI Refining...)";
    }

    // 4. Send Clean Text to AI
    // Limit to 5000 chars to prevent timeouts on huge pages
    chrome.runtime.sendMessage({
        type: "SUMMARIZE_TEXT",
        text: cleanTextPayload.substring(0, 5000) 
    });
}

function renderSummary(summaryText) {
    const header = document.getElementById('bullet-mode-header');
    const spinner = document.getElementById('bullet-loading-spinner');
    const list = document.getElementById('bullet-list');
    
    if (header && list) {
        header.innerText = "✨ Smart Summary";
        if (spinner) spinner.style.display = "none";
        
        const htmlPoints = summaryText
            .split('\n')
            .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
            .map(line => `<li>${line.replace(/^[*-]\s*/, '')}</li>`)
            .join('');
        
        // Smoothly swap the Draft for the AI content
        list.style.opacity = 0;
        setTimeout(() => {
            list.innerHTML = htmlPoints;
            list.style.opacity = 1;
        }, 200);
    }
}

function closeBulletMode() {
    isLockedInFocus = false;
    document.body.classList.remove('deep-work-active');
    clearVisualEffects();
}

function createOverlayUI() {
    let overlay = document.createElement('div');
    overlay.id = 'bullet-mode-overlay';
    overlay.innerHTML = `
        <div id="bullet-mode-content">
            <div id="bullet-mode-header">🧠 AI is focusing...</div>
            <div id="bullet-loading-spinner" style="font-size:12px; color:#999; margin-bottom:10px;">Reading content...</div>
            <ul id="bullet-list" style="transition: opacity 0.3s ease;"></ul>
            <button id="exit-focus-btn">Exit Focus Mode</button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('exit-focus-btn').onclick = closeBulletMode;
}

function clearVisualEffects() {
    document.body.classList.remove('focus-aura-pulse');
}

function findMainContent() {
    const candidates = ["article", "main", "#content", "#bodyContent", ".post-content"];
    for (let i = 0; i < candidates.length; i++) {
        const el = document.querySelector(candidates[i]);
        if (el && el.innerText.length > 500) return el;
    }
    return document.body;
}