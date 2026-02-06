// dom.js - Zen Shield, Manual Focus & Sidebar Hiding
let isLockedInMode = false; 

// 1. Initialize the Manual Button immediately
initializeFloatingButton();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ADAPT_UI") applyAdaptiveUI(request.level, request.score);
    if (request.type === "SHOW_SUMMARY") renderSummary(request.summary);
});

function applyAdaptiveUI(level, score) {
    // F12 Console Log
    console.log(`🎯 Score: ${score.toFixed(1)} | Level: ${level}`);

    if (isLockedInMode) return; 

    // --- LEVEL 2: DEEP WORK (Auto-Zen) ---
    if (level === 'DEEP_WORK') {
        console.log("⚠️ Distraction High! Auto-triggering Zen Shield.");
        document.body.classList.add('focus-mode-active'); // Hides Sidebars
        activateZenMode(); 
    } 
    // --- LEVEL 1: FOCUS MODE (Hide Sidebars) ---
    else if (level === 'FOCUS') {
        console.log("⚠️ Entering Focus Mode: Hiding Sidebars.");
        
        // 1. Activate Aura
        document.body.classList.add('focus-aura-pulse');
        document.documentElement.style.setProperty('--aura-intensity', '0.6');
        
        // 2. Hide Sidebars (CRITICAL STEP)
        document.body.classList.add('focus-mode-active');
        
        // 3. Mild Grayscale
        document.body.style.filter = "grayscale(30%)";
    } 
    // --- LEVEL 0: NORMAL ---
    else {
        clearVisualEffects(); 
    }
}

// ----------------------------------------------------
// MODE 1: MANUAL DEEP FOCUS (The Floating Button)
// ----------------------------------------------------
function initializeFloatingButton() {
    if (document.getElementById('intuition-floating-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'intuition-floating-btn';
    btn.className = 'intuition-floating-btn';
    btn.innerText = '\u2728 Deep Focus'; 
    btn.onclick = () => {
        console.log("👆 User Clicked Deep Focus");
        activateDeepFocus();
    };

    document.body.appendChild(btn);
}

function activateDeepFocus() {
    if (isLockedInMode) return;
    isLockedInMode = true;

    // HIDE SIDEBARS & Activate Aura
    document.body.classList.add('focus-mode-active');
    document.body.classList.add('focus-aura-pulse');
    document.documentElement.style.setProperty('--aura-intensity', '1');
    
    createSummaryOverlay();
    triggerAI();
}

// ----------------------------------------------------
// MODE 2: AUTOMATIC ZEN MODE (The Shield)
// ----------------------------------------------------
function activateZenMode() {
    if (isLockedInMode) return;
    isLockedInMode = true;

    document.body.classList.add('grayscale-mode');
    document.body.classList.add('focus-mode-active'); // Hides Sidebars
    
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

// ----------------------------------------------------
// SHARED UTILITIES
// ----------------------------------------------------

function exitModes() {
    isLockedInMode = false;
    
    // Reset ALL Styles
    document.body.classList.remove('grayscale-mode');
    document.body.classList.remove('focus-mode-active'); // SHOW Sidebars
    document.body.classList.remove('focus-aura-pulse');
    document.body.style.filter = ""; 
    
    const overlay = document.getElementById('bullet-mode-overlay');
    if (overlay) overlay.remove();
    
    const shield = document.getElementById('zen-shield-overlay');
    if (shield) shield.remove();
    
    console.log("🟢 Mode Reset: NORMAL");
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
    // 1. Find the "meat" of the page (Article body)
    const mainContent = findMainContent() || document.body;
    
    // 2. Clone it so we don't mess up the actual page
    const clone = mainContent.cloneNode(true);
    
    // 3. Remove junk (Scripts, ads, navs, hidden stuff)
    const junkSelectors = [
        'script', 'style', 'svg', 'iframe', 'nav', 'footer', 
        '.ads', '.ad', '.advertisement', '[role="complementary"]'
    ];
    clone.querySelectorAll(junkSelectors.join(',')).forEach(n => n.remove());

    // 4. INTELLIGENT EXTRACTION (The Fix)
    // Instead of clone.innerText (which kills links), we loop through text blocks 
    // and grab their .outerHTML (which keeps links alive).
    let richTextPayload = "";
    const meaningfulElements = clone.querySelectorAll('p, h1, h2, h3, li, blockquote');
    
    meaningfulElements.forEach(el => {
        const text = el.innerText.trim();
        // Only include if it has actual content (skip empty spacer divs)
        if (text.length > 30) {
            richTextPayload += el.outerHTML + "\n";
        }
    });

    // Fallback: If intelligent extraction failed (e.g. site uses weird divs), grab raw HTML
    if (richTextPayload.length < 500) {
        richTextPayload = clone.innerHTML; 
    }

    // 5. Truncate to safety limit (Gemini Flash has a large context, but let's be safe with ~15k chars)
    const finalPayload = richTextPayload.substring(0, 15000);

    // 6. Send to Background
    console.log("📤 Sending payload length:", finalPayload.length);
    chrome.runtime.sendMessage({
        type: "SUMMARIZE_TEXT",
        text: finalPayload
    });
}

function renderSummary(summaryText) {
    const header = document.getElementById('bullet-mode-header');
    const spinner = document.getElementById('bullet-loading-spinner');
    const container = document.getElementById('bullet-list'); 
    
    if (header && container) {
        header.innerText = "✨ Smart Notes"; 
        if (spinner) spinner.style.display = "none";
        container.innerHTML = summaryText;
    }
}

function clearVisualEffects() {
    if (!isLockedInMode) {
        document.body.classList.remove('focus-aura-pulse');
        document.body.classList.remove('focus-mode-active'); // SHOW Sidebars
        document.body.style.filter = "";
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