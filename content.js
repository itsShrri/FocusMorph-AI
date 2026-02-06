// Telemetry Engine (Upgraded for Jitter Detection)

let mouseVelocity = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let lastMouseTime = Date.now();

let scrollAcceleration = 0;
let lastScrollY = window.scrollY;
let lastScrollTime = Date.now();
let lastScrollVelocity = 0;

// NEW: Variables for Scroll Jitter
let scrollDirectionChanges = 0;
let lastScrollDirection = 0; // 1 for down, -1 for up

let tabSwitchCount = 0;

// Mouse Velocity Tracker
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    const dt = now - lastMouseTime;
    if (dt > 50) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        mouseVelocity = distance / dt;

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        lastMouseTime = now;
    }
});

// Scroll Tracker (Now detects Direction Swaps)
window.addEventListener('scroll', () => {
    const now = Date.now();
    const dt = now - lastScrollTime;
    
    if (dt > 20) { // Check slightly faster for jitter
        const currentScrollY = window.scrollY;
        const dy = currentScrollY - lastScrollY; // Signed difference (positive or negative)
        
        // 1. Calculate Acceleration (existing logic)
        const velocity = Math.abs(dy) / dt;
        scrollAcceleration = Math.abs(velocity - lastScrollVelocity) / dt;

        // 2. Calculate Direction Changes (NEW LOGIC)
        const currentDirection = Math.sign(dy); // returns 1 or -1
        if (currentDirection !== 0 && currentDirection !== lastScrollDirection) {
            scrollDirectionChanges++;
            lastScrollDirection = currentDirection;
        }

        lastScrollY = currentScrollY;
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
                // Send the new metric
                scrollDirectionChanges: scrollDirectionChanges,
                tabSwitchCount: tabSwitchCount,
                timestamp: Date.now()
            }
        };

        // Reset counters
        const currentTabSwitches = tabSwitchCount;
        tabSwitchCount = 0;
        telemetryData.metrics.tabSwitchCount = currentTabSwitches;

        // Reset Jitter counter
        const currentJitter = scrollDirectionChanges;
        scrollDirectionChanges = 0; 
        telemetryData.metrics.scrollDirectionChanges = currentJitter;

        chrome.runtime.sendMessage(telemetryData);

        // Decay instantaneous values
        mouseVelocity *= 0.5;
        scrollAcceleration *= 0.1;
    } catch (error) {
        // Context invalidated
    }
}, 500); // Sends data every 0.5 seconds

// Listen for adaptive commands
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ADAPT_UI") {
        if (typeof applyAdaptiveUI === 'function') {
            applyAdaptiveUI(request.level, request.score);
        }
    }
});