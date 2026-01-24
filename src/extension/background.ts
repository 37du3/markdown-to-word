/**
 * Chrome Extension Background Service Worker
 * Handles context menus, keyboard shortcuts, and notifications
 */

// Create context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'convert-to-word',
        title: chrome.i18n.getMessage('convertToWord'),
        contexts: ['selection'],
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'convert-to-word' && info.selectionText) {
        // Send selected text to popup or handle conversion
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: chrome.i18n.getMessage('extName'),
            message: chrome.i18n.getMessage('converting'),
        });
    }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'convert') {
        // Handle conversion request
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: chrome.i18n.getMessage('convertSuccess'),
            message: chrome.i18n.getMessage('convertSuccessMessage'),
        });
        sendResponse({ success: true });
    }
    return true;
});
