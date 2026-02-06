// dom.js - Merged Focus State (Spotlight + Sidebar Killer)
let isLockedInMode = false; 

initializeFloatingButton();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ADAPT_UI") applyAdaptiveUI(request.level, request.score);
    if (request.type === "SHOW_SUMMARY") renderSummary(request.summary);
});

function applyAdaptiveUI(level, score) {
    console.log(`🎯 Score: ${score.toFixed(1)} | Level: ${level}`);

    if (isLockedInMode) return; 

    // --- LEVEL 2: ZEN MODE (Auto-Trigger at Score 80+) ---
    if (level === 'ZEN') {
        console.log("⚠️ Distraction Critical! Auto-triggering Zen Shield.");
        document.body.classList.add('focus-mode-active'); 
        activateZenMode(); 
    } 
    // --- LEVEL 1: FOCUS MODE (Merged Features) ---
    else if (level === 'FOCUS') {
        // 1. Sidebar Killer
        document.body.classList.add('focus-mode-active');
        
        // 2. Reading Spotlight (Dim Text) - Formerly Deep Work feature
        document.body.classList.add('deep-work-active'); 

        // 3. Strong Aura
        document.body.classList.add('focus-aura-pulse');
        document.documentElement.style.setProperty('--aura-intensity', '0.8');

        // 4. Safe Grayscale Overlay
        setFilterLayer(true, 'grayscale(60%)');
    } 
    // --- LEVEL 0: NORMAL ---
    else {
        clearVisualEffects(); 
    }
}

function initializeFloatingButton() {
    if (document.getElementById('intuition-floating-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'intuition-floating-btn';
    btn.className = 'intuition-floating-btn';
    btn.innerText = '\u2728 AI summary'; 
    btn.onclick = () => {
        console.log("👆 User Clicked AI Summary");
        activateDeepFocus();
    };
    document.body.appendChild(btn);
}

function activateDeepFocus() {
    if (isLockedInMode) return;
    isLockedInMode = true;

    // Apply ALL Focus Effects
    document.body.classList.add('focus-mode-active'); 
    document.body.classList.add('deep-work-active');  
    document.body.classList.add('focus-aura-pulse');  
    document.documentElement.style.setProperty('--aura-intensity', '1');
    
    // Lock Scroll & HTML
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll'); 

    createSummaryOverlay();
    triggerAI();
}

function activateZenMode() {
    if (isLockedInMode) return;
    isLockedInMode = true;

    document.body.classList.add('focus-mode-active'); 
    
    // Lock Scroll
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');

    let shield = document.getElementById('zen-shield-overlay');
    if (!shield) {
        shield = document.createElement('div');
        shield.id = 'zen-shield-overlay';
        shield.innerHTML = `
            <h1>ZEN MODE ACTIVATED</h1>
            <p>Cognitive load limit reached.</p>
            <p style="font-size: 14px; opacity: 0.8; margin-bottom: 30px;">Take a deep breath. The screen will remain dark until you resume.</p>
            <button id="zen-resume-btn">Resume Browsing</button>
        `;
        document.body.appendChild(shield);
        
        document.getElementById('zen-resume-btn').onclick = () => {
            shield.remove();
            exitModes(); 
        };
    }
}

// Helper for Safe Grayscale
function setFilterLayer(active, filterValue) {
    let layer = document.getElementById('focus-filter-layer');
    if (active) {
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'focus-filter-layer';
            document.body.appendChild(layer);
        }
        layer.style.backdropFilter = filterValue;
    } else {
        if (layer) layer.remove();
    }
}

function exitModes() {
    isLockedInMode = false;
    
    // Remove ALL Styles
    document.body.classList.remove('focus-mode-active'); 
    document.body.classList.remove('deep-work-active'); 
    document.body.classList.remove('focus-aura-pulse');
    
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');

    setFilterLayer(false);
    
    const overlay = document.getElementById('bullet-mode-overlay');
    if (overlay) overlay.remove();
    
    const shield = document.getElementById('zen-shield-overlay');
    if (shield) shield.remove();
    
    console.log("🟢 Mode Reset: NORMAL");
}

function clearVisualEffects() {
    if (!isLockedInMode) {
        document.body.classList.remove('focus-aura-pulse');
        document.body.classList.remove('focus-mode-active');
        document.body.classList.remove('deep-work-active'); 
        document.body.classList.remove('no-scroll');
        document.documentElement.classList.remove('no-scroll');
        setFilterLayer(false);
    }
}

function createSummaryOverlay() {
    let overlay = document.createElement('div');
    overlay.id = 'bullet-mode-overlay';
    overlay.innerHTML = `
        <div id="bullet-mode-content">
            <div id="bullet-mode-header">🧠 AI is analyzing...</div>
            <div id="bullet-loading-spinner" style="font-size:12px; color:#999; margin-bottom:10px;">Generating study notes...</div>
            <div id="bullet-list" style="text-align: left;"></div>
            <button id="exit-focus-btn" style="margin-top: 20px; padding: 10px 20px;">Exit Focus Mode</button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('exit-focus-btn').onclick = exitModes;
}

function triggerAI() {
    const mainContent = findMainContent() || document.body;
    const clone = mainContent.cloneNode(true);
    
    const junkSelectors = ['script', 'style', 'svg', 'iframe', 'nav', 'footer', '.ads', '.ad', '.advertisement', '[role="complementary"]'];
    clone.querySelectorAll(junkSelectors.join(',')).forEach(n => n.remove());

    let richTextPayload = "";
    const meaningfulElements = clone.querySelectorAll('p, h1, h2, h3, li, blockquote');
    
    meaningfulElements.forEach(el => {
        const text = el.innerText.trim();
        if (text.length > 30) richTextPayload += el.outerHTML + "\n";
    });

    if (richTextPayload.length < 500) richTextPayload = clone.innerHTML; 
    const finalPayload = richTextPayload.substring(0, 15000);
    chrome.runtime.sendMessage({ type: "SUMMARIZE_TEXT", text: finalPayload });
}

function renderSummary(summaryText) {
    const header = document.getElementById('bullet-mode-header');
    const spinner = document.getElementById('bullet-loading-spinner');
    const container = document.getElementById('bullet-list'); 
    
    if (header && container) {
        header.innerText = "✨ Smart Notes"; 
        if (spinner) spinner.style.display = "none";
        container.innerHTML = formatFirstWords(summaryText);
    }
}

function findMainContent() {
    const candidates = ["article", "main", "#content", "#bodyContent", ".post-content", ".mw-parser-output"];
    for (let i = 0; i < candidates.length; i++) {
        const el = document.querySelector(candidates[i]);
        if (el && el.innerText.length > 500) return el;
    }
    return document.body;
}

function formatFirstWords(htmlContent) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const elements = tempDiv.querySelectorAll('p, li');
    elements.forEach(el => {
        const text = el.innerHTML;
        el.innerHTML = text.replace(/^\s*([a-zA-Z0-9'’]+)/, '<strong style="color:#2c3e50; font-weight:800;">$1</strong>');
    });
    return tempDiv.innerHTML;
}