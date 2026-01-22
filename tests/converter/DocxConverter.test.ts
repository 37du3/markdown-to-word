import { describe, it, expect } from 'vitest';
import { DocxConverter } from '../../src/utils/converter/DocxConverter';
import { Table } from 'docx';
import { MarkdownParser } from '../../src/utils/parser/MarkdownParser';
import type { ConversionOptions } from '../../src/types';

describe('DocxConverter', () => {
  const parser = new MarkdownParser();
  const converter = new DocxConverter();

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
      output: 'latex',
    },
  };

  it('should convert markdown to docx blob', async () => {
    const markdown = '# Hello\n\nWorld';
    const ast = parser.parse(markdown);

    const result = await converter.convert(ast, options);

    expect(result.success).toBe(true);
    expect(result.docx).toBeInstanceOf(Blob);
    expect(result.docx?.type).toContain('word');
  });

  it('should include document metadata', async () => {
    const markdown = 'Content';
    const ast = parser.parse(markdown);
    const docxOptions = {
      title: 'Test Document',
      author: 'Test Author',
    };

    const result = await converter.convert(ast, options, docxOptions);

    expect(result.success).toBe(true);
  });

  it('should include tables in document children', async () => {
    const markdown = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    const ast = parser.parse(markdown);
    const children = await (converter as any).buildDocumentChildren(ast, options);

    expect(children.some((child: any) => child instanceof Table)).toBe(true);
  });

  it('should strip inline markdown in table cells', async () => {
    const markdown = '| **A** | B |\n| --- | --- |\n| 1 | **2** |';
    const ast = parser.parse(markdown);
    const children = await (converter as any).buildDocumentChildren(ast, options);
    const table = children.find((child: any) => child instanceof Table);

    const text = extractTableText(table as Table).join(' ');
    expect(text).toContain('A');
    expect(text).toContain('2');
    expect(text).not.toContain('**');
  });

  it('should apply rowspan and colspan for merged cells', async () => {
    const markdown = '| A | B | C |\n|---|---|---|\n| 1 | 同左 | 3 |\n| 同上 | 同左 | 6 |';
    const ast = parser.parse(markdown);
    const mergeOptions: ConversionOptions = {
      ...options,
      table: { ...options.table, enableMergedCells: true },
    };
    const children = await (converter as any).buildDocumentChildren(ast, mergeOptions);
    const table = children.find((child: any) => child instanceof Table);

    const props = findCellProps(table as Table, 1, 0);
    const gridSpan = props?.root?.find((node: any) => node.rootKey === 'w:gridSpan');
    const vMerge = props?.root?.find((node: any) => node.rootKey === 'w:vMerge');

    expect(gridSpan?.root?.[0]?.root?.val).toBe(2);
    expect(vMerge?.root?.[0]?.root?.val).toBe('restart');
  });
});

function extractTableText(table: Table): string[] {
  const rows = ((table as any).root || []).filter((node: any) => node.rootKey === 'w:tr');
  const texts: string[] = [];

  rows.forEach((row: any) => {
    const cells = (row.root || []).filter((node: any) => node.rootKey === 'w:tc');
    cells.forEach((cell: any) => {
      const paragraphs = (cell.root || []).filter((node: any) => node.rootKey === 'w:p');
      paragraphs.forEach((paragraph: any) => {
        const runs = (paragraph.root || []).filter((node: any) => node.rootKey === 'w:r');
        runs.forEach((run: any) => {
          const textNode = (run.root || []).find((node: any) => node.rootKey === 'w:t');
          const value = textNode?.root?.[1];
          if (typeof value === 'string') {
            texts.push(value);
          }
        });
      });
    });
  });

  return texts;
}

function findCellProps(table: Table, rowIndex: number, cellIndex: number) {
  const rows = ((table as any).root || []).filter((node: any) => node.rootKey === 'w:tr');
  const row = rows[rowIndex];
  if (!row) return null;
  const cells = (row.root || []).filter((node: any) => node.rootKey === 'w:tc');
  const cell = cells[cellIndex];
  if (!cell) return null;
  return (cell.root || []).find((node: any) => node.rootKey === 'w:tcPr') || null;
}
