// AI Decision Layer
// Analyzes telemetry and broadcasts adaptive commands

let distractionScore = 0; // 0 to 100
const DECAY_RATE = 5;       // Points to decrease per tick
const THRESHOLD_FOCUS = 30; // Triggers "Focus Aura"
const THRESHOLD_PRUNE = 70; // Triggers "Visual Pruning"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TELEMETRY") {
        processTelemetry(request.metrics, sender.tab.id);
    }
});

function processTelemetry(metrics, tabId) {
    let scoreDelta = 0;

    // 1. Mouse Velocity (Erratic movement)
    // Threshold: > 1.5 px/ms is fast/erratic
    if (metrics.mouseVelocity > 1.5) {
        scoreDelta += 5 * metrics.mouseVelocity;
    }

    // 2. Scroll Acceleration (Doom scrolling / Skimming)
    // Threshold: > 0.1 is significant acceleration
    if (metrics.scrollAcceleration > 0.1) {
        scoreDelta += 10;
    }

    // 3. Tab Switching (Context switching)
    if (metrics.tabSwitchCount > 0) {
        scoreDelta += 20 * metrics.tabSwitchCount;
    }

    // Update Score
    if (scoreDelta > 0) {
        distractionScore += scoreDelta;
    } else {
        distractionScore -= DECAY_RATE;
    }

    // Clamp Score
    distractionScore = Math.max(0, Math.min(100, distractionScore));

    console.log(`[AI] Score: ${distractionScore.toFixed(2)} | Delta: ${scoreDelta.toFixed(2)} | Metrics:`, metrics);

    // Decision Logic
    let level = "NORMAL";
    if (distractionScore > THRESHOLD_PRUNE) {
        level = "DEEP_WORK";
    } else if (distractionScore > THRESHOLD_FOCUS) {
        level = "FOCUS";
    }

    // Broadcast Decision
    chrome.tabs.sendMessage(tabId, {
        type: "ADAPT_UI",
        level: level,
        score: distractionScore
    }).catch(() => {
        // Tab might be closed or inactive
    });
}

