// background.js - Final Stable Version

// 1. PASTE YOUR KEY HERE (Make sure it is inside the quotes!)
const GEMINI_API_KEY = "PASTE YOUR KEY HERE"; 

// BACKUP OPTION (Use this if Flash fails):
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// --- Telemetry & Scoring Logic ---
let distractionScore = 0;
const DECAY_RATE = 5;
const THRESHOLD_FOCUS = 30;
const THRESHOLD_PRUNE = 70;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TELEMETRY") {
        processTelemetry(request.metrics, sender.tab.id);
    }
    if (request.type === "SUMMARIZE_TEXT") {
        summarizeWithGemini(request.text, sender.tab.id);
    }
});

function processTelemetry(metrics, tabId) {
    // ... (Keep your existing scoring logic from before) ...
    // If you lost it, I can provide it again, but usually you just keep the top part
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
    
    chrome.tabs.sendMessage(tabId, { type: "ADAPT_UI", level: level, score: distractionScore }).catch(() => {});
}

async function summarizeWithGemini(rawText, tabId) {
    try {
        console.log("SENDING TO AI...");

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Summarize this text in bullet points:\n${rawText}` }] }],
                // ADDED: Safety settings to prevent blocking
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        // 1. CHECK FOR API ERROR (Invalid Key, etc.)
        if (data.error) {
            console.error("❌ API ERROR:", data.error.message);
            chrome.tabs.sendMessage(tabId, { 
                type: "SHOW_SUMMARY", 
                summary: `❌ API Error: ${data.error.message}\n(Check your API Key in background.js)`
            });
            return;
        }

        // 2. CHECK FOR CANDIDATES (The real crash fix)
        if (data.candidates && data.candidates.length > 0) {
            const summary = data.candidates[0].content.parts[0].text;
            chrome.tabs.sendMessage(tabId, { type: "SHOW_SUMMARY", summary: summary });
        } else {
            // If candidates is empty, Google blocked it or returned nothing
            console.warn("⚠️ Empty Response:", data);
            chrome.tabs.sendMessage(tabId, { 
                type: "SHOW_SUMMARY", 
                summary: "⚠️ AI returned no text. The content might be too short or filtered."
            });
        }

    } catch (error) {
        console.error("Network/Code Error:", error);
        chrome.tabs.sendMessage(tabId, { 
            type: "SHOW_SUMMARY", 
            summary: "❌ Network Error. Please check your internet connection."
        });
    }
}