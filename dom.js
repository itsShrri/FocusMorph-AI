// Gamified Adaptive UI
// Manipulates DOM based on AI commands

const PRUNE_SELECTORS = [
    'aside',
    '#sidebar',
    '.sidebar',
    '.ads',
    '.advertisement',
    '.recommendations',
    '#comments',
    '.social-share'
];

function applyAdaptiveUI(level, score) {
    console.log(`[DOM] Applying Adaptive UI Level: ${level} (Score: ${score})`);

    // Reset State
    document.body.classList.remove('focus-aura-pulse');
    removeSpotlight();
    restorePrunedElements();

    if (level === 'FOCUS') {
        // Core Drive 3: Feedback (Pulse)
        // Intensity based on score (mapped to opacity/color speed)
        document.body.classList.add('focus-aura-pulse');
        document.documentElement.style.setProperty('--aura-intensity', Math.min(1, score / 100));
    } else if (level === 'DEEP_WORK') {
        // Core Drive 8: Loss/Avoidance (Pruning)
        pruneDistractions();

        // Core Drive 4: Ownership (Spotlight)
        applySpotlight();

        // Also keep the aura but maybe calmer? Or more intense? Let's keep it intense.
        document.body.classList.add('focus-aura-pulse');
        document.documentElement.style.setProperty('--aura-intensity', 1);
    }
}

function pruneDistractions() {
    PRUNE_SELECTORS.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('visually-pruned');
        });
    });
}

function restorePrunedElements() {
    const pruned = document.querySelectorAll('.visually-pruned');
    pruned.forEach(el => {
        el.classList.remove('visually-pruned');
    });
}

function applySpotlight() {
    // Heuristic: Find the likely main content
    const mainContent = document.querySelector('article') ||
        document.querySelector('main') ||
        document.querySelector('#main') ||
        document.querySelector('#content');

    if (!mainContent) return; // Can't identify main content safely

    // Blur everything else
    // This is a heavy operation, so we do it carefully.
    // We iterate over direct children of body.
    Array.from(document.body.children).forEach(child => {
        if (child !== mainContent && !child.contains(mainContent) && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
            child.classList.add('spotlight-blur');
        }
    });
}

function removeSpotlight() {
    const blurred = document.querySelectorAll('.spotlight-blur');
    blurred.forEach(el => {
        el.classList.remove('spotlight-blur');
    });
}

