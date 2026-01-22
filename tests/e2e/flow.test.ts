import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { MarkdownParser } from '../../src/utils/parser/MarkdownParser';
import { HtmlConverter } from '../../src/utils/converter/HtmlConverter';
import type { ConversionOptions } from '../../src/types';
import { ClipboardUtils } from '../../src/utils/clipboard/ClipboardUtils';

describe('E2E: User Workflow', () => {
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
      url: 'https://localhost:3000',
    });

    (global as any).document = dom.window.document;
    (global as any).window = dom.window;
    (global as any).navigator = dom.window.navigator;
    (global as any).ClipboardItem = function () {
      return {};
    };
  });

  it('should complete full user workflow', async () => {
    const markdownInput = document.createElement('textarea');
    const previewDiv = document.createElement('div');
    const copyButton = document.createElement('button');

    markdownInput.value = '# Test\n\nHello **World**';

    const parser = new MarkdownParser();
    const converter = new HtmlConverter();
    const options: ConversionOptions = {
      table: {
        enableMergedCells: true,
        defaultAlign: 'left',
        headerBackground: '#f0f0f0',
        borderColor: '#000000',
      },
      code: {
        showLineNumbers: true,
        theme: 'light',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
      },
      text: {
        fontFamily: 'Noto Serif SC',
        fontSize: 12,
        lineHeight: 1.5,
        linkColor: '#0563c1',
      },
      heading: {
        fontFamily: 'Noto Serif SC',
        h1Size: 16,
        h2Size: 14,
        h3Size: 13,
        h4Size: 12,
        h5Size: 11,
        h6Size: 10,
      },
      math: {
        output: 'katex',
      },
    };

    const ast = parser.parse(markdownInput.value);
    previewDiv.innerHTML = converter.convert(ast, options);

    expect(previewDiv.innerHTML).toContain('<h1');
    expect(previewDiv.innerHTML).toContain('<strong>');

    const mockWrite = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { write: mockWrite, writeText: vi.fn().mockResolvedValue(undefined) },
    });

    await ClipboardUtils.writeToClipboard({
      html: previewDiv.innerHTML,
      plainText: markdownInput.value,
    });

    copyButton.click();
    expect(navigator.clipboard).toBeDefined();
  });
});
