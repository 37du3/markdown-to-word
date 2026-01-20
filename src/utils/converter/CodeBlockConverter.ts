import hljs from 'highlight.js';
import type { MarkdownTokens, ConversionOptions } from '../../types';

export class CodeBlockConverter {
  constructor() {
    hljs.configure({
      languages: ['typescript', 'javascript', 'python', 'java', 'cpp', 'html', 'css', 'sql'],
    });
  }

  convert(token: MarkdownTokens, options: ConversionOptions): string {
    const code = token.text || '';
    const language = token.lang || 'plaintext';

    let highlightedCode: string;
    try {
      if (language && hljs.getLanguage(language)) {
        highlightedCode = hljs.highlight(code, { language }).value;
      } else {
        highlightedCode = this.escapeHtml(code);
      }
    } catch (error) {
      console.warn(`Failed to highlight code in language: ${language}`, error);
      highlightedCode = this.escapeHtml(code);
    }

    const codeWithLineNumbers = options.code.showLineNumbers
      ? this.addLineNumbers(highlightedCode)
      : highlightedCode;

    return `
      <pre style="background-color: #f5f5f5; padding: 12pt; overflow-x: auto; border-radius: 4px; margin: 12pt 0;">
        <code class="hljs ${language}" style="font-family: ${options.code.fontFamily}; font-size: ${options.code.fontSize}pt;">${codeWithLineNumbers}</code>
      </pre>
    `;
  }

  private addLineNumbers(code: string): string {
    const lines = code.split('\n');
    return lines
      .map((line, index) => `<span class="line-number">${index + 1}</span>${line}`)
      .join('\n');
  }

  private escapeHtml(text: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
  }
}
