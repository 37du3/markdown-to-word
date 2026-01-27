import { useState, useCallback } from 'react';

/**
 * Extract LaTeX from KaTeX/MathJax rendered HTML
 * Gemini uses annotation elements with encoding="application/x-tex" for LaTeX source
 */
function extractMathFromHtml(html: string): string {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Find all math containers and replace with LaTeX
    // Pattern 1: KaTeX annotation elements
    const annotations = doc.querySelectorAll('annotation[encoding="application/x-tex"]');
    annotations.forEach(annotation => {
        const latex = annotation.textContent || '';
        const mathContainer = annotation.closest('.katex, .math, .MathJax, [class*="math"]');
        if (mathContainer && latex) {
            // Determine if block or inline math
            const isBlock = mathContainer.closest('.katex-display, .math-display, [class*="display"]') !== null;
            const replacement = isBlock ? `$$${latex}$$` : `$${latex}$`;

            // Replace the math container with LaTeX text
            const textNode = doc.createTextNode(replacement);
            mathContainer.parentNode?.replaceChild(textNode, mathContainer);
        }
    });

    // Pattern 2: Elements with title or aria-label containing LaTeX
    const mathElements = doc.querySelectorAll('[title], [aria-label]');
    mathElements.forEach(el => {
        const title = el.getAttribute('title') || el.getAttribute('aria-label') || '';
        // Check if title looks like LaTeX (contains backslash or common patterns)
        if (title && (title.includes('\\') || /^[A-Za-z]_\{?\d/.test(title) || /\^/.test(title))) {
            const textNode = doc.createTextNode(`$${title}$`);
            el.parentNode?.replaceChild(textNode, el);
        }
    });

    // Pattern 3: MathML with annotation-xml
    const mathmlAnnotations = doc.querySelectorAll('annotation-xml[encoding*="tex"], annotation-xml[encoding*="latex"]');
    mathmlAnnotations.forEach(annotation => {
        const latex = annotation.textContent || '';
        const mathContainer = annotation.closest('math');
        if (mathContainer && latex) {
            const textNode = doc.createTextNode(`$${latex}$`);
            mathContainer.parentNode?.replaceChild(textNode, mathContainer);
        }
    });

    // Get the text content, preserving some structure
    let text = '';
    const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            const tagName = el.tagName.toLowerCase();

            // Handle block elements
            if (['p', 'div', 'br', 'hr', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
                if (text && !text.endsWith('\n')) {
                    text += '\n';
                }
            }

            // Handle lists
            if (tagName === 'li') {
                const parent = el.parentElement;
                if (parent?.tagName.toLowerCase() === 'ol') {
                    const index = Array.from(parent.children).indexOf(el) + 1;
                    text += `${index}. `;
                } else {
                    text += '- ';
                }
            }

            // Process children
            node.childNodes.forEach(child => walk(child));

            // Add newline after block elements
            if (['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'tr'].includes(tagName)) {
                if (!text.endsWith('\n')) {
                    text += '\n';
                }
            }
        }
    };

    walk(doc.body);
    return text.trim();
}

/**
 * Try to intelligently read clipboard content, preferring formats that preserve math
 */
async function readClipboardSmart(): Promise<string> {
    try {
        // Try to read all formats
        const items = await navigator.clipboard.read();

        for (const item of items) {
            // Check if HTML is available
            if (item.types.includes('text/html')) {
                const htmlBlob = await item.getType('text/html');
                const html = await htmlBlob.text();

                // Check if HTML contains math elements
                if (html.includes('annotation') ||
                    html.includes('katex') ||
                    html.includes('MathJax') ||
                    html.includes('math-inline') ||
                    html.includes('math-block')) {
                    // Extract math from HTML
                    const extractedText = extractMathFromHtml(html);
                    if (extractedText) {
                        return extractedText;
                    }
                }
            }

            // Fallback to plain text
            if (item.types.includes('text/plain')) {
                const textBlob = await item.getType('text/plain');
                return await textBlob.text();
            }
        }

        // Final fallback
        return await navigator.clipboard.readText();
    } catch {
        // If clipboard.read() fails (e.g., permissions), fall back to readText
        return await navigator.clipboard.readText();
    }
}

export function useClipboard() {
    const [isReading, setIsReading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const readClipboard = useCallback(async (): Promise<string> => {
        setIsReading(true);
        setError(null);

        try {
            const text = await readClipboardSmart();
            return text;
        } catch (err) {
            const message = err instanceof Error ? err.message : '无法读取剪贴板';
            setError(message);
            throw new Error(message);
        } finally {
            setIsReading(false);
        }
    }, []);

    const writeClipboard = useCallback(async (html: string, plainText: string): Promise<void> => {
        try {
            // Create a ClipboardItem with both HTML and plain text
            const htmlBlob = new Blob([html], { type: 'text/html' });
            const textBlob = new Blob([plainText], { type: 'text/plain' });

            const clipboardItem = new ClipboardItem({
                'text/html': htmlBlob,
                'text/plain': textBlob,
            });

            await navigator.clipboard.write([clipboardItem]);
        } catch (err) {
            // Fallback to plain text if HTML writing fails
            try {
                await navigator.clipboard.writeText(plainText);
            } catch (fallbackErr) {
                const message = err instanceof Error ? err.message : '无法写入剪贴板';
                throw new Error(message);
            }
        }
    }, []);

    return {
        readClipboard,
        writeClipboard,
        paste: readClipboard,
        copy: writeClipboard,
        isReading,
        error
    };
}
