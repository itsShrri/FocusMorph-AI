// Telemetry Engine

let mouseVelocity = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let lastMouseTime = Date.now();

let scrollAcceleration = 0;
let lastScrollY = window.scrollY;
let lastScrollTime = Date.now();
let lastScrollVelocity = 0;

let tabSwitchCount = 0;

// Mouse Velocity Tracker
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    const dt = now - lastMouseTime;
    if (dt > 50) { // Limit sampling
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        mouseVelocity = distance / dt; // pixels per ms

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        lastMouseTime = now;
    }
});

// Scroll Acceleration Tracker
window.addEventListener('scroll', () => {
    const now = Date.now();
    const dt = now - lastScrollTime;
    if (dt > 50) {
        const dy = Math.abs(window.scrollY - lastScrollY);
        const velocity = dy / dt;
        scrollAcceleration = Math.abs(velocity - lastScrollVelocity) / dt;

        lastScrollY = window.scrollY;
        lastScrollVelocity = velocity;
        lastScrollTime = now;
    }
});

// Tab Switching Listener
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        tabSwitchCount++;
    }
});

// Message Passing to Background
setInterval(() => {
    try {
        const telemetryData = {
            type: "TELEMETRY",
            metrics: {
                mouseVelocity: parseFloat(mouseVelocity.toFixed(4)),
                scrollAcceleration: parseFloat(scrollAcceleration.toFixed(6)),
                tabSwitchCount: tabSwitchCount,
                timestamp: Date.now()
            }
        };

        // Reset counters (optional, depending on if we want cumulative or instantaneous)
        // tabSwitchCount = 0; // Keeping it cumulative for now, or reset?
        // Let's reset tab switch count to send "switches per interval"
        const currentTabSwitches = tabSwitchCount;
        tabSwitchCount = 0;
        telemetryData.metrics.tabSwitchCount = currentTabSwitches;

        chrome.runtime.sendMessage(telemetryData);

        // Decay values (simulating momentary bursts)
        mouseVelocity *= 0.5;
        scrollAcceleration *= 0.1;
    } catch (error) {
        // Context invalidated, etc.
    }
}, 500);

// Listen for adaptive commands
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ADAPT_UI") {
        if (typeof applyAdaptiveUI === 'function') {
            applyAdaptiveUI(request.level, request.score);
        }
    }
});

