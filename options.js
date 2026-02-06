// Saves options to chrome.storage
const saveOptions = () => {
  const apiKey = document.getElementById('apiKey').value;

  chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.textContent = '✅ Key Saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
};

// Restores the input box state using the preferences stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.local.get({ geminiApiKey: '' }, (items) => {
    document.getElementById('apiKey').value = items.geminiApiKey;
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);