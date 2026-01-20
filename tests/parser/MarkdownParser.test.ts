import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../../src/utils/parser/MarkdownParser';

describe('MarkdownParser', () => {
  const parser = new MarkdownParser();

  it('should parse basic markdown', () => {
    const markdown = '# Hello World\n\nThis is a **bold** text.';
    const result = parser.parse(markdown);
    expect(result.type).toBe('root');
    expect(result.tokens).toBeDefined();
    expect(result.tokens.length).toBeGreaterThan(0);
  });

  it('should parse headings', () => {
    const markdown = '# H1\n## H2\n### H3';
    const result = parser.parse(markdown);
    expect(result.tokens.some(t => t.type === 'heading')).toBe(true);
  });

  it('should parse paragraphs', () => {
    const markdown = 'Paragraph 1\n\nParagraph 2';
    const result = parser.parse(markdown);
    expect(result.tokens.some(t => t.type === 'paragraph')).toBe(true);
  });

  it('should parse lists', () => {
    const markdown = '- Item 1\n- Item 2';
    const result = parser.parse(markdown);
    expect(result.tokens.some(t => t.type === 'list')).toBe(true);
  });

  it('should parse inline markdown', () => {
    const markdown = '**bold** and *italic* and `code`';
    const result = parser.parseInline(markdown);
    expect(result).toBeDefined();
    expect(Array.isArray(result) ? result.length : 0).toBeGreaterThan(0);
  });

  it('should get statistics', () => {
    const markdown = '# Test\n\nPara\n\n- Item 1';
    const result = parser.getStats(markdown);
    expect(result.headings).toBe(1);
    expect(result.paragraphs).toBe(1);
    expect(result.lists).toBe(1);
    expect(result.codeBlocks).toBe(0);
  });

  it('should parse code blocks', () => {
    const markdown = '```javascript\nconst x = 1;\n```';
    parser.parse(markdown);
    const stats = parser.getStats(markdown);
    expect(stats.codeBlocks).toBe(1);
  });

  it('should attach table data to table tokens', () => {
    const markdown = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    const result = parser.parse(markdown);
    const tableToken = result.tokens.find(t => t.type === 'table');
    expect(tableToken).toBeDefined();
    expect(tableToken?.tableData).toBeDefined();
    expect(tableToken?.tableData?.headers).toHaveLength(2);
    expect(tableToken?.tableData?.rows).toHaveLength(1);
  });
});
