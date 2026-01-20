/* eslint-disable */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell } from 'docx';
import type {
  MarkdownAST,
  MarkdownTokens,
  ConversionOptions,
  DocxDocumentOptions,
} from '../../types';
import { stripMathDelimiters } from '../math/MathText';

export class DocxConverter {
  async convert(
    ast: MarkdownAST,
    options: ConversionOptions,
    docxOptions?: DocxDocumentOptions
  ): Promise<{ success: boolean; docx?: Blob; error?: Error }> {
    try {
      const children = this.buildDocumentChildren(ast, options);

      const doc = new Document({
        sections: [
          {
            properties: {},
            children,
          },
        ],
        ...this.createDocumentProperties(docxOptions),
      });

      const blob = await Packer.toBlob(doc);
      return { success: true, docx: blob };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Docx conversion failed'),
      };
    }
  }

  buildDocumentChildren(ast: MarkdownAST, options: ConversionOptions): (Paragraph | Table)[] {
    return ast.tokens
      .map((token) => this.convertToken(token, options))
      .flat()
      .filter(Boolean) as (Paragraph | Table)[];
  }

  private convertToken(token: MarkdownTokens, options: ConversionOptions): (Paragraph | Table)[] {
    switch (token.type) {
      case 'heading':
        return [this.convertHeading(token)];
      case 'paragraph':
        return [this.convertParagraph(token, options)];
      case 'code':
        return [this.convertCodeBlock(token)];
      case 'list':
        return this.convertList(token, options);
      case 'table':
        return [this.convertTable(token, options)];
      default:
        return [];
    }
  }

  private convertHeading(token: MarkdownTokens): Paragraph {
    const level = token.depth || 1;
    const text = token.text || '';

    return new Paragraph({
      text,
      heading: this.getHeadingLevel(level),
    });
  }

  private convertParagraph(token: MarkdownTokens, options: ConversionOptions): Paragraph {
    const text = this.convertInlineText(token.tokens || [], token.text || '', options);

    return new Paragraph({
      children: [
        new TextRun({
          text,
          font: options.text.fontFamily,
          size: options.text.fontSize * 2,
        }),
      ],
    });
  }

  private convertCodeBlock(token: MarkdownTokens): Paragraph {
    return new Paragraph({
      text: token.text || '',
      style: 'Code',
    });
  }

  private convertList(token: MarkdownTokens, options: ConversionOptions): Paragraph[] {
    if (!token.items) return [];
    return token.items.map((item) =>
      new Paragraph({
        text: this.convertInlineText(item.tokens || [], item.text || '', options),
      })
    );
  }

  private convertTable(token: MarkdownTokens, options: ConversionOptions): Table {
    const tableData = token.tableData;
    if (!tableData) {
      return new Table({ rows: [] });
    }

    const headerRow = new TableRow({
      children: tableData.headers
        .map((cell, colIndex) => {
          if (options.table.enableMergedCells && cell.mergeWithPrevious) {
            return null;
          }

          const text = this.convertInlineText(cell.tokens || [], cell.content, options);
          const colSpan = options.table.enableMergedCells
            ? this.calculateColspan(tableData.headers, colIndex)
            : cell.colspan || 1;

          return new TableCell({
            columnSpan: colSpan > 1 ? colSpan : undefined,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text,
                    bold: true,
                    font: options.text.fontFamily,
                    size: options.text.fontSize * 2,
                  }),
                ],
              }),
            ],
          });
        })
        .filter(Boolean) as TableCell[],
    });

    const bodyRows = tableData.rows.map((row, rowIndex) => {
      return new TableRow({
        children: row.cells
          .map((cell, colIndex) => {
            if (options.table.enableMergedCells && cell.mergeWithPrevious) {
              return null;
            }

            const text = this.convertInlineText(cell.tokens || [], cell.content, options);
            const rowSpan = options.table.enableMergedCells
              ? this.calculateRowspan(tableData.rows, rowIndex, colIndex)
              : cell.rowspan || 1;
            const colSpan = options.table.enableMergedCells
              ? this.calculateColspan(row.cells, colIndex)
              : cell.colspan || 1;

            return new TableCell({
              rowSpan: rowSpan > 1 ? rowSpan : undefined,
              columnSpan: colSpan > 1 ? colSpan : undefined,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text,
                      font: options.text.fontFamily,
                      size: options.text.fontSize * 2,
                    }),
                  ],
                }),
              ],
            });
          })
          .filter(Boolean) as TableCell[],
      });
    });

    return new Table({
      rows: [headerRow, ...bodyRows],
    });
  }

  private convertInlineText(
    tokens: MarkdownTokens[],
    fallbackText: string,
    options: ConversionOptions
  ): string {
    if (!tokens || tokens.length === 0) {
      return fallbackText;
    }

    return tokens
      .map((token) => {
        if (token.type === 'text') {
          return token.text || '';
        }
        if (
          token.type === 'math' ||
          token.type === 'inlineMath' ||
          token.type === 'inlineKatex' ||
          token.type === 'blockKatex'
        ) {
          return this.convertMathText(token, options);
        }
        if (token.text) {
          return token.text;
        }
        if (token.raw) {
          return token.raw;
        }
        return '';
      })
      .join('');
  }

  private convertMathText(token: MarkdownTokens, options: ConversionOptions): string {
    const raw = token.raw || '';
    const text = token.text || stripMathDelimiters(raw);

    if (options.math.output === 'latex') {
      const isBlock = token.type === 'math' || token.type === 'blockKatex';
      return raw || this.wrapMath(text, isBlock);
    }

    return text;
  }

  private wrapMath(latex: string, isBlock: boolean): string {
    if (!latex) return '';
    return isBlock ? `$$${latex}$$` : `$${latex}$`;
  }

  private calculateRowspan(rows: { cells: { content: string; mergeWithPrevious?: boolean }[] }[], rowIndex: number, colIndex: number): number {
    let rowspan = 1;
    for (let i = rowIndex + 1; i < rows.length; i += 1) {
      const cell = rows[i].cells[colIndex];
      if (cell?.mergeWithPrevious && this.isVerticalMergeMarker(cell.content)) {
        rowspan += 1;
      } else {
        break;
      }
    }
    return rowspan;
  }

  private calculateColspan(cells: { content: string; mergeWithPrevious?: boolean }[], startIndex: number): number {
    let colspan = 1;
    for (let i = startIndex + 1; i < cells.length; i += 1) {
      const cell = cells[i];
      if (cell?.mergeWithPrevious && this.isHorizontalMergeMarker(cell.content)) {
        colspan += 1;
      } else {
        break;
      }
    }
    return colspan;
  }

  private isVerticalMergeMarker(content: string): boolean {
    return ['↑', '同上'].includes(content.trim());
  }

  private isHorizontalMergeMarker(content: string): boolean {
    return ['→', '同左'].includes(content.trim());
  }

  private getHeadingLevel(level: number): HeadingLevel {
    const levels = [
      HeadingLevel.HEADING_1,
      HeadingLevel.HEADING_2,
      HeadingLevel.HEADING_3,
      HeadingLevel.HEADING_4,
      HeadingLevel.HEADING_5,
      HeadingLevel.HEADING_6,
    ];
    return levels[Math.min(level - 1, 5)];
  }

  private createDocumentProperties(options?: DocxDocumentOptions) {
    if (!options) return {};

    return {
      title: options.title,
      creator: options.author,
      description: options.subject,
      keywords: options.properties?.keywords?.join(', '),
      created: options.createdAt,
      modified: options.modifiedAt,
    };
  }
}
