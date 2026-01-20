import { describe, it, expect } from 'vitest';
import { HtmlConverter } from '../../src/utils/converter/HtmlConverter';
import { MarkdownParser } from '../../src/utils/parser/MarkdownParser';
import type { ConversionOptions } from '../../src/types';

describe('HtmlConverter', () => {
  const parser = new MarkdownParser();
  const converter = new HtmlConverter();
  const options: ConversionOptions = {
    table: {
      enableMergedCells: false,
      defaultAlign: 'left',
      headerBackground: '#f0f0f0',
      borderColor: '#000000',
    },
    code: {
      showLineNumbers: false,
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

  it('should convert heading', () => {
    const markdown = '# Heading 1';
    const ast = parser.parse(markdown);
    const result = converter.convert(ast, options);

    expect(result).toContain('<h1');
    expect(result).toContain('Heading 1');
    expect(result).toContain('font-size: 16pt');
  });

  it('should convert code block', () => {
    const markdown = '```typescript\nconst x = 1;\n```';
    const ast = parser.parse(markdown);
    const result = converter.convert(ast, options);

    expect(result).toContain('<pre');
    expect(result).toContain('<code');
    expect(result).toContain('JetBrains Mono');
  });

  it('should convert table', () => {
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
    const ast = parser.parse(markdown);
    const result = converter.convert(ast, options);

    expect(result).toContain('<table');
    expect(result).toContain('<th');
    expect(result).toContain('<td');
  });

  it('should render math with katex output', () => {
    const markdown = 'Inline math $a+b$ and block:\n\n$$c=d$$';
    const ast = parser.parse(markdown);
    const mathOptions = {
      ...options,
      math: { output: 'katex' },
    } as ConversionOptions;
    const result = converter.convert(ast, mathOptions);

    expect(result).toContain('katex');
  });

  it('should render inline markdown inside table cells', () => {
    const markdown = '| **A** | B |\n|---|---|\n| 1 | **2** |';
    const ast = parser.parse(markdown);
    const result = converter.convert(ast, options);

    expect(result).toContain('<strong>A</strong>');
    expect(result).toContain('<strong>2</strong>');
  });

  it('should render merged table cells with markers', () => {
    const markdown = '| A | B | C |\n|---|---|---|\n| 1 | 同左 | 3 |\n| 同上 | 同左 | 6 |';
    const ast = parser.parse(markdown);
    const mergeOptions = {
      ...options,
      table: { ...options.table, enableMergedCells: true },
    } as ConversionOptions;
    const result = converter.convert(ast, mergeOptions);

    expect(result).toContain('rowspan="2"');
    expect(result).toContain('colspan="2"');
    expect(result).not.toContain('同上');
    expect(result).not.toContain('同左');
  });
});
