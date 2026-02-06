// background.js - Corrected Model & Storage Integrated

// 1. FALLBACK KEY (Only used if user hasn't saved one in Options)
const DEFAULT_KEY = "PASTE_YOUR_DEFAULT_API_KEY_HERE"; // <-- REPLACE with your default key

// --- Telemetry & Scoring Logic ---
let distractionScore = 0;
const DECAY_RATE = 5;
const THRESHOLD_FOCUS = 30;
const THRESHOLD_PRUNE = 70;
const THRESHOLD_ZEN = 80;

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
    
    if (scoreDelta > 0) distractionScore += scoreDelta;
    else distractionScore -= DECAY_RATE;
    
    distractionScore = Math.max(0, Math.min(100, distractionScore));
    
    let level = "NORMAL";
    if (distractionScore > THRESHOLD_PRUNE) level = "DEEP_WORK";
    else if (distractionScore > THRESHOLD_FOCUS) level = "FOCUS";
    else if (distractionScore > THRESHOLD_ZEN) level = "ZEN";
    
    chrome.tabs.sendMessage(tabId, { type: "ADAPT_UI", level: level, score: distractionScore }).catch(() => {});
}

async function summarizeWithGemini(rawText, tabId) {
    // 1. RETRIEVE KEY FROM STORAGE (Secure Way)
    const data = await chrome.storage.local.get(['geminiApiKey']);
    const apiKey = data.geminiApiKey || DEFAULT_KEY; // Use saved key, or fallback to hardcoded one

    if (!apiKey) {
        chrome.tabs.sendMessage(tabId, { 
            type: "SHOW_SUMMARY", 
            summary: "⚠️ API Key missing. Please check extension options." 
        });
        return;
    }

    // 2. CORRECT URL (Using 2.5-flash)
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        console.log("SENDING TO AI...");
        const prompt = `
        You are an expert student note-taker. 
        Summarize the following text into a "Study Guide" using HTML format.
        
        Design Rules:
        1. Use <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;"> for Main Topics.
        2. Wrap key concepts in a box: <div style="background-color: #e8f6f3; padding: 15px; border-radius: 8px; border-left: 5px solid #1abc9c; margin: 10px 0;">.
        3. Use <strong style="color: #e74c3c;"> for critical warnings.
        4. Preserve links as <a href="..." style="color: #2980b9;">.
        5. Return ONLY raw HTML.
        
        Text to summarize:
        ${rawText}
        `;

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("❌ API ERROR:", data.error.message);
            chrome.tabs.sendMessage(tabId, { 
                type: "SHOW_SUMMARY", 
                summary: `❌ API Error: ${data.error.message}`
            });
            return;
        }

        if (data.candidates && data.candidates.length > 0) {
            const summary = data.candidates[0].content.parts[0].text;
            chrome.tabs.sendMessage(tabId, { type: "SHOW_SUMMARY", summary: summary });
        } else {
            chrome.tabs.sendMessage(tabId, { 
                type: "SHOW_SUMMARY", 
                summary: "⚠️ AI returned no text."
            });
        }

    } catch (error) {
        console.error("Network Error:", error);
        chrome.tabs.sendMessage(tabId, { 
            type: "SHOW_SUMMARY", 
            summary: "❌ Network Error. Check internet connection."
        });
    }
}