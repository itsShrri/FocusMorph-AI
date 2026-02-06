document.getElementById('force-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { type: "MANUAL_TRIGGER_FOCUS" });
    window.close();
  }
});

document.getElementById('reset-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { type: "MANUAL_EXIT_FOCUS" });
    window.close();
  }
});