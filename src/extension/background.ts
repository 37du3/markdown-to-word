/**
 * Chrome Extension Background Service Worker
 * Handles context menus, keyboard shortcuts, and notifications
 */

// Create context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'convert-to-word',
        title: '转换为 Word 文档',
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
            title: 'Markdown to Word',
            message: '正在转换选中的文本...',
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
            title: '转换成功',
            message: 'Word 文档已生成',
        });
        sendResponse({ success: true });
    }
    return true;
});
