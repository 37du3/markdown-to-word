/**
 * Chrome Extension Background Service Worker
 * Simplified - only handles keyboard shortcuts
 */

// Listen for keyboard shortcut to open popup
chrome.commands.onCommand.addListener((command) => {
    if (command === '_execute_action') {
        // Popup opens automatically via _execute_action
        console.log('[Background] Keyboard shortcut triggered');
    }
});

// Listen for messages from popup (for future use)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Background] Received message:', request);
    sendResponse({ success: true });
    return true;
});
