/**
 * Chrome Extension Content Script
 * Runs on ChatGPT and Claude pages to extract conversation content
 */

// Function to extract markdown content from ChatGPT
function extractChatGPTContent(): string | null {
    // ChatGPT conversation selector (may need updates based on UI changes)
    const conversationElements = document.querySelectorAll('[data-message-author-role]');
    let markdown = '';

    conversationElements.forEach((element) => {
        const role = element.getAttribute('data-message-author-role');
        const textContent = element.textContent || '';

        if (role === 'user') {
            markdown += `## User\n\n${textContent}\n\n`;
        } else if (role === 'assistant') {
            markdown += `## Assistant\n\n${textContent}\n\n`;
        }
    });

    return markdown || null;
}

// Function to extract markdown content from Claude
function extractClaudeContent(): string | null {
    // Claude conversation selector (may need updates based on UI changes)
    const messages = document.querySelectorAll('[data-testid*="message"]');
    let markdown = '';

    messages.forEach((message) => {
        const textContent = message.textContent || '';
        markdown += `${textContent}\n\n`;
    });

    return markdown || null;
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
        const hostname = window.location.hostname;
        let content: string | null = null;

        if (hostname.includes('chatgpt.com')) {
            content = extractChatGPTContent();
        } else if (hostname.includes('claude.ai')) {
            content = extractClaudeContent();
        }

        sendResponse({ content });
    }
    return true;
});

// Optional: Add a floating button for quick conversion
function addFloatingButton() {
    const button = document.createElement('button');
    button.textContent = '📄 转为Word';
    button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

    button.addEventListener('click', () => {
        const hostname = window.location.hostname;
        let content: string | null = null;

        if (hostname.includes('chatgpt.com')) {
            content = extractChatGPTContent();
        } else if (hostname.includes('claude.ai')) {
            content = extractClaudeContent();
        }

        if (content) {
            chrome.runtime.sendMessage({ action: 'convert', content });
        }
    });

    document.body.appendChild(button);
}

// Add floating button when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFloatingButton);
} else {
    addFloatingButton();
}
