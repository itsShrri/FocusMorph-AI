// dom.js - Inline Button Edition (CORRECTED)
let isLockedInFocus = false; 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ADAPT_UI") applyAdaptiveUI(request.level, request.score);
    if (request.type === "MANUAL_TRIGGER_FOCUS") enterBulletMode();
    if (request.type === "MANUAL_EXIT_FOCUS") closeBulletMode();
    if (request.type === "SHOW_SUMMARY") renderSummary(request.summary);
});

function applyAdaptiveUI(level, score) {
    if (isLockedInFocus) return; 
    if (level === 'FOCUS') {
        document.body.classList.add('focus-aura-pulse');
        document.documentElement.style.setProperty('--aura-intensity', Math.min(1, score / 100));
    } else if (level === 'DEEP_WORK') {
        enterBulletMode(); 
    } else {
        clearVisualEffects(); 
    }
}

// 1. INJECT THE BUTTON (This was missing in your file!)
function enterBulletMode() {
    if (document.getElementById('intuition-inline-btn')) return;

    const mainContent = findMainContent();
    const targetHeader = mainContent.querySelector('h1') || mainContent.querySelector('h2') || mainContent;

    const btn = document.createElement('button');
    btn.id = 'intuition-inline-btn';
    btn.className = 'intuition-start-btn';
    // Use Unicode to prevent weird text issues
    btn.innerText = '\u2728 Enter Deep Mode & Summarize'; 
    btn.onclick = activateDeepMode;

    if (targetHeader.nextSibling) {
        targetHeader.parentNode.insertBefore(btn, targetHeader.nextSibling);
    } else {
        targetHeader.appendChild(btn);
    }
    
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 2. ACTIVATE REAL FOCUS
function activateDeepMode() {
    if (isLockedInFocus) return;
    isLockedInFocus = true;

    document.body.classList.add('deep-work-active');
    document.body.classList.add('focus-aura-pulse');
    document.documentElement.style.setProperty('--aura-intensity', '1');

    createOverlayUI();
    
    const btn = document.getElementById('intuition-inline-btn');
    if (btn) btn.remove();

    triggerAI();
}

function createOverlayUI() {
    let overlay = document.createElement('div');
    overlay.id = 'bullet-mode-overlay';
    overlay.innerHTML = `
        <div id="bullet-mode-content">
            <div id="bullet-mode-header">🧠 AI is analyzing...</div>
            <div id="bullet-loading-spinner" style="font-size:12px; color:#999; margin-bottom:10px;">Reading content & generating notes...</div>
            <div id="bullet-list" style="transition: opacity 0.3s ease; line-height: 1.6; text-align: left;"></div>
            <button id="exit-focus-btn" style="margin-top: 30px; background: #eee; border:none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Exit Focus Mode</button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('exit-focus-btn').onclick = closeBulletMode;
}

function triggerAI() {
    const mainContent = findMainContent() || document.body;
    const clone = mainContent.cloneNode(true);
    clone.querySelectorAll('script, style, svg, nav, footer, iframe').forEach(n => n.remove());

    const meaningfulElements = clone.querySelectorAll('h1, h2, h3, p, li');
    let cleanTextPayload = "";
    
    meaningfulElements.forEach(el => {
        const text = el.innerText.trim();
        if (text.length > 50) cleanTextPayload += el.innerHTML + "\n\n";
    });

    if (cleanTextPayload.length < 100) cleanTextPayload = document.body.innerText.substring(0, 5000);

    chrome.runtime.sendMessage({
        type: "SUMMARIZE_TEXT",
        text: cleanTextPayload.substring(0, 12000) 
    });
}

function renderSummary(summaryText) {
    const header = document.getElementById('bullet-mode-header');
    const spinner = document.getElementById('bullet-loading-spinner');
    const container = document.getElementById('bullet-list'); 
    
    if (header && container) {
        header.innerText = "✨ Smart Notes"; 
        if (spinner) spinner.style.display = "none";
        container.style.opacity = 0;
        setTimeout(() => {
            container.innerHTML = summaryText;
            container.style.opacity = 1;
        }, 200);
    }
}

function closeBulletMode() {
    isLockedInFocus = false;
    document.body.classList.remove('deep-work-active');
    document.body.classList.remove('focus-aura-pulse');
    const overlay = document.getElementById('bullet-mode-overlay');
    if (overlay) overlay.remove();
}

function clearVisualEffects() {
    document.body.classList.remove('focus-aura-pulse');
}

function findMainContent() {
    const candidates = ["article", "main", "#content", "#bodyContent", ".post-content", ".mw-parser-output"];
    for (let i = 0; i < candidates.length; i++) {
        const el = document.querySelector(candidates[i]);
        if (el && el.innerText.length > 500) return el;
    }
    return document.body;
}