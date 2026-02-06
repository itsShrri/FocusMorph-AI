// background.js - 3-State Edition (Normal -> Focus -> Zen)

const DEFAULT_KEY = "PASTE_YOUR_DEFAULT_API_KEY_HERE"; 

// --- Telemetry & Scoring Logic ---
let distractionScore = 0;
const DECAY_RATE = 5;

// SIMPLIFIED THRESHOLDS
const THRESHOLD_FOCUS = 30; // Triggers Sidebar Hiding + Spotlight
const THRESHOLD_ZEN = 80;   // Triggers Blackout Shield

// Timer Variable
let focusLockEndTime = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TELEMETRY") {
        processTelemetry(request.metrics, sender.tab.id);
    }
    if (request.type === "SUMMARIZE_TEXT") {
        summarizeWithGemini(request.text, sender.tab.id);
    }
});

function processTelemetry(metrics, tabId) {
    let scoreDelta = 0;
    
    if (metrics.mouseVelocity > 1.5) scoreDelta += 5 * metrics.mouseVelocity;
    if (metrics.scrollAcceleration > 0.1) scoreDelta += 10;
    if (metrics.scrollDirectionChanges > 2) scoreDelta += 30;
    
    if (scoreDelta > 0) {
        distractionScore += scoreDelta;
    } else {
        distractionScore -= DECAY_RATE;
    }
    
    distractionScore = Math.max(0, Math.min(100, distractionScore));
    
    // --- 1. DETERMINE LEVEL (Only 3 States Now) ---
    let level = "NORMAL";
    
    if (distractionScore > THRESHOLD_ZEN) {
        level = "ZEN";
    } else if (distractionScore > THRESHOLD_FOCUS) {
        level = "FOCUS"; // This now includes all Deep Work features
    }

    // --- 2. 5-MINUTE LOCK LOGIC ---
    const now = Date.now();

    // If we hit FOCUS or ZEN, engage lock if not already locked
    if (level !== "NORMAL" && now > focusLockEndTime) {
        focusLockEndTime = now + (5 * 60 * 1000); 
        console.log("🔒 Focus Lock Engaged for 5 mins.");
    }

    // Enforce Lock
    if (now < focusLockEndTime) {
        if (level === "NORMAL") {
            level = "FOCUS"; 
            distractionScore = Math.max(distractionScore, THRESHOLD_FOCUS);
        }
    }
    
    chrome.tabs.sendMessage(tabId, { type: "ADAPT_UI", level: level, score: distractionScore }).catch(() => {});
}

async function summarizeWithGemini(rawText, tabId) {
    const data = await chrome.storage.local.get(['geminiApiKey']);
    const apiKey = data.geminiApiKey || DEFAULT_KEY; 

    if (!apiKey) {
        chrome.tabs.sendMessage(tabId, { type: "SHOW_SUMMARY", summary: "⚠️ API Key missing." });
        return;
    }

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const prompt = `
        You are an expert student note-taker. 
        Summarize the following text into a "Study Guide" using HTML format.
        Design Rules:
        1. Use <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;"> for Main Topics.
        2. Wrap key concepts in a box: <div style="background-color: #e8f6f3; padding: 15px; border-radius: 8px; border-left: 5px solid #1abc9c; margin: 10px 0;">.
        3. Use <strong style="color: #e74c3c;"> for critical warnings.
        4. Preserve links as <a href="..." style="color: #2980b9;">.
        5. Return ONLY raw HTML.
        Text to summarize: ${rawText}`;

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            chrome.tabs.sendMessage(tabId, { type: "SHOW_SUMMARY", summary: data.candidates[0].content.parts[0].text });
        }
    } catch (error) {
        console.error(error);
    }
}