# FocusMorph AI: Adaptive UI for Neurodiversity
---
FocusMorph AI is an intelligent browser extension designed to combat "distraction spirals" for users with ADHD and cognitive impairments by dynamically morphing the web environment based on real-time behavior. This project was developed as part of iNTUtion 2026 at Nanyang Technological University.

🧠 **The Problem**
Standard digital interfaces are often rigid and filled with visual noise. For neurodivergent users, this leads to high cognitive load, making it difficult to maintain focus on primary tasks.

✨ **Key Features**
- Behavioral Telemetry: Real-time tracking of mouse velocity, scroll jitter, and tab-switching frequency to detect cognitive fatigue.
- Adaptive UI Morphing: The interface automatically "prunes" visual noise by hiding sidebars, navigation menus, and ads when distraction is detected.
- AI Study Shield: A dedicated "Deep Focus" mode that uses Gemini 1.5 Flash to extract meaningful content and generate structured HTML study guides, removing the need to read through cluttered pages.
- Zen Mode: A high-threshold "Blackout" shield that triggers during extreme distraction to force a mental reset through grayscale filters and breathing prompts.

🛠️ **Technical Implementation**
- **Frontend Logic**: Pure JavaScript (Manifest V3) for low-latency DOM manipulation and telemetry gathering.
- **AI Integration**: Leverages the Google Gemini API for context-aware text summarization.
- **Styling**: CSS-driven "Aura" pulses and layout shifts to ensure the user's flow isn't broken by hard page reloads.

🚀 **Getting Started**
1. Clone the Repository
2. Run Bash: git clone https://github.com/your-username/focusmorph-ai.git
3. Open Chrome and navigate to chrome://extensions/.
4. Enable Developer Mode.
5. Click Load unpacked and select the project folder.
6. Open the extension Options.
7. Paste your Gemini API Key.
8. Browse naturally; the UI will dim and simplify as your interaction patterns indicate a loss of focus.
