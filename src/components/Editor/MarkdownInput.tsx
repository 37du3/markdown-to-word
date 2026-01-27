import React, { useRef, useEffect, useCallback } from 'react';
import type { EditorProps } from '../../types';

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

      // Handle headers - add markdown formatting
      if (tagName.match(/^h[1-6]$/)) {
        const level = parseInt(tagName[1]);
        text += '#'.repeat(level) + ' ';
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

      // Handle bold/strong
      if (tagName === 'strong' || tagName === 'b') {
        text += '**';
      }

      // Process children
      node.childNodes.forEach(child => walk(child));

      // Close bold/strong
      if (tagName === 'strong' || tagName === 'b') {
        text += '**';
      }

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

export function MarkdownInput({
  value,
  onChange,
  placeholder = '在此输入 Markdown 文本...',
  readOnly = false,
  autoFocus = false,
}: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  // 处理输入
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // 处理粘贴事件 - 从 HTML 中提取 LaTeX
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData;

    // Check if HTML is available
    const html = clipboardData.getData('text/html');
    const plainText = clipboardData.getData('text/plain');

    // If HTML contains math elements, extract LaTeX from it
    if (html && (
      html.includes('annotation') ||
      html.includes('katex') ||
      html.includes('MathJax') ||
      html.includes('math-inline') ||
      html.includes('math-block') ||
      html.includes('class="math"')
    )) {
      e.preventDefault();

      const extractedText = extractMathFromHtml(html);

      // Get cursor position and insert text
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + extractedText + value.substring(end);
        onChange(newValue);

        // Set cursor position after inserted text
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + extractedText.length;
        });
      } else {
        // Fallback: just set the value
        onChange(extractedText);
      }
    }
    // If no HTML with math, let browser handle paste with plain text
  }, [value, onChange]);

  // 处理 Tab 键插入空格而不是切换焦点
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // 恢复光标位置
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      readOnly={readOnly}
      autoFocus={autoFocus}
      className="w-full h-full min-h-[200px] p-4 resize-none outline-none
                 font-mono text-sm leading-relaxed
                 bg-white text-gray-900 placeholder-gray-400
                 focus:ring-2 focus:ring-primary-500/20"
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
    />
  );
}
